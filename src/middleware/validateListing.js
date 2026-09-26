const { ALLOWED_BREEDS, BLOCKED_KEYWORDS } = require('../config/allowedBreeds');

exports.validateListing = (req, res, next) => {
  const { title, category, breed, description } = req.body;

  if (!ALLOWED_BREEDS[category]) {
    return res.status(400).json({
      error: `Category "${category}" is not allowed. Only domestic animals.`,
    });
  }

  const breedOk = ALLOWED_BREEDS[category].some(
    (b) => b.toLowerCase() === (breed || '').toLowerCase().trim()
  );
  if (!breedOk) {
    return res.status(400).json({
      error: `Breed "${breed}" is not allowed for ${category}.`,
    });
  }

  const combined = `${title} ${description} ${breed}`.toLowerCase();
  const blocked = BLOCKED_KEYWORDS.find((kw) => combined.includes(kw));
  if (blocked) {
    return res.status(400).json({
      error: `Listing contains restricted term "${blocked}".`,
    });
  }

  next();
};