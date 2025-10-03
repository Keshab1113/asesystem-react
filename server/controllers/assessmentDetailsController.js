const db = require("../config/database");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

exports.getAllAssessmentDetails = async (req, res) => {
  try {
    const query = `
      SELECT 
        qa.*,
        q.id AS quiz_id,
        q.title AS quiz_title,
        q.description AS quiz_description,
        q.passing_score AS quiz_passing_score,

        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.employee_id AS user_employee_id

      FROM quiz_assignments qa
      LEFT JOIN quizzes q ON qa.quiz_id = q.id
      LEFT JOIN users u ON qa.user_id = u.id
      ORDER BY qa.created_at DESC
    `;

    const [rows] = await db.query(query);

    res.status(200).json({
      success: true,
      message: "Assessment details fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching assessment details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
