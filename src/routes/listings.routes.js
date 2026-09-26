const router = require('express').Router();
const { authRequired, authOptional } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validateListing } = require('../middleware/validateListing');
const ctrl = require('../controllers/listings.controller');

router.get('/', authOptional, ctrl.getAll);
router.get('/mine', authRequired, requireRole('SELLER', 'ADMIN'), ctrl.mine);
router.get('/:id', authOptional, ctrl.getOne);

router.post(
  '/',
  authRequired,
  requireRole('SELLER', 'ADMIN'),
  validateListing,
  ctrl.create
);

router.delete('/:id', authRequired, ctrl.remove);

// Admin only
router.patch(
  '/:id/approve',
  authRequired,
  requireRole('ADMIN'),
  ctrl.approve
);
router.patch(
  '/:id/reject',
  authRequired,
  requireRole('ADMIN'),
  ctrl.reject
);

module.exports = router;