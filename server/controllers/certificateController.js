const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const uploadToFTP = require("../config/uploadToFTP");
const db = require("../config/database");

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
    } = req.body;
    const user_id = req.userId;

    const frontendBaseURL = process.env.FRONTEND_URL;
    const qrLink = `${frontendBaseURL}/certificate-view?certNo=${certificateNumber}`;
    const qrImage = await QRCode.toDataURL(qrLink);
    const qrBuffer = Buffer.from(qrImage.split(",")[1], "base64");

    const doc = new PDFDocument({ size: "A4", layout: "landscape" });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      try {
        const certUrl = await uploadToFTP(
          pdfBuffer,
          `${certificateNumber}.pdf`,
          "certificates"
        );
        const issued_date = new Date();
        const [result] = await db.execute(
          `INSERT INTO certificates 
            (user_id, quiz_id, attempt_id, certificate_number, score, issued_date, expiry_date, is_valid, certificate_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user_id,
            quizID,
            attemptId || null,
            certificateNumber,
            score || 0,
            issued_date,
            expiry_date || null,
            1,
            certUrl,
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
      .fontSize(32)
      .fillColor("#0056A6")
      .text(userName, 0, 150, { align: "center", width: pageWidth });

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#454544")
      .text(
        `${date} under the topic "${quizTitle}." ${certificateText || ""}`,
        260,
        237,
        { align: "center", width: pageWidth - 270 }
      );

    const qrSize = 100;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = pageHeight - qrSize - 40;

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Certificate No: ${certificateNumber}`, qrX - 200, qrY + 20, {
        width: 180,
        align: "right",
      })
      .moveDown(0.5)
      .text(`Date: ${date}`, qrX - 200, qrY + 50, {
        width: 180,
        align: "right",
      });

    doc.end();
  } catch (err) {
    console.error("❌ Error generating certificate:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const { user_id, quiz_id } = req.body;

    if (!user_id || !quiz_id) {
      return res.status(400).json({
        success: false,
        message: "user_id, quiz_id are required",
      });
    }

    const [rows] = await db.execute(
      `SELECT certificate_url, certificate_number, issued_date, expiry_date, score 
       FROM certificates 
       WHERE user_id = ? AND quiz_id = ? AND is_valid = 1`,
      [user_id, quiz_id]
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
    console.error("❌ Error fetching certificate:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
