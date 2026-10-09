const router = require("express").Router();

const {
  authRequired,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  uploadImage,
} = require("../controllers/uploadcontroller");

router.post(
  "/image",
  authRequired,
  upload.single("image"),
  uploadImage
);

module.exports = router;