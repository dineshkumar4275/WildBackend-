const jwt = require("jsonwebtoken");

const SECRET =
  process.env.JWT_SECRET || "dev-secret-change-me";

const EXPIRES =
  process.env.JWT_EXPIRES_IN || "7d";

exports.signToken = (userId) =>
  jwt.sign(
    { userId },
    SECRET,
    { expiresIn: EXPIRES }
  );

exports.verifyToken = (token) =>
  jwt.verify(token, SECRET);