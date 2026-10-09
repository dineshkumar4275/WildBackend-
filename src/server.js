// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// const { errorHandler } = require("./middleware/error");
// const { verifyEmailConnection } = require("./utils/email");
// const translateRoutes = require("./routes/translate.routes");
// const userRoutes = require("./routes/user.routes");
// const deviceRoutes = require("./routes/device.routes");
// const locationRoutes = require("./routes/location");
// const categoriesRoutes = require("./routes/categories.routes");
// const uploadRoutes = require("./routes/upload.routes");
// const favoritesRoutes = require("./routes/favorites.routes");
// const app = express();

// // =====================================================
// // MIDDLEWARE
// // =====================================================

// app.use(
//   cors({
//     origin: "*",
//   })
// );

// app.use(
//   express.json({
//     limit: "10mb",
//   })
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );

// // =====================================================
// // HEALTH CHECK
// // =====================================================

// app.get("/health", (req, res) => {
//   res.json({
//     ok: true,
//     ts: Date.now(),
//     env: process.env.NODE_ENV || "development",
//   });
// });

// // =====================================================
// // ROUTES
// // =====================================================

// // AUTH
// app.use(
//   "/api/auth",
//   require("./routes/auth.routes")
// );

// // LISTINGS
// app.use(
//   "/api/listings",
//   require("./routes/listings.routes")
// );
// app.use("/api/favorites", favoritesRoutes);
// // USER
// app.use(
//   "/api/user",
//   userRoutes
// );

// // DEVICE / PUSH NOTIFICATION
// app.use(
//   "/api/devices",
//   deviceRoutes
// );

// // LOCATION SEARCH
// app.use(
//   "/api/location",
//   locationRoutes
// );
// app.use("/api/categories", categoriesRoutes);
// // PAYMENTS
// app.use(
//   "/api/payments",
//   require("./routes/payments.routes")
// );
// app.use("/api/translate", translateRoutes);
// // ADMIN
// app.use(
//   "/api/admin",
//   require("./routes/admin.routes")
// );
// app.use("/api/upload", uploadRoutes);
// // =====================================================
// // 404 HANDLER
// // =====================================================

// app.use((req, res) => {
//   res.status(404).json({
//     error: `Route ${req.method} ${req.url} not found`,
//   });
// });

// // =====================================================
// // ERROR HANDLER
// // =====================================================

// app.use(errorHandler);

// // =====================================================
// // START SERVER
// // =====================================================

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log("");
//   console.log("========================================");
//   console.log("🚀 ANIMAL MARKETPLACE BACKEND");
//   console.log("========================================");
//   console.log(
//     `🚀 Server running on http://localhost:${PORT}`
//   );
//   console.log(
//     `📱 LAN access: http://0.0.0.0:${PORT}`
//   );
//   console.log(
//     `📊 Environment: ${
//       process.env.NODE_ENV || "development"
//     }`
//   );
//   console.log("========================================");
//   console.log("");

//   // Check SMTP connection
//   verifyEmailConnection();
// });
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { errorHandler } = require("./middleware/error");
const { verifyEmailConnection } = require("./utils/email");
const translateRoutes = require("./routes/translate.routes");
const userRoutes = require("./routes/user.routes");
const deviceRoutes = require("./routes/device.routes");
const locationRoutes = require("./routes/location");
const categoriesRoutes = require("./routes/categories.routes");
const uploadRoutes = require("./routes/upload.routes");
const favoritesRoutes = require("./routes/favorites.routes");

// 🔥 ADD THESE TWO
const conversationsRoutes = require("./routes/conversations.routes");
const messagesRoutes = require("./routes/messages.routes");

const app = express();

/* MIDDLEWARE */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* HEALTH */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    env: process.env.NODE_ENV || "development",
  });
});
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Wild Backend API is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      listings: "/api/listings",
      conversations: "/api/conversations",
      messages: "/api/messages",
      seller: "/api/seller",
    },
  });
});
/* ROUTES */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/listings", require("./routes/listings.routes"));
app.use("/api/favorites", favoritesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/payments", require("./routes/payments.routes"));
app.use("/api/translate", translateRoutes);
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/upload", uploadRoutes);
app.use("/api/seller", require("./routes/seller"));
// 🔥 ADD THESE
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messagesRoutes);

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
  });
});

/* ERROR */
app.use(errorHandler);

/* START */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("========================================");
  console.log("🚀 ANIMAL MARKETPLACE BACKEND");
  console.log("========================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 LAN access: http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("========================================");
  console.log("");

  verifyEmailConnection();
});