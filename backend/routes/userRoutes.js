// =========================================================
// userRoutes.js — maps REST endpoints to controller functions
// =========================================================

const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);        // GET    /api/users
router.get("/:id", getUser);      // GET    /api/users/:id
router.post("/", createUser);     // POST   /api/users
router.put("/:id", updateUser);   // PUT    /api/users/:id
router.delete("/:id", deleteUser); // DELETE /api/users/:id

module.exports = router;
