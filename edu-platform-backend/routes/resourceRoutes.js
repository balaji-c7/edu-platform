//routes/resourceRoutes.js

const express = require("express");
const router = express.Router();
const checkRole = require("../middleware/roleCheck");

// ✅ Make sure the path and name are correct
const {
  uploadResource,
  getResources,
} = require("../controllers/resourceController");
const verifyToken = require("../middleware/verifyToken");
const Resource = require("../models/Resource");

// ✅ Use it in the route
router.post(
  "/upload",
  verifyToken,
  checkRole("teacher", "admin"),
  uploadResource
);

router.get("/all", verifyToken, getResources);

module.exports = router;
