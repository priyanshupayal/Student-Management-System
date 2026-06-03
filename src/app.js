require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const studentRoutes = require("./routes/studentRoutes.js");
const { cacheMiddleware, invalidateCache } = require("./middleware/cache.js");
const { generalLimiter, strictLimiter } = require("./middleware/rateLimit.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all requests
app.use("/api/", generalLimiter);

// Apply caching to GET requests
app.use("/api/students", cacheMiddleware);

// API routes
app.use("/api/students", studentRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));

// Serve frontend on root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;