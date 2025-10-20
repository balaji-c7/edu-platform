// controllers/resourceController.js
const Resource = require("../models/Resource");
const Classroom = require("../models/classroom"); // ✅ added

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

const getResources = async (req, res) => {
  try {
    // Get classrooms this user belongs to
    const userId = req.user._id;
    const userClassrooms = await Classroom.find({ members: userId }).select(
      "_id"
    );

    const classroomIds = userClassrooms.map((c) => c._id);

    // Fetch resources that belong to any of those classrooms
    const resources = await Resource.find({
      classroomId: { $in: classroomIds },
    });

    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch resources",
      error: err.message,
    });
  }
};

module.exports = { uploadResource, getResources };
