// =========================================================
// userModel.js — direct database operations for the users table
// All queries are parameterized ("?") to prevent SQL injection.
// =========================================================

const pool = require("../config/db");

// Fetch all users, most recently added first
async function getAllUsers() {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone FROM users ORDER BY id DESC"
  );
  return rows;
}

// Fetch a single user by ID
async function getUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

// Insert a new user, return the created row
async function createUser({ name, email, phone }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
    [name, email, phone]
  );
  return getUserById(result.insertId);
}

// Update an existing user, return the updated row (or null if not found)
async function updateUser(id, { name, email, phone }) {
  const [result] = await pool.query(
    "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
    [name, email, phone, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getUserById(id);
}

// Delete a user, return true if a row was removed
async function deleteUser(id) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Check whether an email is already used by a different user
// (excludeId is used during edits so a user doesn't collide with itself)
async function findByEmail(email, excludeId = null) {
  const query = excludeId
    ? "SELECT id FROM users WHERE email = ? AND id != ?"
    : "SELECT id FROM users WHERE email = ?";
  const params = excludeId ? [email, excludeId] : [email];

  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findByEmail,
};
