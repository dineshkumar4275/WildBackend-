const express = require("express");

const router = express.Router();

// =====================================================
// SEARCH LOCATION
// GET /api/location/search?q=Chennai
// =====================================================

router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    console.log("========================================");
    console.log("📍 LOCATION SEARCH");
    console.log("Query:", query);
    console.log("========================================");

    // Minimum search length
    if (query.length < 3) {
      return res.json({
        results: [],
      });
    }

    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      limit: "5",
      countrycodes: "in",
      "accept-language": "en",
    });

    const nominatimUrl =
      `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    console.log("🌍 Requesting Nominatim...");

    const response = await fetch(nominatimUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",

        // IMPORTANT:
        // Replace this email with your real email.
        "User-Agent":
          "AnimalMarketplace/1.0 (your-email@gmail.com)",
      },
    });

    console.log(
      "🌍 Nominatim status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "❌ Nominatim error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        message: "Location search failed",
        status: response.status,
      });
    }

    const data = await response.json();

    console.log(
      `✅ Results received: ${
        Array.isArray(data) ? data.length : 0
      }`
    );

    return res.json({
      results: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    console.error(
      "❌ LOCATION SEARCH ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to search location",
    });
  }
});

// =====================================================
// REVERSE LOCATION
// GET /api/location/reverse?lat=13.0827&lng=80.2707
// =====================================================

router.get("/reverse", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    console.log("========================================");
    console.log("📍 REVERSE LOCATION");
    console.log("Latitude:", lat);
    console.log("Longitude:", lng);
    console.log("========================================");

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "jsonv2",
      addressdetails: "1",
      "accept-language": "en",
      zoom: "18",
    });

    const nominatimUrl =
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

    const response = await fetch(nominatimUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",

        // IMPORTANT:
        // Replace with your real email.
        "User-Agent":
          "AnimalMarketplace/1.0 (your-email@gmail.com)",
      },
    });

    console.log(
      "🌍 Nominatim reverse status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "❌ Nominatim reverse error:",
        errorText
      );

      return res.status(response.status).json({
        message: "Reverse location lookup failed",
        status: response.status,
      });
    }

    const data = await response.json();

    return res.json({
      result: data,
    });
  } catch (error) {
    console.error(
      "❌ REVERSE LOCATION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to get location address",
    });
  }
});

module.exports = router;