const pool = require("../config/db");

const prisma = require("../prisma");   
const reverseGeocode = async (latitude, longitude) => {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}` +
      `&zoom=18` +
      `&addressdetails=1`;

    console.log("🌍 Reverse geocoding URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "AnimalMarketplaceApp/1.0 (location service)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log("=================================");
    console.log("🗺️ NOMINATIM RESPONSE");
    console.log(JSON.stringify(data, null, 2));
    console.log("=================================");

    return data;
  } catch (error) {
    console.error(
      "❌ REVERSE GEOCODE ERROR:",
      error.message
    );

    return null;
  }
};

// ==========================================================
// UPDATE USER LOCATION
// PUT /api/users/location
// ==========================================================

const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      latitude,
      longitude,
      street,
      address_line1,
      address_line2,
      landmark,
      area,
      city,
      district,
      state,
      country,
      pincode,
      phone,
      mobile,
    } = req.body;

    // ======================================================
    // VALIDATE GPS
    // ======================================================

    const lat =
      latitude !== undefined && latitude !== null
        ? Number(latitude)
        : null;

    const lng =
      longitude !== undefined && longitude !== null
        ? Number(longitude)
        : null;

    if (
      lat !== null &&
      (Number.isNaN(lat) || lat < -90 || lat > 90)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });
    }

    if (
      lng !== null &&
      (Number.isNaN(lng) || lng < -180 || lng > 180)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });
    }

    // ======================================================
    // ADDRESS
    //
    // Your users table DOES NOT have `street`.
    // We store street/area in address_line1.
    // ======================================================

    const finalAddressLine1 =
      address_line1 ||
      street ||
      area ||
      null;

    const finalPhone =
      phone ||
      mobile ||
      null;

    // ======================================================
    // UPDATE USER
    // ======================================================

    const updatedUser = await prisma.users.update({
      where: {
        id: Number(userId),
      },

      data: {
        ...(finalAddressLine1 !== null && {
          address_line1: String(finalAddressLine1).trim(),
        }),

        ...(address_line2 !== undefined && {
          address_line2: address_line2
            ? String(address_line2).trim()
            : null,
        }),

        ...(landmark !== undefined && {
          landmark: landmark
            ? String(landmark).trim()
            : null,
        }),

        ...(city !== undefined && {
          city: city
            ? String(city).trim()
            : null,
        }),

        ...(district !== undefined && {
          district: district
            ? String(district).trim()
            : null,
        }),

        ...(state !== undefined && {
          state: state
            ? String(state).trim()
            : null,
        }),

        ...(country !== undefined && {
          country: country
            ? String(country).trim()
            : "India",
        }),

        ...(pincode !== undefined && {
          pincode: pincode
            ? String(pincode).trim()
            : null,
        }),

        ...(finalPhone !== null && {
          phone: String(finalPhone).trim(),
          mobile: String(finalPhone).trim(),
        }),

        ...(lat !== null && {
          latitude: lat,
        }),

        ...(lng !== null && {
          longitude: lng,
        }),

        address_updated_at: new Date(),
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        mobile: true,
        address_line1: true,
        address_line2: true,
        landmark: true,
        city: true,
        district: true,
        state: true,
        country: true,
        pincode: true,
        latitude: true,
        longitude: true,
        address_updated_at: true,
      },
    });

    // ======================================================
    // SUCCESS
    // ======================================================

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("❌ UPDATE LOCATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save location",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};
module.exports = {
  updateUserLocation,
};