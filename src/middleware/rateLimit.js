const rateLimit = require("express-rate-limit");

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes.",
  statusCode: 429,
  skip: (req) => process.env.NODE_ENV === "development", // Disable in development
});

// Strict rate limiter for write operations: 10 requests per 15 minutes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many create/update/delete requests, please try again after 15 minutes.",
  statusCode: 429,
  skip: (req) => process.env.NODE_ENV === "development",
});

module.exports = {
  generalLimiter,
  strictLimiter,
};
