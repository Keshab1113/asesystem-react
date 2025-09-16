const uploadToFTP = require("../utils/ftpUploader");
const extractText = require("../utils/textExtractor");
const db = require("../config/database");

// exports.uploadFile = async (req, res) => {
//   try {
//     // const userId = req.userId;
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded." });
//     }

//     // if (!userId) {
//     //   return res.status(401).json({ message: "User not authenticated." });
//     // }

//     const results = [];

//     for (const file of files) {
//       try {
//         console.log("Processing file:", file.originalname);

//         const ftpUrl = await uploadToFTP(file.buffer, file.originalname, "uploads");

//         if (!ftpUrl) {
//           throw new Error("FTP upload failed.");
//         }

//         const extracted_text = await extractText(
//           file.buffer,
//           file.mimetype,
//           file.originalname,
//           ftpUrl
//         );

//         console.log("Extracted text length:", extracted_text?.length || 0);

//         // Safeguard: if extracted_text is undefined, set it to empty string or null
//         const safeExtractedText = extracted_text ?? "";

//         const [result] = await db.execute(
//           `INSERT INTO uploaded_files (user_id, original_name, file_url, mime_type, extracted_text)
//            VALUES (?, ?, ?, ?, ?)`,
//           [userId, file.originalname, ftpUrl, file.mimetype, safeExtractedText]
//         );

//         results.push({
//           file_id: result.insertId,
//           original_name: file.originalname,
//           file_url: ftpUrl
//         });
//       } catch (fileError) {
//         console.error(`Error processing file ${file.originalname}:`, fileError);
//         // Optionally skip or return error immediately
//         return res.status(500).json({ message: `Failed to process file ${file.originalname}`, error: fileError.message });
//       }
//     }

//     return res.json({
//       message: "Files uploaded and text extracted successfully.",
//       files: results
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return res.status(500).json({ message: "File upload failed.", error: error.message });
//   }
// };

exports.uploadFile = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const results = [];

    for (const file of files) {
      try {
        console.log("Processing file:", file.originalname);

        const ftpUrl = await uploadToFTP(file.buffer, file.originalname, "uploads");

        if (!ftpUrl) {
          throw new Error("FTP upload failed.");
        }

        const extracted_text = await extractText(
          file.buffer,
          file.mimetype,
          file.originalname,
          ftpUrl
        );

        console.log("Extracted text length:", extracted_text?.length || 0);

        const safeExtractedText = extracted_text ?? "";

        // ✅ Use null for userId if not authenticated
        const [result] = await db.execute(
          `INSERT INTO uploaded_files (user_id, original_name, file_url, mime_type, extracted_text)
           VALUES (?, ?, ?, ?, ?)`,
          [null, file.originalname, ftpUrl, file.mimetype, safeExtractedText]
        );

        results.push({
          file_id: result.insertId,
          original_name: file.originalname,
          file_url: ftpUrl
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        return res.status(500).json({ message: `Failed to process file ${file.originalname}`, error: fileError.message });
      }
    }

    return res.json({
      message: "Files uploaded and text extracted successfully.",
      files: results
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "File upload failed.", error: error.message });
  }
};
