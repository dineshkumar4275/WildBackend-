import prisma from "../prisma.js";
import jwt from "jsonwebtoken";

import { sendOTPEmail } from "../utils/email.js";

// =====================================================
// TEMPORARY OTP STORAGE
// =====================================================

const otpStore = new Map();

// =====================================================
// CONSTANTS
// =====================================================

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// =====================================================
// HELPERS
// =====================================================

function normalizeEmail(email) {
  let cleanEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!cleanEmail.includes("@")) {
    cleanEmail += "@gmail.com";
  }

  return cleanEmail;
}

// =====================================================
// EMAIL VALIDATION
// =====================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================================
// OTP
// =====================================================

function generateOTP() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

// =====================================================
// ROLE
// =====================================================

function normalizeRole(role) {
  const cleanRole = String(role || "")
    .trim()
    .toUpperCase();

  if (cleanRole === "SELLER") {
    return "SELLER";
  }

  return "BUYER";
}

// =====================================================
// JWT
// =====================================================

function createToken(userId, activeRole) {
  return jwt.sign(
    {
      id: userId,
      role: activeRole,
      activeRole,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "30d",
    }
  );
}

// =====================================================
// CHECK SELLER PROFILE
// =====================================================

async function getSellerProfile(userId) {
  return prisma.seller_profiles.findUnique({
    where: {
      user_id: userId,
    },
  });
}

// =====================================================
// SEND REGISTRATION OTP
// =====================================================

export const sendOTP = async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      role = "BUYER",
      mode = "register",
    } = req.body;

    console.log("\n=================================");
    console.log("📩 OTP REQUEST");
    console.log("Email:", email);
    console.log("Name:", name);
    console.log("Phone:", phone);
    console.log("Role:", role);
    console.log("Mode:", mode);
    console.log("=================================\n");

    // =================================================
    // EMAIL
    // =================================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // =================================================
    // LOGIN DOES NOT USE OTP
    // =================================================

    if (mode === "login") {
      return res.status(400).json({
        success: false,
        message:
          "Login does not require OTP. Use /auth/login",
      });
    }

    // =================================================
    // ROLE
    // =================================================

    const cleanRole = normalizeRole(role);

    console.log(
      `📝 Registration role: ${cleanRole}`
    );

    // =================================================
    // NAME
    // =================================================

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // =================================================
    // PHONE
    // =================================================

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();

    // =================================================
    // CHECK EXISTING USER BY EMAIL
    // =================================================

    const existingUser =
      await prisma.users.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    // =================================================
    // EXISTING USER
    // =================================================

    if (existingUser) {
      // -----------------------------------------------
      // SELLER REGISTRATION
      // -----------------------------------------------

      if (cleanRole === "SELLER") {
        const sellerProfile =
          await getSellerProfile(existingUser.id);

        // Already seller
        if (sellerProfile) {
          return res.json({
            success: true,
            existingAccount: true,
            alreadySeller: true,
            role: "SELLER",
            message:
              "Seller account already exists. Please login as seller.",
          });
        }

        // Existing user can become seller.
        // Send OTP for seller activation.
        console.log(
          "👤 Existing user found. Seller profile will be added after OTP."
        );
      }

      // -----------------------------------------------
      // BUYER REGISTRATION
      // -----------------------------------------------

      if (cleanRole === "BUYER") {
        // Existing account can simply use buyer login
        return res.json({
          success: true,
          existingAccount: true,
          alreadyBuyer: true,
          role: "BUYER",
          message:
            "Buyer account already exists. Please login as buyer.",
        });
      }
    }

    // =================================================
    // PHONE CHECK
    // =================================================

    const phoneUser =
      await prisma.users.findFirst({
        where: {
          phone: cleanPhone,
        },
      });

    if (
      phoneUser &&
      (!existingUser ||
        phoneUser.id !== existingUser.id)
    ) {
      return res.status(409).json({
        success: false,
        error: "PHONE_ALREADY_REGISTERED",
        message:
          "This phone number is already registered with another account.",
      });
    }

    // =================================================
    // GENERATE OTP
    // =================================================

    const otp = generateOTP();

    const otpKey =
      `${cleanRole}:${cleanEmail}`;

    otpStore.set(otpKey, {
      otp,
      expiresAt:
        Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      mode: "register",

      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      role: cleanRole,

      existingUserId:
        existingUser?.id || null,
    });

    console.log(
      `📧 Sending ${cleanRole} OTP to ${cleanEmail}`
    );

    // =================================================
    // SEND EMAIL
    // =================================================

    await sendOTPEmail(
      cleanEmail,
      otp,
      cleanName
    );

    console.log(
      `✅ ${cleanRole} OTP SENT`
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,
      message: "OTP sent to email",
      role: cleanRole,

      // DEVELOPMENT ONLY
      testOTP: otp,
    });
  } catch (error) {
    console.error(
      "❌ Send OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to send OTP",
    });
  }
};

// =====================================================
// VERIFY REGISTRATION OTP
// =====================================================

export const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
      role = "BUYER",
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const cleanEmail =
      normalizeEmail(email);

    const cleanOtp =
      String(otp).trim();

    const cleanRole =
      normalizeRole(role);

    // =================================================
    // OTP KEY
    // =================================================

    const otpKey =
      `${cleanRole}:${cleanEmail}`;

    // =================================================
    // GET OTP
    // =================================================

    const stored =
      otpStore.get(otpKey);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message:
          "No OTP found. Please request a new OTP.",
      });
    }

    // =================================================
    // EXPIRY
    // =================================================

    if (
      Date.now() >
      stored.expiresAt
    ) {
      otpStore.delete(otpKey);

      return res.status(400).json({
        success: false,
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    // =================================================
    // OTP CHECK
    // =================================================

    if (stored.otp !== cleanOtp) {
      stored.attempts += 1;

      if (
        stored.attempts >=
        MAX_OTP_ATTEMPTS
      ) {
        otpStore.delete(otpKey);

        return res.status(400).json({
          success: false,
          message:
            "Too many invalid attempts. Please request a new OTP.",
          attemptsLeft: 0,
        });
      }

      otpStore.set(
        otpKey,
        stored
      );

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft:
          MAX_OTP_ATTEMPTS -
          stored.attempts,
      });
    }

    // =================================================
    // OTP VERIFIED
    // =================================================

    otpStore.delete(otpKey);

    console.log("=================================");
    console.log("✅ OTP VERIFIED");
    console.log("Email:", cleanEmail);
    console.log("Role:", cleanRole);
    console.log("=================================");

    // =================================================
    // FIND EXISTING USER
    // =================================================

    let user =
      await prisma.users.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    // =================================================
    // EXISTING USER
    // =================================================

    if (user) {
      // -----------------------------------------------
      // SELLER
      // -----------------------------------------------

      if (cleanRole === "SELLER") {
        let sellerProfile =
          await getSellerProfile(user.id);

        // Create seller profile
        if (!sellerProfile) {
          sellerProfile =
            await prisma.seller_profiles.upsert({
              where: {
                user_id: user.id,
              },
              update: {},
              create: {
                user_id: user.id,
                display_name:
                  user.name ||
                  stored.name ||
                  cleanEmail.split("@")[0],
                verification_status:
                  "PENDING",
              },
            });

          console.log(
            "✅ Seller profile created for existing user"
          );
        }

        // Keep user's base account.
        // DO NOT create another users row.

        return res.status(200).json({
          success: true,
          existingAccount: true,
          role: "SELLER",

          message:
            "Seller registration successful. Seller profile activated. Please login as seller.",

          autoLogin: false,

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone:
              user.phone || null,

            // Active role for this operation
            role: "SELLER",
          },

          sellerProfile,
        });
      }

      // -----------------------------------------------
      // BUYER
      // -----------------------------------------------

      if (cleanRole === "BUYER") {
        return res.status(200).json({
          success: true,
          existingAccount: true,
          alreadyBuyer: true,
          role: "BUYER",

          message:
            "Buyer account already exists. Please login as buyer.",

          autoLogin: false,

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone:
              user.phone || null,
            role: "BUYER",
          },
        });
      }
    }

    // =================================================
    // NEW USER
    // =================================================

    const finalName =
      stored.name ||
      cleanEmail.split("@")[0];

    const finalPhone =
      stored.phone || null;

    // =================================================
    // CREATE NEW USER
    // =================================================

    user =
      await prisma.users.create({
        data: {
          name: finalName,
          email: cleanEmail,
          phone: finalPhone,

          // Base account role.
          // New buyer = BUYER.
          // New seller = SELLER.
          role: cleanRole,

          is_active: true,
        },
      });

    console.log("=================================");
    console.log("🎉 NEW USER CREATED");
    console.log("ID:", user.id);
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("=================================");

    // =================================================
    // SELLER PROFILE
    // =================================================

    let sellerProfile = null;

    if (cleanRole === "SELLER") {
      sellerProfile =
        await prisma.seller_profiles.upsert({
          where: {
            user_id: user.id,
          },
          update: {},
          create: {
            user_id: user.id,
            display_name: user.name,
            verification_status:
              "PENDING",
          },
        });

      console.log(
        "✅ Seller profile created"
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        cleanRole === "SELLER"
          ? "Seller registration successful. Please login."
          : "Buyer registration successful. Please login.",

      autoLogin: false,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || null,
        role: cleanRole,
      },

      sellerProfile,
    });
  } catch (error) {
    console.error(
      "❌ Verify OTP error:",
      error
    );

    // =================================================
    // PRISMA DUPLICATE
    // =================================================

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        error:
          "ACCOUNT_ALREADY_EXISTS",
        message:
          "This account already exists. Please login.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to verify OTP",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

export const login = async (req, res) => {
  try {
    const {
      email,
      role = "BUYER",
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail =
      normalizeEmail(email);

    const cleanRole =
      normalizeRole(role);

    console.log("=================================");
    console.log("🔐 LOGIN REQUEST");
    console.log("Email:", cleanEmail);
    console.log("Role:", cleanRole);
    console.log("=================================");

    // =================================================
    // FIND USER BY EMAIL
    // =================================================

    const user =
      await prisma.users.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    // =================================================
    // USER NOT FOUND
    // =================================================

    if (!user) {
      return res.status(404).json({
        success: false,
        error:
          "ACCOUNT_NOT_REGISTERED",

        role: cleanRole,

        message:
          cleanRole === "SELLER"
            ? "Seller account not registered. Please register as a seller first."
            : "Buyer account not registered. Please register as a buyer first.",
      });
    }

    // =================================================
    // ACCOUNT STATUS
    // =================================================

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        error:
          "ACCOUNT_INACTIVE",
        message:
          "Your account is inactive.",
      });
    }

    // =================================================
    // SELLER LOGIN
    // =================================================

    let sellerProfile = null;

    if (cleanRole === "SELLER") {
      sellerProfile =
        await getSellerProfile(user.id);

      // -----------------------------------------------
      // NO SELLER PROFILE
      // -----------------------------------------------

      if (!sellerProfile) {
        return res.status(404).json({
          success: false,
          error:
            "ACCOUNT_NOT_REGISTERED",

          role: "SELLER",

          message:
            "Seller account not registered. Please register as a seller first.",
        });
      }

      console.log(
        "✅ Seller profile found:",
        sellerProfile.id
      );
    }

    // =================================================
    // BUYER LOGIN
    // =================================================

    if (cleanRole === "BUYER") {
      /*
       * IMPORTANT:
       *
       * Existing USER / SELLER accounts can also
       * login as buyer.
       *
       * We do NOT require users.role === BUYER.
       *
       * Same email can therefore be:
       *
       * BUYER + SELLER
       */

      console.log(
        "✅ Buyer login allowed for existing user"
      );
    }

    // =================================================
    // LAST LOGIN
    // =================================================

    try {
      await prisma.users.update({
        where: {
          id: user.id,
        },

        data: {
          last_login: new Date(),
        },
      });
    } catch (error) {
      console.error(
        "⚠️ Last login update failed:",
        error.message
      );
    }

    // =================================================
    // JWT
    //
    // IMPORTANT:
    // ACTIVE ROLE IS STORED IN TOKEN
    // =================================================

    const token =
      createToken(
        user.id,
        cleanRole
      );

    console.log(
      `✅ ${cleanRole} LOGIN SUCCESS`
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || null,

        // IMPORTANT:
        // This is active login role.
        role: cleanRole,
      },

      sellerProfile:
        cleanRole === "SELLER"
          ? sellerProfile
          : null,
    });
  } catch (error) {
    console.error(
      "❌ Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Login failed",
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

export const me = async (req, res) => {
  try {
    const userId =
      Number(req.user.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    // =================================================
    // USER
    // =================================================

    const user =
      await prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // =================================================
    // ACTIVE ROLE
    // =================================================

    const activeRole =
      String(
        req.user.activeRole ||
        req.user.role ||
        "BUYER"
      )
        .trim()
        .toUpperCase();

    // =================================================
    // SELLER PROFILE
    // =================================================

    let sellerProfile = null;

    const sellerProfileExists =
      await getSellerProfile(user.id);

    if (sellerProfileExists) {
      sellerProfile =
        sellerProfileExists;
    }

    // =================================================
    // USER CAPABILITIES
    // =================================================

    const isSeller =
      Boolean(sellerProfile);

    const isBuyer = true;

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,

        phone:
          user.phone || null,

        // Current login role
        role: activeRole,

        // Available capabilities
        isBuyer,
        isSeller,

        walletBalance: 0,

        sellerProfile:
          sellerProfile || null,
      },
    });
  } catch (error) {
    console.error(
      "❌ GET USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get user",
    });
  }
};