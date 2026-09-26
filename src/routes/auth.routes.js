const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/send-otp', ctrl.sendOtp);
router.post('/verify-otp', ctrl.verifyOtp);
router.get('/me', authRequired, ctrl.me);

module.exports = router;