// models/assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    file: String, 
    dueDate: {
      type: Date,
      required: true,
    },
    classroomId: {
      // ✅ added
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
