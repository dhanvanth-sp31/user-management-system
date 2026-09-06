// =========================================================
// server.js — Express application entry point
// Responsibilities: load env vars, configure middleware,
// register routes, handle errors, start the HTTP server.
// =========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

const app = express();

// ---------- Middleware ----------
app.use(cors()); // Allows the frontend (different origin) to call this API
app.use(express.json()); // Parses incoming JSON request bodies

// ---------- Health check ----------
app.get("/", (req, res) => {
  res.json({ success: true, message: "User Management API is running." });
});

// ---------- Routes ----------
app.use("/api/users", userRoutes);

// ---------- 404 handler (no route matched) ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------- Central error handler ----------
// Any error passed to next(err) anywhere in the app ends up here.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`User Management API listening on port ${PORT}`);
});
