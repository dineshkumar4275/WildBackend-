const express = require("express");

const router = express.Router();

const { authRequired } = require("../middleware/authMiddleware");

const deviceController = require("../controllers/device.controller");

router.post(
  "/register",
  authRequired,
  deviceController.registerDevice
);

module.exports = router;