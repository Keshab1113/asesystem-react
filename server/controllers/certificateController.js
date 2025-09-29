const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const uploadToFTP = require("../config/uploadToFTP");
const db = require("../config/database");
const fs = require("fs");
const path = require("path");

exports.generateCertificate = async (req, res) => {
  try {
    const {
      userName,
      certificateNumber,
      certificateText,
      date,
      quizTitle,
      attemptId,
      score,
      expiry_date,
      quizID,
      generateFrom,
      quizSessionId,
  assignmentId, 
    } = req.body;
    const user_id = req.userId;
// console.log("📥 Certificate payload:", req.body);

    const frontendBaseURL = process.env.FRONTEND_URL;
    const qrLink = `${frontendBaseURL}/certificate-view?certNo=${certificateNumber}`;
    const qrImage = await QRCode.toDataURL(qrLink, {
      color: { dark: "#000000", light: "#00000000" }, // transparent background
    });
    const qrBuffer = Buffer.from(qrImage.split(",")[1], "base64");
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      // const certificatesDir = path.join(__dirname, "../certificates");
      // if (!fs.existsSync(certificatesDir)) {
      //   fs.mkdirSync(certificatesDir, { recursive: true });
      // }

      // Save locally
      // const filePath = path.join(certificatesDir, `${certificateNumber}.pdf`);
      // fs.writeFileSync(filePath, pdfBuffer);

      try {
        const certUrl = await uploadToFTP(
          pdfBuffer,
          `${certificateNumber}.pdf`,
          "certificates"
        );
        const issued_date = new Date();
        const [result] = await db.execute(
          `INSERT INTO certificates
  (user_id, quiz_id, quiz_session_id, quiz_assignment_id, attempt_id, certificate_number, score, issued_date, expiry_date, is_valid, certificate_url, generateFrom)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
,
          [
  user_id,
  quizID,
 
   quizSessionId || null,
  assignmentId || null,
  attemptId || null,
  certificateNumber,
  score || 0,
  issued_date,
  expiry_date || null,
  1,
  certUrl,
  generateFrom || "automatic",
]

        );
        res.status(200).json({
          success: true,
          message: "Certificate generated and stored successfully",
          certificate_url: certUrl,
          certificate_id: result.insertId,
        });
        
        
      } catch (dbErr) {
        console.error("❌ Error saving certificate:", dbErr);
        res.status(500).json({
          success: false,
          message: "Error saving certificate",
        });
      }
    });

    const pageWidth = 842;
    const pageHeight = 595;

    doc.image("templates/certificate-template.png", 0, 0, {
      width: pageWidth,
      height: pageHeight,
    });

    doc
      .font("Helvetica-Bold")
      .fontSize(32)
      .fillColor("#0056A6")
      .text(userName, 0, 150, { align: "center", width: pageWidth });

    const boxWidth = 550;
    const boxHeight = 100;
    const boxX = pageWidth - boxWidth - 60; // right aligned with margin
    const boxY = 220;

    doc.rect(boxX, boxY, boxWidth, boxHeight);
    doc.fillColor("#454544");

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(
        `Has successfully completed the "KOC HSE MS ASSESSMENT" on ${date} under the topic "${quizTitle}". ${
          certificateText || ""
        }`,
        boxX + 15,
        boxY + 15,
        { align: "left", width: boxWidth - 30 }
      );

    const qrSize = 120;
    const qrX = pageWidth - qrSize - 40;
    const qrY = pageHeight - qrSize - 140;

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    const infoX = 60;
    const infoY = pageHeight - 115;

    doc.fontSize(12).fillColor("#000");

    doc.text(`Certificate No: ${certificateNumber}`, infoX, infoY, {
      align: "left",
      width: 450,
      indent: 120,
    });

    // percentage on the next line
    doc.fillColor("#3BB143").text(`Passed: ${score}%`, infoX, infoY + 13, {
      align: "left",
      width: 450,
      indent: 120,
    });

    // date on the line after that
    doc.fillColor("#000").text(`Date: ${date}`, infoX, infoY + 26, {
      align: "left",
      width: 450,
      indent: 120,
    });

    doc.end();
  } catch (err) {
    console.error("❌ Error generating certificate:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const { user_id, quiz_id, quiz_session_id, quiz_assignment_id } = req.body;


    if (!user_id || !quiz_id) {
      return res.status(400).json({
        success: false,
        message: "user_id, quiz_id are required",
      });
    }

    const [rows] = await db.execute(
      `SELECT certificate_url, certificate_number, issued_date, expiry_date, score 
       FROM certificates 
       WHERE user_id = ? AND quiz_id = ? 
  AND (quiz_session_id = ? OR ? IS NULL) 
  AND (quiz_assignment_id = ? OR ? IS NULL) 
  AND is_valid = 1
`,
      [user_id, quiz_id, quiz_session_id || null, quiz_session_id || null, quiz_assignment_id || null, quiz_assignment_id || null]

    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        certificate: null,
        message: "Certificate not found",
      });
    }

    const certificate = rows[0];
    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (err) {
    console.error("❌ Error fetching certificate:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getCertificateByNumber = async (req, res) => {
  try {
    const { certificate_number } = req.body;

    if (!certificate_number) {
      return res.status(400).json({
        success: false,
        message: "certificate_number is required",
      });
    }

    const [rows] = await db.execute(
      `SELECT certificate_url, certificate_number 
       FROM certificates 
       WHERE certificate_number = ? AND is_valid = 1`,
      [certificate_number]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const certificate = rows[0];
    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (err) {
    console.error("❌ Error fetching certificate by number:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
