import express from "express";
const router = express.Router();

// Import user controller
import userController from "./controller.js";

// User routes
router.get("/", userController.getAllUsers); // GET /api/users - Get all users
router.get("/id/:id", userController.getUserById); // GET /api/users/id/:id - Get user by ID
router.get("/username/:username", userController.getUserByUsername); // GET /api/users/username/:username - Get user by username
router.get("/email/:email", userController.getUserByEmail); // GET /api/users/email/:email - Get user by email
router.post("/", userController.createUser); // POST /api/users - Create new user
router.put("/:id", userController.updateUser); // PUT /api/users/:id - Update user
router.delete("/:id", userController.deleteUser); // DELETE /api/users/:id - Delete user

export default router;
