exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Login required",
      });
    }

    if (req.user.isBanned) {
      return res.status(403).json({
        success: false,
        error: "Your account is banned",
      });
    }

    const userRole = String(req.user.role || "")
      .trim()
      .toUpperCase();

    const normalizedAllowedRoles = allowedRoles.map((role) =>
      String(role).trim().toUpperCase()
    );

    console.log("=================================");
    console.log("🛡️ ROLE CHECK");
    console.log("USER ID:", req.user.id);
    console.log("USER ROLE:", userRole);
    console.log("ALLOWED:", normalizedAllowedRoles);
    console.log("=================================");

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Requires one of: ${normalizedAllowedRoles.join(", ")}`,
      });
    }

    next();
  };
};