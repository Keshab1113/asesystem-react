const express = require("express");
const multer = require("multer"); // Add this line
const { authenticate } = require("../middleware/authMiddleware");
const { uploadFile } = require("../controllers/fileController");
const router = express.Router();

const upload = multer();

router.post("/upload", upload.array('files'), uploadFile);


module.exports = router;
