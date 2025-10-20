// middleware/roleCheck.js
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    // Default to admin and teacher if no roles are provided
    const rolesToCheck = allowedRoles.length
      ? allowedRoles
      : ["admin", "teacher"];

    if (!req.user || !rolesToCheck.includes(req.user.role)) {
      console.log(
        `Access denied for role: ${req.user ? req.user.role : "Unknown"}`
      );
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
