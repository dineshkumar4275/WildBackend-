const router = require("express").Router();

const { authRequired } =
  require("../middleware/authMiddleware");

const ctrl =
  require("../controllers/auth.controller");

// =====================================================
// REGISTER
// =====================================================

// Send registration OTP
router.post(
  "/send-otp",
  ctrl.sendOTP
);

// Verify registration OTP
router.post(
  "/verify-otp",
  ctrl.verifyOTP
);

// =====================================================
// LOGIN
// =====================================================

// Login WITHOUT OTP
router.post(
  "/login",
  ctrl.login
);

// =====================================================
// CURRENT USER
// =====================================================

router.get(
  "/me",
  authRequired,
  ctrl.me
);

module.exports = router;