const express = require("express");

const {
  getCategories,
  getBreedsByCategory,
} = require("../controllers/categories.controller");

const router = express.Router();

// Get all active categories
router.get("/", getCategories);

// Get breeds for selected category
router.get("/:categoryId/breeds", getBreedsByCategory);

module.exports = router;