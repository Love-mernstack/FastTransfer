const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect: "Bearer <token>"
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("email name _id");

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = auth;
