// routes/resourceRoutes.js

const express = require("express");
const router = express.Router();
const checkRole = require("../middleware/roleCheck");

const {
  uploadResource,
  getResources,
  getResourcesByClassroom,
} = require("../controllers/resourceController");
const verifyToken = require("../middleware/verifyToken");

// Upload resource (teacher/admin)
router.post(
  "/upload",
  verifyToken,
  checkRole("teacher", "admin"),
  uploadResource
);

// Get all resources for all classes user belongs to
router.get("/all", verifyToken, getResources);

// 🔹 Get resources for a specific classroom
router.get("/classroom/:classroomId", verifyToken, getResourcesByClassroom);

module.exports = router;
