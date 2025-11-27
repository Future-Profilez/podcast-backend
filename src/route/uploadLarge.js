const express = require("express");
const router = express.Router();
const {
  startLargeUpload,
  uploadLargePart,
  completeLargeUpload
} = require("../controller/largeUploadController");
const { verifyToken } = require("../utils/tokenVerify");

// Init multipart
router.post("/upload/init", verifyToken, startLargeUpload);

// Complete multipart
router.post("/upload/complete", verifyToken, completeLargeUpload);

// **Note:** /upload/part is handled as PUT directly in app.js
router.uploadLargePart = uploadLargePart; 

module.exports = router;