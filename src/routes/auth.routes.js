const router = require("express").Router();

const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

// Send OTP
router.post("/send-otp", ctrl.sendOTP);

// Verify OTP
router.post("/verify-otp", ctrl.verifyOTP);

// Get logged-in user
router.get("/me", authRequired, ctrl.me);

module.exports = router;