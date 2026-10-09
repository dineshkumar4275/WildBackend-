const express = require("express");
const router = express.Router();

const { authRequired } = require("../middleware/authMiddleware");
const favoritesController = require("../controllers/favorites.controller");

/* ==========================================
   GET USER FAVORITES
   GET /api/favorites
========================================== */

router.get("/", authRequired, favoritesController.getAll);

/* ==========================================
   ADD TO FAVORITES
   POST /api/favorites
   Body: { listing_id }
========================================== */

router.post("/", authRequired, favoritesController.add);

/* ==========================================
   REMOVE FROM FAVORITES
   DELETE /api/favorites/:listingId
========================================== */
/* ==========================================
   CHECK IF FAVORITED
   GET /api/favorites/check/:listingId
========================================== */

router.get("/check/:listingId", authRequired, favoritesController.check);

/* ==========================================
   REMOVE FROM FAVORITES
   DELETE /api/favorites/:listingId
========================================== */

router.delete("/:listingId", authRequired, favoritesController.remove);
router.delete("/:listingId", authRequired, favoritesController.remove);

module.exports = router;