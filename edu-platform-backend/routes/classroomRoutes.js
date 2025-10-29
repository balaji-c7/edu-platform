// classroomRoutes.js

const express = require("express");
const router = express.Router();

const {
  createClassroom,
  getClassroomById,
  getAllClassrooms,
  addStudentToClassroom,
} = require("../controllers/classroomController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/roleCheck");

// Only teacher or admin can create a classroom
router.post(
  "/create",
  verifyToken,
  checkRole("teacher", "admin"),
  createClassroom
);
router.get(
  "/all",
  verifyToken,
  checkRole("teacher", "admin", "student"), // all roles can view
  getAllClassrooms
);

// Get details of a specific classroom by ID
router.get(
  "/:id",
  verifyToken,
  checkRole("teacher", "admin", "student"), // Optional: allow all roles
  getClassroomById
);
// ✅ Teacher/Admin adds student to a classroom
router.post(
  "/add-student",
  verifyToken,
  checkRole("teacher", "admin"),
  addStudentToClassroom
);
module.exports = router;
