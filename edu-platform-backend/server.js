// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Edu Platform API!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
