const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

exports.generateCertificate = async (req, res) => {
  try {
    const { userName, certificateNumber, certificateText, date, quizTitle } =
      req.body;

    // QR content
    const qrData = JSON.stringify({
      certificateNo: certificateNumber,
      name: userName,
      quiz: quizTitle,
      date,
    });
    const qrImage = await QRCode.toDataURL(qrData);
    const qrBuffer = Buffer.from(qrImage.split(",")[1], "base64");

    // A4 Landscape
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${certificateNumber}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Page size: 842 (width) × 595 (height)
    const pageWidth = 842;
    const pageHeight = 595;

    // Background template (exact fit)
    doc.image("templates/certificate-template.png", 0, 0, {
      width: pageWidth,
      height: pageHeight,
    });

    // === Certificate Content ===

    // User name
    doc
      .fontSize(32)
      .fillColor("#0056A6")
      .text(userName, 0, 150, { align: "center", width: pageWidth });

    // Quiz Title (below name)
    doc
      .fontSize(18)
      .fillColor("#454544") // gray text
      .text(`${date} under the topic "${quizTitle}." ${certificateText && certificateText}`, 100, 237, {
        align: "center",
        width: pageWidth - 200,
      });

    // ==== QR + Footer Info ====
    const qrSize = 100;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = pageHeight - qrSize - 40;

    // QR
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    // Left-side info (aligned with QR)
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
    console.error("Error generating certificate:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
