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

exports.exportAssessmentDetails = async (req, res) => {
  try {
    // Fetch all assessments
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
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "No records found" });
    }

    // ✅ Unique quiz titles
    const quizTitles = [...new Set(rows.map((r) => r.quiz_title))];

    // ✅ Group by user
    const userMap = {};
    rows.forEach((r) => {
      const key = `${r.user_employee_id}-${r.user_name}`;
      if (!userMap[key]) {
        userMap[key] = {
          user_name: r.user_name,
          user_employee_id: r.user_employee_id,
          assessments: {},
        };
      }
      userMap[key].assessments[r.quiz_title] = r;
    });
    const userAssessments = Object.values(userMap);

    // ✅ Create workbook & sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assessment Details");

    // Title row
    worksheet.mergeCells(1, 1, 1, quizTitles.length + 2);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = "Assessment Details";
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Header row
    const headerRow = ["User Name", "KOC ID", ...quizTitles];
    worksheet.addRow(headerRow);

    // ✅ Style header
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ✅ Data rows
    userAssessments.forEach((user) => {
      const rowData = [user.user_name, user.user_employee_id];
      quizTitles.forEach((title) => {
        const a = user.assessments[title];
        if (a) {
          const date = a.ended_at
            ? new Date(a.ended_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-";
          rowData.push(`${date}\n${a.status || "-"}`);
        } else {
          rowData.push("—");
        }
      });
      const row = worksheet.addRow(rowData);

      // Wrap text for quiz cells
      row.eachCell((cell, colNumber) => {
        if (colNumber > 2) {
          cell.alignment = {
            wrapText: true,
            vertical: "top",
            horizontal: "center",
          };
        }
      });
    });

    // ✅ Auto column widths
    worksheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value ? cell.value.toString() : "";
        if (v.length > maxLength) maxLength = v.length;
      });
      col.width = maxLength < 20 ? 20 : maxLength + 2;
    });

    // ✅ Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Assessment_Details_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting assessment details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getQuizSummary = async (req, res) => {
  try {
    // Query active quizzes with participants & sessions per quiz
    const query = `
      SELECT 
        q.id AS quiz_id,
        q.title,
        q.description,
        q.created_at,
        -- Count total participants from quiz_assignments per quiz
        (SELECT COUNT(*) FROM quiz_assignments qa WHERE qa.quiz_id = q.id) AS total_participants,
        -- Count total sessions from quiz_sessions per quiz
        (SELECT COUNT(*) FROM quiz_sessions qs WHERE qs.quiz_id = q.id) AS total_sessions
      FROM quizzes q
      WHERE q.is_active = 1
      ORDER BY q.created_at DESC
    `;
    const [rows] = await db.query(query);
    const [totalQuizzesResult] = await db.query(`SELECT COUNT(*) AS total FROM quizzes`);
    const totalAssessment = totalQuizzesResult[0].total;
    const [totalUsersResult] = await db.query(`SELECT COUNT(*) AS total FROM users`);
    const totalUsers = totalUsersResult[0].total;
    const [totalParticipantsResult] = await db.query(`SELECT COUNT(*) AS total FROM quiz_assignments`);
    const totalParticipants = totalParticipantsResult[0].total;

    res.status(200).json({
      success: true,
      message: "Assessment summary fetched successfully",
      totalAssessment,
      totalActiveAssessment: rows.length,
      totalParticipants,
      totalUsers,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching quiz summary:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
