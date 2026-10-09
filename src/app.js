require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error');
const conversationsRoutes = require("./routes/conversations.routes");
const messagesRoutes = require("./routes/messages.routes");
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now(), env: process.env.NODE_ENV });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/listings', require('./routes/listings.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use(
  "/api/conversations",
  conversationsRoutes
);
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
app.use(
  "/api/messages",
  messagesRoutes
);
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use(errorHandler);

module.exports = app;