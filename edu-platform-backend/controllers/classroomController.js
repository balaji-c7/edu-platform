// controllers/classroomController.js
const Classroom = require("../models/classroom");
const User = require("../models/User");

// ✅ Add a student to classroom using classroomName + studentEmail
const addStudentToClassroom = async (req, res) => {
  try {
    const { classroomName, studentEmail } = req.body;

    if (!classroomName || !studentEmail) {
      return res
        .status(400)
        .json({ message: "classroomName and studentEmail are required" });
    }

    // 1️⃣ Find classroom by name
    const classroom = await Classroom.findOne({ name: classroomName });
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // 2️⃣ Only teacher who created OR admin can add
    if (
      classroom.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not allowed to add members to this classroom" });
    }

    // 3️⃣ Find student by email
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 4️⃣ Check if already a member
    const alreadyMember = classroom.members.some(
      (m) => m.toString() === student._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "Student already in classroom" });
    }

    // 5️⃣ Add student
    classroom.members.push(student._id);
    await classroom.save();

    res.status(200).json({
      message: "Student added",
      classroomId: classroom._id,
      classroomName: classroom.name,
      student: { id: student._id, name: student.name, email: student.email },
    });
  } catch (error) {
    console.error("Error adding student:", error);
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

// ✅ Get all classrooms (for listing on classrooms page)
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

// ✅ Get only classrooms where current user is a member
const getMyClassrooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const classrooms = await Classroom.find({
      members: userId,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(200).json(classrooms);
  } catch (error) {
    console.error("Error fetching user classrooms:", error);
    res.status(500).json({
      message: "Failed to fetch your classrooms",
      error: error.message,
    });
  }
};

module.exports = {
  createClassroom,
  getClassroomById,
  getAllClassrooms,
  getMyClassrooms,
  addStudentToClassroom,
};
