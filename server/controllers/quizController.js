const db = require("../config/database");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const path = require("path");

exports.getAllQuizAttempts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         qa.*, 
         u.name AS user_name, 
         u.email,
         u.phone,
         u.position,
         u.employee_id,
         u.\`group\`, 
         u.controlling_team,
         u.bio,
         u.company_id,
         q.title AS quiz_title
       FROM quiz_attempts qa
       JOIN users u ON qa.user_id = u.id
       JOIN quizzes q ON qa.quiz_id = q.id
       ORDER BY qa.started_at DESC`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllQuizTitles = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title 
       FROM quizzes 
       WHERE is_active = 1
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching quiz titles:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllQuizzesWithNoActive = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
   q.*,
   COUNT(ques.id) AS question_count
FROM quizzes q
LEFT JOIN questions ques ON ques.quiz_id = q.id
WHERE q.is_active IN (0, 1)
GROUP BY q.id
ORDER BY q.created_at DESC
`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAllQuizzes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
   q.*,
   COUNT(ques.id) AS question_count
FROM quizzes q
LEFT JOIN questions ques ON ques.quiz_id = q.id
WHERE q.is_active = 1
GROUP BY q.id
ORDER BY q.created_at DESC
`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// exports.updateQuiz = async (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     timeLimit,
//     passingScore,
//     maxAttempts,
//     maxQuestions, // <-- new
//     scheduleStartDate,
//     scheduleStartTime,
//     scheduleEndDate,
//     scheduleEndTime,
//   } = req.body;

//   // Fetch current quiz first
//   const [existing] = await db.query(
//     "SELECT time_limit, max_attempts FROM quizzes WHERE id = ?",
//     [id]
//   );
//   if (!existing.length) {
//     return res.status(404).json({ success: false, message: "Quiz not found" });
//   }
//   const currentQuiz = existing[0];

//   // If not already set in DB, then require them
//   if (
//     (currentQuiz.time_limit == null &&
//       (timeLimit === undefined || timeLimit === null)) ||
//     (currentQuiz.max_attempts == null &&
//       (maxAttempts === undefined || maxAttempts === null))
//   ) {
//     return res
//       .status(400)
//       .json({
//         success: false,
//         message: "Time limit and max attempts are required",
//       });
//   }

//   try {
//     const [result] = await db.query(
//       `UPDATE quizzes SET
//   ${name ? "title = ?," : ""}
//   ${timeLimit !== undefined ? "time_limit = ?," : ""}
//   passing_score = ?,
//    ${maxAttempts !== undefined ? "max_attempts = ?," : ""}
//     ${maxQuestions !== undefined ? "max_questions = ?," : ""}
//   schedule_start_date = ?,
//   schedule_start_time = ?,
//   schedule_end_date = ?,
//   schedule_end_time = ?,
//   updated_at = NOW()
// WHERE id = ?`,
//       [
//         ...(name ? [name] : []),
//         ...(timeLimit !== undefined ? [timeLimit] : []),
//         passingScore,
//         ...(maxAttempts !== undefined ? [maxAttempts] : []),
//         ...(maxQuestions !== undefined ? [maxQuestions] : []), // <-- include
//         scheduleStartDate,
//         scheduleStartTime,
//         scheduleEndDate,
//         scheduleEndTime,
//         id,
//       ]
//     );

//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quiz not found" });
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Quiz updated successfully" });
//   } catch (error) {
//     console.error("Error updating quiz:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.updateQuiz = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    timeLimit,
    passingScore,
    maxAttempts,
    maxQuestions,
    scheduleStartDate,
    scheduleStartTime,
    scheduleEndDate,
    scheduleEndTime,
  } = req.body;
  console.log("update quiz", req.body);
  try {
    // ✅ Get existing quiz
    const [existing] = await db.query("SELECT * FROM quizzes WHERE id = ?", [
      id,
    ]);
    if (!existing.length) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    const currentQuiz = existing[0];

    // ✅ Require values if they were never set before
    if (
      (currentQuiz.time_limit == null &&
        (timeLimit === undefined || timeLimit === null)) ||
      (currentQuiz.max_attempts == null &&
        (maxAttempts === undefined || maxAttempts === null))
    ) {
      return res.status(400).json({
        success: false,
        message: "Time limit and max attempts are required",
      });
    }

    // ✅ Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("title = ?");
      values.push(name);
    }
    if (timeLimit !== undefined) {
      updates.push("time_limit = ?");
      values.push(timeLimit);
    }
    if (passingScore !== undefined) {
      updates.push("passing_score = ?");
      values.push(passingScore);
    }
    if (maxAttempts !== undefined) {
      updates.push("max_attempts = ?");
      values.push(maxAttempts);
    }
    if (maxQuestions !== undefined) {
      updates.push("max_questions = ?");
      values.push(maxQuestions);
    }
    if (scheduleStartDate !== undefined) {
      updates.push("schedule_start_date = ?");
      values.push(scheduleStartDate);
    }
    if (scheduleStartTime !== undefined) {
      updates.push("schedule_start_time = ?");
      values.push(scheduleStartTime);
    }
    if (scheduleEndDate !== undefined) {
      updates.push("schedule_end_date = ?");
      values.push(scheduleEndDate);
    }
    if (scheduleEndTime !== undefined) {
      updates.push("schedule_end_time = ?");
      values.push(scheduleEndTime);
    }

    updates.push("updated_at = NOW()");

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const sql = `UPDATE quizzes SET ${updates.join(", ")} WHERE id = ?`;
    values.push(id);

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Quiz updated successfully" });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM quiz_attempts WHERE quiz_id = ?", [id]);
    await db.query("DELETE FROM quiz_assignments WHERE quiz_id = ?", [id]);
    await db.query("DELETE FROM questions WHERE quiz_id = ?", [id]);
    const [existing] = await db.query("SELECT * FROM quizzes WHERE id = ?", [
      id,
    ]);

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Delete quiz (and optionally related questions if you want cascade delete)
    const [result] = await db.query("DELETE FROM quizzes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Assessment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Assign quiz to users
// Assign quiz to users
exports.assignQuiz = async (req, res) => {
  const { quiz_id, user_ids } = req.body;

  if (!quiz_id || !user_ids || user_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Quiz ID and users are required",
    });
  }

  function formatDateTime(date, time) {
    if (!date || !time) return null;
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${time}`;
  }

  try {
    // 1. Fetch quiz details
    const [quizRows] = await db.query(
      `SELECT id, time_limit, max_attempts,
              schedule_start_date, schedule_start_time, 
              schedule_end_date, schedule_end_time
       FROM quizzes 
       WHERE id = ? LIMIT 1`,
      [quiz_id]
    );

    if (quizRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const {
      time_limit,
      max_attempts,
      schedule_start_date,
      schedule_start_time,
      schedule_end_date,
      schedule_end_time,
    } = quizRows[0];

    if (
      !schedule_start_date ||
      !schedule_start_time ||
      !schedule_end_date ||
      !schedule_end_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This quiz has not been scheduled. Please schedule it before assigning.",
      });
    }

    const started_at = formatDateTime(schedule_start_date, schedule_start_time);
    const ended_at = formatDateTime(schedule_end_date, schedule_end_time);

    // 2. Fetch users’ team_id & group_id
    const [userRows] = await db.query(
      `SELECT id AS user_id, team_id, group_id 
       FROM users 
       WHERE id IN (?)`,
      [user_ids]
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Users not found" });
    }

    // 3. Filter out users who already have an active assignment
    const [existingAssignments] = await db.query(
      `SELECT qa.user_id, COUNT(qa.id) AS assignment_count,
              COUNT(qat.id) AS attempt_count
       FROM quiz_assignments qa
       LEFT JOIN quiz_attempts qat 
         ON qa.quiz_id = qat.quiz_id 
        AND qa.user_id = qat.user_id
       WHERE qa.quiz_id = ? AND qa.user_id IN (?)
       GROUP BY qa.user_id`,
      [quiz_id, user_ids]
    );

    const existingMap = {};
    existingAssignments.forEach((row) => {
      existingMap[row.user_id] = {
        assignments: row.assignment_count,
        attempts: row.attempt_count,
      };
    });

    const now = new Date();
    const values = [];

    for (const u of userRows) {
      const existing = existingMap[u.user_id];

      if (!existing) {
        // 🚀 Never assigned before → assign directly
        values.push([
          quiz_id,
          u.user_id,
          u.team_id || null,
          u.group_id || null,
          time_limit || 0,
          started_at,
          ended_at,
          null, // score
          "scheduled", // status
          now,
          now,
        ]);
      } else {
        // ✅ Already assigned → check attempts
        if (max_attempts > 1 && existing.attempts > 0) {
          // User has attempts → allow re-assign
          values.push([
            quiz_id,
            u.user_id,
            u.team_id || null,
            u.group_id || null,
            time_limit || 0,
            started_at,
            ended_at,
            null,
            "scheduled",
            now,
            now,
          ]);
        }
        // ❌ else: skip assigning again
      }
    }

    if (values.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No eligible users to assign (already assigned or no attempts yet).",
      });
    }

    // 4. Insert assignments
    await db.query(
      `INSERT INTO quiz_assignments 
        (quiz_id, user_id, team_id, group_id, time_limit, started_at, ended_at, score, status, created_at, updated_at) 
       VALUES ?`,
      [values]
    );

    res.status(201).json({
      success: true,
      message: `Quiz assigned to ${values.length} user(s) successfully`,
    });
  } catch (error) {
    console.error("Error assigning quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch assigned users for a quiz
// Fetch assigned users and summary for a quiz
exports.getQuizAssignments = async (req, res) => {
  const { quiz_id } = req.params;
  try {
    // Fetch all assignments with user info
    const [assignments] = await db.query(
      `SELECT 
         qa.*, 
         u.name AS user_name,
         u.email AS user_email
       FROM quiz_assignments qa
       JOIN users u ON qa.user_id = u.id
       WHERE qa.quiz_id = ?`,
      [quiz_id]
    );

    // Optional: summary counts by status
    const [summary] = await db.query(
      `SELECT 
         COUNT(*) AS total_assigned,
         SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
         SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
         SUM(CASE WHEN status='passed' THEN 1 ELSE 0 END) AS passed_count,
         SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed_count,
         SUM(CASE WHEN status='under_review' THEN 1 ELSE 0 END) AS under_review_count
       FROM quiz_assignments
       WHERE quiz_id = ?`,
      [quiz_id]
    );

    res.json({
      success: true,
      data: { assignments, summary: summary[0] },
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getQuizQuestions = async (req, res) => {
  const { id } = req.params; // quizId
  const quizId = id;

  if (!quizId) {
    return res
      .status(400)
      .json({ success: false, message: "Quiz ID is required" });
  }

  try {
    // Fetch quiz questions along with quiz title
    // First fetch the quiz to get used_file_ids
    const [quizRows] = await db.query(
      `SELECT title, used_file_ids FROM quizzes WHERE id = ?`,
      [quizId]
    );
    const quiz = quizRows[0];
    let files = [];
    if (quiz?.used_file_ids) {
      const fileIds = JSON.parse(quiz.used_file_ids || "[]");
      if (fileIds.length > 0) {
        const placeholders = fileIds.map(() => "?").join(",");
        const [fileRows] = await db.query(
          `SELECT file_id, original_name, file_url FROM uploaded_files WHERE file_id IN (${placeholders})`,
          fileIds
        );
        files = fileRows;
      }
    }

    // Then fetch questions as before
    const [rows] = await db.query(
      `SELECT q.id, q.question_text, q.question_type, q.options, q.correct_answer, 
          q.explanation, q.difficulty_level, qu.title AS quiz_name
   FROM questions q
   JOIN quizzes qu ON q.quiz_id = qu.id
   WHERE q.quiz_id = ? AND q.is_active = 1
   ORDER BY q.id ASC`,
      [quizId]
    );

    res.json({
      success: true,
      data: rows,
      files,
      quiz_title: quiz?.title || "",
    });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateQuizQuestionsBulk = async (req, res) => {
  const { id: quizId } = req.params;
  const { questions } = req.body; // array of {id, question_text, options, correct_answer, explanation, difficulty_level}

  if (!quizId || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    // Fetch existing questions
    const [existingRows] = await db.query(
      `SELECT id, question_text, options, correct_answer, explanation, difficulty_level
       FROM questions
       WHERE quiz_id = ?`,
      [quizId]
    );

    const existingMap = {};
    existingRows.forEach((q) => {
      existingMap[q.id] = {
        question_text: q.question_text,
        options: Array.isArray(q.options)
          ? q.options
          : q.options
          ? JSON.parse(q.options)
          : [],
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty_level: q.difficulty_level,
      };
    });

    const updatePromises = questions.map((q) => {
      const existing = existingMap[q.id] || {};
      // Only merge fields that exist; keep other options intact
      const newOptions = q.options !== undefined ? q.options : existing.options;

      return db.query(
        `UPDATE questions
         SET question_text = ?, options = ?, correct_answer = ?, explanation = ?, difficulty_level = ?
         WHERE id = ? AND quiz_id = ?`,
        [
          q.question_text ?? existing.question_text,
          JSON.stringify(newOptions), // store as JSON array
          q.correct_answer ?? existing.correct_answer,
          q.explanation ?? existing.explanation,
          q.difficulty_level ?? existing.difficulty_level,
          q.id,
          quizId,
        ]
      );
    });

    await Promise.all(updatePromises);

    // Return updated questions properly parsed
    const [updatedRows] = await db.query(
      `SELECT id, question_text, options, correct_answer, explanation, difficulty_level
       FROM questions
       WHERE quiz_id = ?`,
      [quizId]
    );

    const parsedQuestions = updatedRows.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
    }));

    res.json({
      success: true,
      message: "All questions updated successfully",
      data: parsedQuestions,
    });
  } catch (error) {
    console.error("Error updating questions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get detailed assignments for a quiz
exports.getQuizReportDetails = async (req, res) => {
  const { id: quizId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        qa.id as assignment_id,
        qa.quiz_id,
        qa.user_id,
        qa.team_id,
        qa.group_id,
        qa.time_limit,
        qa.started_at,
        qa.ended_at,
        qa.user_started_at,
        qa.user_ended_at,
        qa.score,
        qa.status,
        qa.created_at,
        qa.updated_at,
        u.name as user_name,
        u.email,
        u.phone,
        u.position,
        u.employee_id,
        u.profile_pic_url,
        u.group as user_group,
        u.controlling_team,
        u.location,
        t.name as team_name,
        g.name as group_name
      FROM quiz_assignments qa
      JOIN users u ON qa.user_id = u.id
      LEFT JOIN teams t ON qa.team_id = t.id
      LEFT JOIN groups g ON qa.group_id = g.id
      WHERE qa.quiz_id = ?
      ORDER BY qa.created_at DESC
      `,
      [quizId]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching quiz report details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update quiz is_active status
exports.updateQuizStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID is required",
      });
    }

    if (typeof is_active === "undefined") {
      return res.status(400).json({
        success: false,
        message: "is_active value is required",
      });
    }

    const [result] = await db.query(
      `UPDATE quizzes 
       SET is_active = ? 
       WHERE id = ?`,
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Assessment status updated successfully (id: ${id}, is_active: ${is_active})`,
    });
  } catch (error) {
    console.error("Error updating Assessment status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



exports.downloadQuizQuestions = async (req, res) => {
  const { id } = req.params; // quizId
  const quizId = id;

  if (!quizId) {
    return res
      .status(400)
      .json({ success: false, message: "Assessment ID is required" });
  }

  try {
    // Fetch quiz
    const [quizRows] = await db.query(
      `SELECT title FROM quizzes WHERE id = ?`,
      [quizId]
    );
    const quiz = quizRows[0];

    // Fetch questions
    const [rows] = await db.query(
      `SELECT q.id, q.question_text, q.options, q.correct_answer, 
              q.explanation, q.difficulty_level, qu.title AS quiz_name
       FROM questions q
       JOIN quizzes qu ON q.quiz_id = qu.id
       WHERE q.quiz_id = ? AND q.is_active = 1
       ORDER BY q.id ASC`,
      [quizId]
    );

    // Build Word document (questions only)
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Quiz Title: ${quiz?.title || "Untitled Quiz"}`,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph(""),
            ...rows
              .map((q, i) => {
                let options = [];
                try {
                  options = JSON.parse(q.options || "[]");
                } catch {
                  options = [];
                }

                return [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Q${i + 1}. ${q.question_text}`,
                        bold: true,
                      }),
                    ],
                  }),
                  ...options.map(
                    (opt, idx) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `   ${String.fromCharCode(65 + idx)}. ${opt}`,
                          }),
                        ],
                      })
                  ),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Answer: ${q.correct_answer}`,
                        bold: true,
                      }),
                    ],
                  }),
                  q.explanation
                    ? new Paragraph({
                        children: [
                          new TextRun({
                            text: `Explanation: ${q.explanation}`,
                          }),
                        ],
                      })
                    : new Paragraph(""),
                  new Paragraph(""),
                ];
              })
              .flat(),
          ],
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Send file
    const fileName = `${quiz?.title || "quiz"}-questions.docx`;
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error generating quiz Word file:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


