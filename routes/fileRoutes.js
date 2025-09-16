const express = require("express");
const multer = require("multer"); // Add this line
const { authenticate } = require("../middleware/authMiddleware");
const { uploadFile } = require("../controllers/fileController");
const router = express.Router();

// Define upload using multer with memory storage
const upload = multer(); // stores files in memory as buffer
// Use authenticate middleware before uploadFile
router.post("/upload", upload.array('files'), uploadFile);


module.exports = router;
