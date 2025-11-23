// routes/classroomRoutes.js

const express = require("express");
const router = express.Router();

const {
  createClassroom,
  getClassroomById,
  getAllClassrooms,
  getMyClassrooms,
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

// 🔓 PUBLIC: Get all classrooms (for listing on classrooms page)
router.get("/all", getAllClassrooms);

// 🔐 Get only classrooms where current user is a member (dashboard)
router.get(
  "/my",
  verifyToken,
  checkRole("teacher", "admin", "student"),
  getMyClassrooms
);

// Get details of a specific classroom by ID
router.get(
  "/:id",
  verifyToken,
  checkRole("teacher", "admin", "student"),
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
