// controllers/resourceController.js
const Resource = require("../models/Resource");
const Classroom = require("../models/classroom");

const uploadResource = async (req, res) => {
  try {
    const { title, description, url, classroomId } = req.body;

    if (!title || !url || !classroomId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ check classroom exists
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const newResource = new Resource({
      title,
      description,
      url,
      classroomId,
      uploadedBy: req.user._id,
    });

    await newResource.save();

    res.status(201).json({
      message: "Resource uploaded successfully",
      resource: newResource,
    });
  } catch (error) {
    console.error("Error uploading resource:", error);
    res.status(500).json({
      message: "Error uploading resource",
      error: error.message,
    });
  }
};

// 🔹 Get all resources for all classrooms the user is in
const getResources = async (req, res) => {
  try {
    const userId = req.user._id;
    const userClassrooms = await Classroom.find({ members: userId }).select(
      "_id"
    );

    const classroomIds = userClassrooms.map((c) => c._id);

    const resources = await Resource.find({
      classroomId: { $in: classroomIds },
    }).sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch resources",
      error: err.message,
    });
  }
};

// 🔹 Get resources for a specific classroom (used by class-resources.html)
const getResourcesByClassroom = async (req, res) => {
  try {
    const classroomId = req.params.classroomId;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isMember = classroom.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }

    const resources = await Resource.find({ classroomId }).sort({
      createdAt: -1,
    });

    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch resources for classroom",
      error: err.message,
    });
  }
};

module.exports = { uploadResource, getResources, getResourcesByClassroom };
