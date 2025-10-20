//models/Resource.js

const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resource", resourceSchema);
