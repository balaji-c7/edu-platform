// routes/assignmentRoutes.js
const express = require("express");
const router = express.Router();

const {
  createAssignment,
  submitAssignment,
  viewSubmissions,
} = require("../controllers/assignmentController");

const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

// 📤 Teacher/Admin uploads assignment
router.post(
  "/upload",
  verifyToken,
  checkRole("teacher", "admin"), // ✅ fixed — separate args, admin allowed
  upload.single("file"),
  createAssignment
);

// 📥 Student submits
router.post(
  "/submit",
  verifyToken,
  checkRole("student"), // ✅ fixed — no array
  upload.single("file"),
  submitAssignment
);

// 👀 Teacher/Admin views submissions
router.get(
  "/submissions/:id",
  verifyToken,
  checkRole("teacher", "admin"), // ✅ admin allowed to view
  viewSubmissions
);

module.exports = router;
