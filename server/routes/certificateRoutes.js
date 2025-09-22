const express = require("express");
const { generateCertificate, getCertificate } = require("../controllers/certificateController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/generate", authenticate, generateCertificate);
router.post("/get", authenticate, getCertificate);

router.get("/download", authenticate, async (req, res) => {
  try {
    const fileUrl = req.query.url;
    if (!fileUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Missing file URL" });
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch file" });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=certificate.pdf"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("❌ Error downloading certificate:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
