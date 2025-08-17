const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  fileName: String,
  fileUrl: String, // Cloudinary URL
  size: Number,
  uploadTime: { type: Date, default: Date.now },
  expiryTime: Date,
  senderEmail: String,
  receiverEmail: String,
  downloadCount: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("File", fileSchema);
