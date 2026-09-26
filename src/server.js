require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { errorHandler } = require("./middleware/error");
const { verifyEmailConnection } = require("./utils/email");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    env: process.env.NODE_ENV || "development",
  });
});

// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/auth",
  require("./routes/auth.routes")
);

app.use(
  "/api/listings",
  require("./routes/listings.routes")
);

app.use(
  "/api/payments",
  require("./routes/payments.routes")
);

app.use(
  "/api/admin",
  require("./routes/admin.routes")
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

  console.log(
    `📊 Environment: ${
      process.env.NODE_ENV || "development"
    }`
  );

  // Check SMTP connection
  verifyEmailConnection();
});