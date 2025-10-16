const db = require("../config/database");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
 
const moment = require("moment-timezone");
 


// exports.getAllAssessmentDetails = async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         qa.*,
//         q.id AS quiz_id,
//         q.title AS quiz_title,
//         q.description AS quiz_description,
//         q.passing_score AS quiz_passing_score,

//         u.id AS user_id,
//         u.name AS user_name,
//         u.email AS user_email,
//         u.employee_id AS user_employee_id

//       FROM quiz_assignments qa
//       LEFT JOIN quizzes q ON qa.quiz_id = q.id
//       LEFT JOIN users u ON qa.user_id = u.id
//       ORDER BY qa.created_at DESC
//     `;

//     const [rows] = await db.query(query);
//     res.status(200).json({
//       success: true,
//       message: "Assessment details fetched successfully",
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Error fetching assessment details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

exports.getAllAssessmentDetails = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM (
        SELECT
          qa.id AS assignment_id,
          qa.quiz_id,
          qa.quiz_session_id,
          qa.user_id,
          qa.team_id,
          qa.group_id,
          qa.time_limit,
          qa.started_at,
          qa.ended_at,
          qa.score,
          qa.status,
          qa.user_started_at,
          qa.user_ended_at,
          qa.reassigned,
          qa.created_at,
          qa.updated_at,
          qa.user_timezone,

          q.title AS quiz_title,
          q.description AS quiz_description,
          q.passing_score AS quiz_passing_score,

          qs.id AS quiz_session_id_main,
          qs.session_name AS quiz_session_name,
          qs.schedule_start_at AS quiz_session_start,
          qs.schedule_end_at AS quiz_session_end,

          u.name AS user_name,
          u.email AS user_email,
          u.employee_id AS user_employee_id,

          ROW_NUMBER() OVER (
            PARTITION BY qa.quiz_id, qa.user_id
            ORDER BY 
              CASE 
                WHEN qa.status IN ('in_progress','passed','failed','under_review','terminated') THEN 1
                WHEN qa.status = 'scheduled' THEN 2
                ELSE 3
              END,
              qa.created_at DESC
          ) as row_num

        FROM quiz_assignments qa
        LEFT JOIN quizzes q ON qa.quiz_id = q.id
        LEFT JOIN quiz_sessions qs ON qa.quiz_session_id = qs.id
        LEFT JOIN users u ON qa.user_id = u.id
      ) ranked
      WHERE row_num = 1
      ORDER BY ranked.created_at DESC
    `;

    const [rows] = await db.query(query);
    res.status(200).json({
      success: true,
      message: "Filtered assessment details fetched successfully",
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
    const query = `
      SELECT *
      FROM (
        SELECT
          qa.id AS assignment_id,
          qa.quiz_id,
          qa.quiz_session_id,
          qa.user_id,
          qa.team_id,
          qa.group_id,
          qa.time_limit,
          qa.started_at,
          qa.ended_at,
          qa.score,
          qa.status,
          qa.user_started_at,
          qa.user_ended_at,
          qa.reassigned,
          qa.created_at,
          qa.updated_at,
          qa.user_timezone,

          q.title AS quiz_title,
          q.description AS quiz_description,
          q.passing_score AS quiz_passing_score,

          qs.session_name AS quiz_session_name,
          qs.schedule_start_at AS quiz_session_start,
          qs.schedule_end_at AS quiz_session_end,

          u.name AS user_name,
          u.email AS user_email,
          u.employee_id AS user_employee_id,

          ROW_NUMBER() OVER (
            PARTITION BY qa.quiz_id, qa.user_id
            ORDER BY 
              CASE 
                WHEN qa.status IN ('in_progress','passed','failed','under_review','terminated') THEN 1
                WHEN qa.status = 'scheduled' THEN 2
                ELSE 3
              END,
              qa.created_at DESC
          ) as row_num

        FROM quiz_assignments qa
        LEFT JOIN quizzes q ON qa.quiz_id = q.id
        LEFT JOIN quiz_sessions qs ON qa.quiz_session_id = qs.id
        LEFT JOIN users u ON qa.user_id = u.id
      ) ranked
      WHERE row_num = 1
      ORDER BY ranked.created_at DESC
    `;

    const [rows] = await db.query(query);
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "No records found" });
    }

    
// ✅ Sort rows by session date
rows.sort((a, b) => {
  const dateA = new Date(a.quiz_session_start || a.created_at);
  const dateB = new Date(b.quiz_session_start || b.created_at);
  return dateB - dateA;
});

    // ✅ Unique quiz titles
    const quizTitles = [...new Set(rows.map((r) => r.quiz_title))];

    // ✅ Group by user
    const userMap = {};
    rows.forEach((r) => {
      const key = `${r.user_email}-${r.user_name}`;
      if (!userMap[key]) {
        userMap[key] = {
          user_name: r.user_name,
          user_email: r.user_email,
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
    const headerRow = ["User Name", "Email", ...quizTitles];
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
      const rowData = [user.user_name, user.user_email];
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
          rowData.push(`${date} - ${a.status || "-"}`);
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
    worksheet.columns = [
      { width: 30 }, // User Name
      { width: 35 }, // Email
      ...quizTitles.map(() => ({ width: 25 })), // Each quiz column
    ];

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
//     const query = `
//   SELECT 
//     q.id AS quiz_id,
//     q.title,
//     q.description,
//     q.created_at,
//     -- Count total participants per quiz
//     (SELECT COUNT(*) FROM quiz_assignments qa WHERE qa.quiz_id = q.id) AS total_participants,
//     -- Count total sessions per quiz
//     (SELECT COUNT(*) FROM quiz_sessions qs WHERE qs.quiz_id = q.id) AS total_sessions,
//     -- Get all session names as an array
//     (
//   SELECT JSON_ARRAYAGG(
//     JSON_OBJECT(
//       'session_id', qs.id,
//       'session_name', qs.session_name,
//       'schedule_start_at', qs.schedule_start_at,
//       'schedule_end_at', qs.schedule_end_at,
//       'participants', (
//         SELECT COUNT(*) 
//         FROM quiz_assignments qa 
//         WHERE qa.quiz_id = q.id AND qa.quiz_session_id = qs.id
//       )
//     )
//   )
//   FROM quiz_sessions qs
//   WHERE qs.quiz_id = q.id
// ) AS sessions,
//     -- Count total attended (status = terminated, failed, or passed)
//     (
//       SELECT COUNT(*) 
//       FROM quiz_assignments qa2 
//       WHERE qa2.quiz_id = q.id 
//       AND qa2.status IN ('terminated', 'failed', 'passed')
//     ) AS total_attended
//   FROM quizzes q
//   WHERE q.is_active = 1
//   ORDER BY q.created_at DESC
// `;

const query = `
  SELECT 
    q.id AS quiz_id,
    q.title,
    q.description,
    q.created_at,
    -- ✅ Fix duplicate users by counting distinct user_id
    (SELECT COUNT(DISTINCT qa.user_id) 
     FROM quiz_assignments qa 
     WHERE qa.quiz_id = q.id) AS total_participants,
    -- Count total sessions per quiz
    (SELECT COUNT(*) FROM quiz_sessions qs WHERE qs.quiz_id = q.id) AS total_sessions,
    -- Get all session names as an array
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'session_id', qs.id,
          'session_name', qs.session_name,
          'schedule_start_at', qs.schedule_start_at,
          'schedule_end_at', qs.schedule_end_at,
          'participants', (
            SELECT COUNT(*) 
            FROM quiz_assignments qa 
            WHERE qa.quiz_id = q.id AND qa.quiz_session_id = qs.id
          )
        )
      )
      FROM quiz_sessions qs
      WHERE qs.quiz_id = q.id
    ) AS sessions,
    -- Count total attended (status = terminated, failed, or passed)
    (
      SELECT COUNT(DISTINCT qa2.user_id) 
      FROM quiz_assignments qa2 
      WHERE qa2.quiz_id = q.id 
      AND qa2.status IN ('terminated', 'failed', 'passed')
    ) AS total_attended
  FROM quizzes q
  WHERE q.is_active = 1
  ORDER BY q.created_at DESC
`;

    const [rows] = await db.query(query);
    const [totalQuizzesResult] = await db.query(
      `SELECT COUNT(*) AS total FROM quizzes`
    );
    const totalAssessment = totalQuizzesResult[0].total;
    const [totalUsersResult] = await db.query(
      `SELECT COUNT(*) AS total FROM users`
    );
    const totalUsers = totalUsersResult[0].total;
    const [totalParticipantsResult] = await db.query(
      `SELECT COUNT(*) AS total FROM users where role = 'user'`
    );
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


exports.exportQuizUserData = async (req, res) => {
  try {
    const { quiz_id, session_id = "all" } = req.body;

    if (!quiz_id) {
      return res
        .status(400)
        .json({ success: false, message: "quiz_id is required" });
    }

    // ✅ 1. Get quiz name
    const [quizInfo] = await db.query(
      `SELECT title FROM quizzes WHERE id = ?`,
      [quiz_id]
    );
    const quizName = quizInfo[0]?.title || "Untitled Quiz";

    // ✅ 2. Get all user data for the quiz (with session details + email)
   

  let query = `
  SELECT 
    ranked.user_id,
    ranked.user_name,
    ranked.user_email,
    ranked.team_name,
    ranked.score,
    ranked.status,
    ranked.location,
    ranked.user_started_at,
    ranked.user_ended_at,
    ranked.reassigned,
    ranked.user_timezone,
    ranked.session_name
  FROM (
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      t.name AS team_name,
      qa.score,
      qa.status,
      u.location,
      qa.user_started_at,
      qa.user_ended_at,
      qa.reassigned,
      qa.user_timezone,
      qs.session_name,
      ROW_NUMBER() OVER (
        PARTITION BY u.id
        ORDER BY 
          CASE 
            WHEN qa.status IN ('passed','failed','terminated') THEN 1
            WHEN qa.status = 'scheduled' THEN 2
            ELSE 3
          END,
          qa.created_at DESC
      ) as row_num
    FROM quiz_assignments qa
    JOIN users u ON qa.user_id = u.id
    LEFT JOIN teams t ON qa.team_id = t.id
    LEFT JOIN quiz_sessions qs ON qa.quiz_session_id = qs.id
    WHERE qa.quiz_id = ?
  ) ranked
  WHERE ranked.row_num = 1
  ORDER BY ranked.session_name ASC, ranked.user_name ASC
`;




    const params = [quiz_id];

    if (session_id !== "all") {
  query = query.replace(
    "WHERE qa.quiz_id = ?",
    "WHERE qa.quiz_id = ? AND qa.quiz_session_id = ?"
  );
  params.push(session_id);
}


    const [rows] = await db.query(query, params);

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "No user data found for this quiz" });
    }

    // ✅ 3. Format date/times in user's timezone
    const formattedRows = rows.map((r) => {
      const tz = r.user_timezone || "UTC";
      return {
        user_name: r.user_name || "-",
        user_email: r.user_email || "-",
        team_name: r.team_name || "-",
        score: r.score ?? "-",
        status: r.status || "-",
        location: r.location || "-",
        user_started_at: r.user_started_at
          ? moment.tz(r.user_started_at + "Z", tz).format("YYYY-MM-DD HH:mm")
          : "-",
        user_ended_at: r.user_ended_at
          ? moment.tz(r.user_ended_at + "Z", tz).format("YYYY-MM-DD HH:mm")
          : "-",
        quiz_name: quizName,
        attempt_no: r.reassigned ?? 0,
        session_name: r.session_name || "-",
      };
    });

    // ✅ 4. Generate Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Quiz Users Report");

    // Column order and headers
    worksheet.columns = [
      { header: "User Name", key: "user_name", width: 25 },
      { header: "User Email", key: "user_email", width: 30 },
      { header: "Team Name", key: "team_name", width: 20 },
      { header: "Score", key: "score", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "User Started At", key: "user_started_at", width: 22 },
      { header: "User Ended At", key: "user_ended_at", width: 22 },
      { header: "Quiz Name", key: "quiz_name", width: 30 },
      { header: "Reassigned", key: "attempt_no", width: 15 },
      { header: "Session Name", key: "session_name", width: 25 },
    ];

 
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true, size: 14 }; // bold + bigger font
  cell.alignment = { vertical: "middle", horizontal: "center" };
});


    // Add rows
    formattedRows.forEach((row) => worksheet.addRow(row));

    // ✅ 5. Set response headers & send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Quiz_Users_Report_${quiz_id}_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Export completed. ${formattedRows.length} rows downloaded.`);
  } catch (error) {
    console.error("❌ Error exporting quiz user data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

