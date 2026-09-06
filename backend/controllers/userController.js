// =========================================================
// userController.js — request handling, validation, and
// HTTP responses. Delegates all database work to userModel.
// =========================================================

const userModel = require("../models/userModel");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s\-]{7,15}$/;

// Shared validation for create/update. Returns an array of
// human-readable error messages; empty array means valid input.
function validateUserInput({ name, email, phone }) {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters.");
  }

  if (!email || typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.push("A valid email address is required.");
  }

  if (!phone || typeof phone !== "string" || !PHONE_PATTERN.test(phone.trim())) {
    errors.push("A valid phone number (7-15 digits) is required.");
  }

  return errors;
}

// GET /api/users
async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("getUsers error:", error.message);
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve users." });
  }
}

// GET /api/users/:id
async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("getUser error:", error.message);
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve user." });
  }
}

// POST /api/users
async function createUser(req, res) {
  try {
    const { name, email, phone } = req.body || {};
    const errors = validateUserInput({ name, email, phone });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(" ") });
    }

    const trimmedEmail = email.trim();
    const existing = await userModel.findByEmail(trimmedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const newUser = await userModel.createUser({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }
    console.error("createUser error:", error);
    res.status(500).json({ success: false, message: "Failed to create user." });
  }
}

// PUT /api/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body || {};
    const errors = validateUserInput({ name, email, phone });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(" ") });
    }

    const trimmedEmail = email.trim();
    const existing = await userModel.findByEmail(trimmedEmail, id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Another user already uses this email.",
      });
    }

    const updatedUser = await userModel.updateUser(id, {
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Another user already uses this email.",
      });
    }
    console.error("updateUser error:", error);
    res.status(500).json({ success: false, message: "Failed to update user." });
  }
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await userModel.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
