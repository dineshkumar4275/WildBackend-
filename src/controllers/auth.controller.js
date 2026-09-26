import prisma from "../prisma.js";
import { sendOTPEmail } from "../utils/email.js";

// =====================================================
// OTP STORE
// =====================================================

const otpStore = new Map();

// =====================================================
// SEND OTP
// POST /api/auth/send-otp
// =====================================================

export const sendOTP = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    if (!cleanEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // 10 minutes expiry
    const expiresAt =
      Date.now() + 10 * 60 * 1000;

    // Save OTP
    otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
      name: name || "",
      phone: phone || "",
    });

    console.log("=================================");
    console.log("📧 OTP GENERATED");
    console.log("Email:", cleanEmail);
    console.log("OTP:", otp);
    console.log("=================================");

    // -------------------------------------------------
    // Send email in background
    // Don't block API response
    // -------------------------------------------------

    sendOTPEmail(
      cleanEmail,
      otp,
      name || cleanEmail.split("@")[0]
    )
      .then(() => {
        console.log("✅ EMAIL SENT SUCCESSFULLY");
      })
      .catch((error) => {
        console.error(
          "❌ EMAIL ERROR:",
          error.message
        );
      });

    // -------------------------------------------------
    // Response immediately
    // -------------------------------------------------

    return res.json({
      success: true,
      message: "OTP sent to your email",

      // DEV TESTING ONLY
      testOTP:
        process.env.NODE_ENV === "development"
          ? otp
          : undefined,
    });

  } catch (error) {
    console.error(
      "❌ SEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

// =====================================================
// VERIFY OTP
// POST /api/auth/verify-otp
// =====================================================

export const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
      name,
      role,
      phone,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanOtp = String(otp).trim();

    console.log("==============================");
    console.log("🔐 VERIFY OTP");
    console.log("Email:", cleanEmail);
    console.log("OTP:", cleanOtp);
    console.log("==============================");

    // Get stored OTP
    const stored = otpStore.get(cleanEmail);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message:
          "No OTP found. Please request a new OTP.",
      });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        success: false,
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    // Check attempts
    if (stored.attempts >= 5) {
      otpStore.delete(cleanEmail);

      return res.status(400).json({
        success: false,
        message:
          "Too many attempts. Please request a new OTP.",
      });
    }

    // Check OTP
    if (stored.otp !== cleanOtp) {
      stored.attempts += 1;

      otpStore.set(
        cleanEmail,
        stored
      );

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft:
          5 - stored.attempts,
      });
    }

    // OTP correct
    otpStore.delete(cleanEmail);

    console.log("✅ OTP VERIFIED");

    // =================================================
    // FIND USER
    // =================================================

    let user = await prisma.users.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    // =================================================
    // CREATE USER
    // =================================================

    if (!user) {
      user = await prisma.users.create({
        data: {
          email: cleanEmail,

          phone: phone || stored.phone || null,

          name:
            name ||
            stored.name ||
            cleanEmail.split("@")[0],

          role:
            role === "SELLER"
              ? "SELLER"
              : "BUYER",
        },
      });

      console.log(
        "✅ NEW USER CREATED:",
        user.id
      );
    } else {
      console.log(
        "✅ EXISTING USER:",
        user.id
      );
    }

    // =================================================
    // JWT
    // =================================================

    const { signToken } =
      await import("../utils/jwt.js");

    const token = signToken(user.id);

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      message:
        "OTP verified successfully",

      token,

      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        walletBalance:
          user.walletBalance,
      },
    });

  } catch (error) {
    console.error(
      "❌ VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while verifying OTP",
    });
  }
};

// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

export const me = async (req, res) => {
  try {
    return res.json({
      success: true,

      user: {
        id: req.user.id,
        email: req.user.email,
        phone: req.user.phone,
        name: req.user.name,
        role: req.user.role,
        walletBalance:
          req.user.walletBalance,
      },
    });

  } catch (error) {
    console.error(
      "❌ GET USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get user",
    });
  }
};