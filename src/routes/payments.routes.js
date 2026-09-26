const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const ctrl = require('../controllers/payments.controller');

router.post('/create-order', authRequired, ctrl.createOrder);
router.post('/verify', authRequired, ctrl.verify);
router.get('/my-unlocks', authRequired, ctrl.myUnlocks);

module.exports = router;