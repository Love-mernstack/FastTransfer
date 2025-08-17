const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const sendMail = require("../middleware/sendMail");
const auth = require("../middleware/auth");
const axios = require('axios');

// Upload File (Auth Required)
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const { receiverEmail, expiryHours } = req.body;

    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const cloudRes = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto"
    });

    const uuid = uuidv4();
    const expiryTime = moment().add(expiryHours || 24, "hours").toDate();

    const fileData = await File.create({
      uuid,
      fileName: req.file.originalname,
      fileUrl: cloudRes.secure_url,
      size: req.file.size,
      expiryTime,
      senderEmail: req.user.email,   // pulled from JWT user
      receiverEmail,
      uploadedBy: req.user._id
    });

    // Send email to receiver
    if (receiverEmail) {
      const downloadLink = `${process.env.FRONTEND_URL}/download/${uuid}`;
      await sendMail(
        receiverEmail,
        "You've received a file",
        `Hello,\n\n${req.user.email} has sent you a file.\nDownload it here: ${downloadLink}\nIt will expire in ${expiryHours || 24} hours.\n\nBest regards,\nSwiftShare`
      );
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      downloadLink: `${process.env.FRONTEND_URL}/download/${uuid}`
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;


// Download File
router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findOne({uuid:req.params.id});
    if (!file) return res.status(404).json({ message: "File not found" });

    // Increase download count


    // Check expiry
    if (Date.now() > file.expiresAt) {
      return res.status(410).json({ message: "Link expired" });
    }

    // Fetch file from Cloudinary
    const response = await axios({
      url: file.fileUrl,
      method: "GET",
      responseType: "stream"
    });

    // Force download
    res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
    response.data.pipe(res);
        file.downloadCount += 1;
    await file.save();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed" });
  }
});

module.exports = router;
