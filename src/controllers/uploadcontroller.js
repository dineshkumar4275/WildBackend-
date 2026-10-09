const cloudinary = require("../config/cloudinary");
const sharp = require("sharp");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log("📸 Upload started");
    console.log("Original name:", req.file.originalname);
    console.log("Mime type:", req.file.mimetype);
    console.log("Size:", req.file.size);

    let bufferToUpload = req.file.buffer;

    /* 🔥 SKIP SHARP FOR HEIC/HEIF */
    const isHeic =
      req.file.mimetype === "image/heic" ||
      req.file.mimetype === "image/heif" ||
      req.file.originalname?.toLowerCase().endsWith(".heic") ||
      req.file.originalname?.toLowerCase().endsWith(".heif");

    if (!isHeic) {
      try {
        // Only compress non-HEIC images
        bufferToUpload = await sharp(req.file.buffer)
          .resize(1600, 1600, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        console.log("✅ Sharp processing done");
      } catch (sharpError) {
        console.log("⚠️ Sharp failed, using original:", sharpError?.message);
        bufferToUpload = req.file.buffer;
      }
    } else {
      console.log("⚠️ HEIC detected, skipping Sharp");
    }

    /* Upload to Cloudinary */
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "animal-marketplace/listings",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(bufferToUpload);
    });

    return res.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("[uploadImage] Error:", error?.message);

    return res.status(500).json({
      success: false,
      error: error?.message || "Upload failed",
      message: "Upload failed",
    });
  }
};