const {
  BLOCKED_KEYWORDS,
} = require("../config/allowedBreeds");

// const { validate: isUuid } = require("uuid");

exports.validateListing = (req, res, next) => {
  try {
    const {
      title,
      category_id,
      breed_id,
      description,
      price,
      negotiable,
      gender,
      age,
      weight,
      colour,
      location,
      images,
    } = req.body;

    // =====================================================
    // TITLE
    // =====================================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Listing title is required.",
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Listing title must contain at least 3 characters.",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        error: "Listing title cannot exceed 200 characters.",
      });
    }

    // =====================================================
    // CATEGORY ID
    // =====================================================

    if (!category_id) {
      return res.status(400).json({
        success: false,
        error: "Category is required.",
      });
    }

    // if (!isUuid(category_id)) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Invalid category ID.",
    //   });
    // }

    // =====================================================
    // BREED ID
    // =====================================================

    if (!breed_id) {
      return res.status(400).json({
        success: false,
        error: "Breed is required.",
      });
    }

    // if (!isUuid(breed_id)) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Invalid breed ID.",
    //   });
    // }

    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (description && description.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "Description cannot exceed 5000 characters.",
      });
    }

    // =====================================================
    // PRICE
    // =====================================================

    if (
      price !== undefined &&
      price !== null &&
      price !== ""
    ) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice)) {
        return res.status(400).json({
          success: false,
          error: "Price must be a valid number.",
        });
      }

      if (numericPrice < 0) {
        return res.status(400).json({
          success: false,
          error: "Price cannot be negative.",
        });
      }
    }

    // =====================================================
    // NEGOTIABLE
    // =====================================================

    if (
      negotiable !== undefined &&
      typeof negotiable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        error: "Negotiable must be true or false.",
      });
    }

    // =====================================================
    // GENDER
    // =====================================================

    if (gender) {
      const allowedGender = [
        "MALE",
        "FEMALE",
        "OTHER",
      ];

      if (
        !allowedGender.includes(
          String(gender).toUpperCase()
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid gender.",
        });
      }
    }

    // =====================================================
    // AGE
    // =====================================================

    if (age && String(age).length > 50) {
      return res.status(400).json({
        success: false,
        error: "Age cannot exceed 50 characters.",
      });
    }

    // =====================================================
    // WEIGHT
    // =====================================================

    if (
      weight !== undefined &&
      weight !== null &&
      weight !== ""
    ) {
      const numericWeight = Number(weight);

      if (!Number.isFinite(numericWeight)) {
        return res.status(400).json({
          success: false,
          error: "Weight must be a valid number.",
        });
      }

      if (numericWeight <= 0) {
        return res.status(400).json({
          success: false,
          error: "Weight must be greater than 0.",
        });
      }
    }

    // =====================================================
    // COLOUR
    // =====================================================

    if (colour && String(colour).length > 50) {
      return res.status(400).json({
        success: false,
        error: "Colour cannot exceed 50 characters.",
      });
    }

    // =====================================================
    // LOCATION
    // =====================================================

    if (location !== undefined && location !== null) {
      if (
        typeof location !== "object" ||
        Array.isArray(location)
      ) {
        return res.status(400).json({
          success: false,
          error: "Location must be an object.",
        });
      }

      if (
        location.city &&
        String(location.city).length > 100
      ) {
        return res.status(400).json({
          success: false,
          error: "City cannot exceed 100 characters.",
        });
      }

      if (
        location.area &&
        String(location.area).length > 150
      ) {
        return res.status(400).json({
          success: false,
          error: "Area cannot exceed 150 characters.",
        });
      }

      if (
        location.district &&
        String(location.district).length > 100
      ) {
        return res.status(400).json({
          success: false,
          error: "District cannot exceed 100 characters.",
        });
      }

      if (
        location.state &&
        String(location.state).length > 100
      ) {
        return res.status(400).json({
          success: false,
          error: "State cannot exceed 100 characters.",
        });
      }

      // Latitude is optional
      if (
        location.latitude !== undefined &&
        location.latitude !== null &&
        location.latitude !== ""
      ) {
        const latitude = Number(location.latitude);

        if (
          !Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid latitude.",
          });
        }
      }

      // Longitude is optional
      if (
        location.longitude !== undefined &&
        location.longitude !== null &&
        location.longitude !== ""
      ) {
        const longitude = Number(location.longitude);

        if (
          !Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid longitude.",
          });
        }
      }
    }

    // =====================================================
    // IMAGES
    // =====================================================

    if (images !== undefined && images !== null) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          error: "Images must be an array.",
        });
      }

      if (images.length > 10) {
        return res.status(400).json({
          success: false,
          error: "Maximum 10 images are allowed.",
        });
      }

      for (const image of images) {
        if (!image) {
          return res.status(400).json({
            success: false,
            error: "Invalid image.",
          });
        }

        // Support:
        // "https://..."
        // OR
        // { media_url: "https://..." }

        if (typeof image === "string") {
          if (!image.trim()) {
            return res.status(400).json({
              success: false,
              error: "Invalid image URL.",
            });
          }
        }

        if (
          typeof image === "object" &&
          !image.media_url &&
          !image.url
        ) {
          return res.status(400).json({
            success: false,
            error: "Image URL is required.",
          });
        }
      }
    }

    // =====================================================
    // BLOCKED KEYWORDS
    // =====================================================

    const combined = `
      ${title || ""}
      ${description || ""}
      ${breed_id || ""}
      ${category_id || ""}
      ${colour || ""}
      ${location?.city || ""}
      ${location?.area || ""}
      ${location?.district || ""}
    `.toLowerCase();

    const blocked = BLOCKED_KEYWORDS.find((keyword) =>
      combined.includes(String(keyword).toLowerCase())
    );

    if (blocked) {
      return res.status(400).json({
        success: false,
        error: `Listing contains restricted term "${blocked}".`,
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    next();
  } catch (error) {
    console.error(
      "[VALIDATE LISTING ERROR]",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Listing validation failed.",
      details: error.message,
    });
  }
};