const express = require("express");

const router = express.Router();

const {
  authOptional,
} = require("../middleware/authMiddleware");

const ctrl = require("../controllers/breeds.controller");

router.get(
  "/",
  authOptional,
  ctrl.getByCategory
);

module.exports = router;