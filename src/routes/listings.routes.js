const router = require("express").Router();

const {
  authRequired,
  authOptional,
} = require("../middleware/authMiddleware");

const {
  requireRole,
} = require("../middleware/role");

const {
  validateListing,
} = require("../middleware/validateListing");

const ctrl = require("../controllers/listings.controller");

// ==========================================
// NEARBY
// GET /api/listings/nearby
// ==========================================

router.get(
  "/nearby",
  authOptional,
  ctrl.nearby
);

// ==========================================
// ALL LISTINGS + SEARCH
// GET /api/listings
//
// /api/listings
// /api/listings?q=dog
// /api/listings?q=cow
// /api/listings?q=murrah
// ==========================================

router.get(
  "/",
  authOptional,
  ctrl.getAll
);

// ==========================================
// MY LISTINGS
// GET /api/listings/mine
// ==========================================

router.get(
  "/mine",
  authRequired,
  ctrl.mine
);

// ==========================================
// APPROVE
// PATCH /api/listings/:id/approve
// ==========================================

router.patch(
  "/:id/approve",
  authRequired,
  requireRole("ADMIN"),
  ctrl.approve
);

// ==========================================
// REJECT
// PATCH /api/listings/:id/reject
// ==========================================

router.patch(
  "/:id/reject",
  authRequired,
  requireRole("ADMIN"),
  ctrl.reject
);

// ==========================================
// SINGLE LISTING
// GET /api/listings/:id
// ==========================================

router.get(
  "/:id",
  authOptional,
  ctrl.getOne
);

// ==========================================
// CREATE
// POST /api/listings
// ==========================================

router.post(
  "/",
  authRequired,
  validateListing,
  ctrl.create
);

// ==========================================
// DELETE
// DELETE /api/listings/:id
// ==========================================

router.delete(
  "/:id",
  authRequired,
  ctrl.remove
);

module.exports = router;