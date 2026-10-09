const express = require("express");
const axios = require("axios");
const router = express.Router();

/* ==========================================
   TRANSLATE ENDPOINT
   POST /api/translate
   Body: { text, targetLang }
   targetLang: "ta" | "ml" | "te"
========================================== */

// 🔥 FREE LINGVA INSTANCES (try multiple)
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://lingva.lunar.icu",
  "https://translate.plausibility.cloud",
];

/* ==========================================
   HELPER: Translate via Lingva
========================================== */

const translateWithLingva = async (text, targetLang) => {
  for (const instance of LINGVA_INSTANCES) {
    try {
      const url = `${instance}/api/v1/en/${targetLang}/${encodeURIComponent(
        text
      )}`;

      console.log("🌐 Trying:", instance);

      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AnimalMarket/1.0)",
        },
      });

      if (
        response?.data?.translation &&
        typeof response.data.translation === "string"
      ) {
        console.log("✅ Success via:", instance);
        return response.data.translation;
      }
    } catch (err) {
      console.log(
        `❌ ${instance} failed:`,
        err?.response?.status || err?.message
      );
      // Try next instance
    }
  }

  // All instances failed
  return null;
};

/* ==========================================
   ROUTE: POST /api/translate
========================================== */

router.post("/", async (req, res) => {
  try {
    const { text, targetLang = "ta" } = req.body;

    console.log("=================================");
    console.log("🌐 TRANSLATE REQUEST");
    console.log("Text:", text);
    console.log("Target:", targetLang);
    console.log("=================================");

    // Validation
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Text is required",
      });
    }

    if (!["ta", "ml", "te"].includes(targetLang)) {
      return res.status(400).json({
        success: false,
        error: "Invalid target language. Use ta, ml, or te.",
      });
    }

    // Trim to avoid huge texts
    const cleanText = text.trim().slice(0, 500);

    if (!cleanText) {
      return res.status(400).json({
        success: false,
        error: "Empty text",
      });
    }

    // Try translation
    const translated = await translateWithLingva(
      cleanText,
      targetLang
    );

    if (!translated) {
      console.log("❌ All instances failed, returning original");
      return res.json({
        success: true,
        original: cleanText,
        translated: cleanText,
        fallback: true,
        message: "Translation unavailable, showing original",
      });
    }

    return res.json({
      success: true,
      original: cleanText,
      translated: translated,
      targetLang,
    });
  } catch (error) {
    console.error("[TRANSLATE ERROR]", error);
    return res.status(500).json({
      success: false,
      error: "Translation failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

module.exports = router;