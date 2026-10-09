
const router = require("express").Router();

const {
  authRequired,
} = require("../middleware/authMiddleware");

const ctrl = require("../controllers/conversations.controller");

// Create or get conversation for a listing
router.post(
  "/",
  authRequired,
  ctrl.createOrGet
);
// Mark conversation as read
router.patch(
  "/:id/read",
  authRequired,
  ctrl.markAsRead
);

// Get buyer/seller's conversations
router.get(
  "/",
  authRequired,
  ctrl.getMyConversations
);

module.exports = router;

