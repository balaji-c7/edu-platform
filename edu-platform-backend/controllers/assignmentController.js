// controllers/assignmentController.js
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Classroom = require("../models/classroom");

// Teacher uploads assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classroomId } = req.body;
    const file = req.file?.filename;

    if (!file) return res.status(400).json({ message: "File is required" });

    // ✅ check classroom exists
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // ✅ check teacher/admin is creator of that class
    if (classroom.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to add assignments to this class",
      });
    }

    const newAssignment = new Assignment({
      title,
      description,
      file,
      dueDate,
      classroomId,
      createdBy: req.user._id,
    });

    await newAssignment.save();
    res
      .status(201)
      .json({ message: "Assignment created", assignment: newAssignment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create assignment", error: error.message });
  }
};

// Student submits assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const file = req.file?.filename;

    if (!file) {
      return res.status(400).json({ message: "Submission file is required" });
    }

    // ✅ check assignment exists
    const assignment = await Assignment.findById(assignmentId).populate(
      "classroomId"
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // ✅ check student is in the class
    const classroom = await Classroom.findById(assignment.classroomId);
    if (
      !classroom.members.some((m) => m.toString() === req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }

    const newSubmission = new Submission({
      assignment: assignmentId,
      student: req.user._id,
      file,
    });

    await newSubmission.save();
    res
      .status(201)
      .json({ message: "Submitted successfully", submission: newSubmission });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Submission failed", error: error.message });
  }
};

// Teacher views submissions for an assignment
const viewSubmissions = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    const submissions = await Submission.find({
      assignment: assignmentId,
    }).populate("student", "name email");

    res.status(200).json(submissions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch submissions", error: error.message });
  }
};

module.exports = {
  createAssignment,
  submitAssignment,
  viewSubmissions,
};
