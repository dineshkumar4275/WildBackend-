const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

// ==========================================
// REQUIRED AUTH
// User MUST be logged in
// ==========================================
const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // ==========================================
    // VERIFY JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("=================================");
    console.log("🔐 JWT DECODED:", decoded);
    console.log("=================================");

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded.user_id ||
      decoded.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    // ==========================================
    // GET ACTUAL USER FROM DATABASE
    // ==========================================

    const user = await prisma.users.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        mobile: true,
        role: true,
        is_active: true,
        is_admin: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // ==========================================
    // NORMALIZE ROLE
    // ==========================================

    let role = user.role;

    if (user.is_admin === true) {
      role = "ADMIN";
    } else if (role) {
      role = String(role).trim().toUpperCase();
    }

    // ==========================================
    // FINAL req.user
    // ==========================================

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      mobile: user.mobile,
      role,
      is_active: user.is_active,
      is_admin: user.is_admin,

      // Keep JWT fields also
      ...decoded,

      // IMPORTANT:
      // DB values must override old JWT values
      id: user.id,
      role,
    };

    console.log("=================================");
    console.log("👤 AUTH USER:", {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      is_admin: req.user.is_admin,
    });
    console.log("=================================");

    next();
  } catch (error) {
    console.error("❌ AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// ==========================================
// OPTIONAL AUTH
// ==========================================
const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token → guest
    if (!authHeader) {
      req.user = null;
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("🔓 OPTIONAL JWT DECODED:", decoded);

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded.user_id ||
      decoded.sub;

    if (!userId) {
      req.user = null;
      return next();
    }

    // ==========================================
    // GET CURRENT USER FROM DB
    // ==========================================

    const user = await prisma.users.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        mobile: true,
        role: true,
        is_active: true,
        is_admin: true,
      },
    });

    if (!user || user.is_active === false) {
      req.user = null;
      return next();
    }

    let role = user.role;

    if (user.is_admin === true) {
      role = "ADMIN";
    } else if (role) {
      role = String(role).trim().toUpperCase();
    }

    req.user = {
      ...decoded,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      mobile: user.mobile,
      role,
      is_active: user.is_active,
      is_admin: user.is_admin,
    };

    console.log("=================================");
    console.log("👤 OPTIONAL AUTH USER:", {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
    });
    console.log("=================================");

    next();
  } catch (error) {
    console.log(
      "⚠️ OPTIONAL AUTH IGNORED:",
      error.message
    );

    req.user = null;
    next();
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  authRequired,
  authOptional,
};