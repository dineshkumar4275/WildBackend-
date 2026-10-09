const express = require("express");

const router = express.Router();

const { updateUserLocation } = require("../controllers/userController");

const { authRequired } = require("../middleware/authMiddleware");

router.post(
  "/location",
  authRequired,
  updateUserLocation
);

module.exports = router;