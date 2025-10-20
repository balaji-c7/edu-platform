// classroomController 
const Classroom = require("../models/classroom");
const User = require("../models/User");

// ✅ Add a student to classroom
const addStudentToClassroom = async (req, res) => {
  try {
    const { classroomId, studentId } = req.body;

    // check classroom exists
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // only teacher/admin (creator) can add
    if (
      classroom.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to add members to this classroom" });
    }

    // check if already a member
    if (classroom.members.includes(studentId)) {
      return res.status(400).json({ message: "Student already in classroom" });
    }

    // add student
    classroom.members.push(studentId);
    await classroom.save();

    res.status(200).json({ message: "Student added", classroom });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add student", error: error.message });
  }
};


// ✅ Create a new classroom
const createClassroom = async (req, res) => {
  try {
    console.log("User from token:", req.user);

    const { name, expiresAt } = req.body;
    const createdBy = req.user._id;

    const newClassroom = new Classroom({
      name,
      createdBy,
      members: [createdBy],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await newClassroom.save();

    res.status(201).json({
      message: "Classroom created successfully",
      classroom: newClassroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    res
      .status(500)
      .json({ message: "Failed to create classroom", error: error.message });
  }
};

// ✅ Get a classroom by ID (if not expired)
const getClassroomById = async (req, res) => {
  try {
    const classroomId = req.params.id;
    const now = new Date();

    const classroom = await Classroom.findOne({
      _id: classroomId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or expired" });
    }

    res.status(200).json(classroom);
  } catch (error) {
    console.error("Error fetching classroom:", error);
    res.status(500).json({
      message: "Failed to fetch classroom",
      error: error.message,
    });
  }
};

// ✅ Get all classrooms
const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({
      message: "Failed to fetch classrooms",
      error: error.message,
    });
  }
};

module.exports = {
  createClassroom,
  getClassroomById,
  getAllClassrooms,
  addStudentToClassroom,
};

