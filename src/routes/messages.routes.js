
const router = require("express").Router();

const {
  authRequired,
} = require("../middleware/authMiddleware");

const ctrl = require("../controllers/messages.controller");

// Get messages
router.get(
  "/:conversationId",
  authRequired,
  ctrl.getMessages
);

// Send message
router.post(
  "/:conversationId",
  authRequired,
  ctrl.sendMessage
);

module.exports = router;
