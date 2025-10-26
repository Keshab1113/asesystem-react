const db = require("../config/database");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const moment = require("moment-timezone");

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
    console.error("Error fetching Assessment attempts:", error);
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
         qs.id AS session_id,
         qs.session_name,
         qs.quiz_id,
         q.title AS quiz_title,   -- changed from q.name
         qs.time_limit,
         q.is_active,
         qs.passing_score,
         qs.max_attempts,
         qs.max_questions,
         qs.schedule_start_at,
         qs.schedule_end_at,
         qs.created_at,
         COUNT(ques.id) AS question_count
       FROM quiz_sessions qs
       JOIN quizzes q ON qs.quiz_id = q.id
       LEFT JOIN questions ques ON ques.quiz_id = q.id
       GROUP BY qs.id
       ORDER BY qs.created_at DESC`
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
        .json({ success: false, message: "Assessment not found" });
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
    // Helper to convert local date+time to UTC MySQL DATETIME format
    // Helper to convert local date+time to UTC MySQL DATETIME format
    // Helper to convert local date+time to UTC MySQL DATETIME format
    const toUTC = (date, time) => {
      if (!date || !time) return null; // safeguard for missing values

      const local = new Date(`${date}T${time}:00`);
      if (isNaN(local.getTime())) return null; // invalid date/time

      return new Date(local.getTime() - local.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    };

    const startUTC = toUTC(scheduleStartDate, scheduleStartTime);
    if (startUTC) {
      updates.push("schedule_start_at = ?");
      values.push(startUTC);
    }

    const endUTC = toUTC(scheduleEndDate, scheduleEndTime);
    if (endUTC) {
      updates.push("schedule_end_at = ?");
      values.push(endUTC);
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
        .json({ success: false, message: "Assessment not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Assessment updated successfully" });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteAssessment = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM quiz_assignments WHERE quiz_id = ?", [id]);
    await db.query("DELETE FROM quiz_sessions WHERE quiz_id = ?", [id]);
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
exports.deleteSessionQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM quiz_assignments WHERE quiz_session_id = ?", [id]);
    const [existing] = await db.query("SELECT * FROM quiz_sessions WHERE id = ?", [
      id,
    ]);

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Delete quiz (and optionally related questions if you want cascade delete)
    const [result] = await db.query("DELETE FROM quiz_sessions WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assessment Session not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Assessment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.assignQuiz = async (req, res) => {
  const { quiz_id, user_ids } = req.body;

  if (!quiz_id || !user_ids || user_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Assessment ID and users are required",
    });
  }

  try {
    const [quizRows] = await db.query(
      `SELECT id, time_limit, max_attempts,
          schedule_start_at, schedule_end_at
   FROM quizzes 
   WHERE id = ? LIMIT 1`,
      [quiz_id]
    );

    if (!quizRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    // ✅ Use directly (no formatDateTime needed)
    const { time_limit, max_attempts, schedule_start_at, schedule_end_at } =
      quizRows[0];

    if (!schedule_start_at || !schedule_end_at) {
      return res.status(400).json({
        success: false,
        message:
          "This Assessment has not been scheduled. Please schedule it before assigning.",
      });
    }

    const started_at = schedule_start_at; // already UTC from DB
    const ended_at = schedule_end_at;

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
        // ✅ Already assigned → check attempts
        // if (existing.attempts < max_attempts) {
        //   // User still has remaining attempts → allow re-assign
        //   values.push([
        //     quiz_id,
        //     u.user_id,
        //     u.team_id || null,
        //     u.group_id || null,
        //     time_limit || 0,
        //     started_at,
        //     ended_at,
        //     null,
        //     "scheduled",
        //     now,
        //     now,
        //   ]);
        // }
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
      message: `Assessment assigned to ${values.length} user(s) successfully`,
    });
  } catch (error) {
    console.error("Error assigning quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getQuizAssignments = async (req, res) => {
  const { quiz_session_id } = req.params; // now from quiz_sessions
  try {
    // 1) Fetch all assignments with user info for this session
    const [assignments] = await db.query(
      `SELECT 
         qa.*, 
         u.name AS user_name,
         u.email AS user_email
       FROM quiz_assignments qa
       JOIN users u ON qa.user_id = u.id
       WHERE qa.quiz_session_id = ?`,
      [quiz_session_id]
    );

    // 2) Summary for this quiz_session
    const [summary] = await db.query(
      `SELECT
         qs.max_questions,

         -- total questions linked to the quiz for this session
         (SELECT COUNT(*) 
            FROM questions 
            WHERE quiz_id = qs.quiz_id) AS question_count,

         COUNT(*) AS total_assigned,

         SUM(CASE WHEN qa.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
         SUM(CASE WHEN qa.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
         SUM(CASE WHEN qa.status = 'passed' THEN 1 ELSE 0 END) AS passed_count,
         SUM(CASE WHEN qa.status = 'failed' THEN 1 ELSE 0 END) AS failed_count,
         SUM(CASE WHEN qa.status = 'under_review' THEN 1 ELSE 0 END) AS under_review_count,
         SUM(CASE WHEN qa.status = 'terminated' THEN 1 ELSE 0 END) AS terminated_count,

         -- took exam = passed + failed + terminated
         SUM(CASE WHEN qa.status IN ('passed','failed','terminated') THEN 1 ELSE 0 END) AS took_exam_count,

         -- average score of users who took exam
         ROUND(AVG(CASE WHEN qa.status IN ('passed','failed','terminated') 
                        AND qa.score IS NOT NULL THEN qa.score END), 2) AS avg_score,

         -- schedule from session (not quiz now)
         qs.schedule_start_at AS started_at,
         qs.schedule_end_at AS ended_at,

         -- join for quiz name
         q.title AS quiz_name

       FROM quiz_assignments qa
       JOIN quiz_sessions qs ON qs.id = qa.quiz_session_id
       JOIN quizzes q ON q.id = qs.quiz_id
       WHERE qa.quiz_session_id = ?`,
      [quiz_session_id]
    );
    console.log("Assignments:", assignments);
    console.log("Summary:", summary[0]);
    res.json({
      success: true,
      data: {
        assignments,
        summary: {
          ...summary[0],
          questionCount: summary[0].question_count,
        },
      },
    });
    // console.log("data",res.data.summary);
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
      .json({ success: false, message: "Assessment ID is required" });
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

exports.getQuizReportDetails = async (req, res) => {
  const { session_id } = req.params;
  const {
    group = "all",
    team = "all",
    status = "all",
    location = "all",
    minScore, // optional
  } = req.query;

  try {
    // Base query with joins
    let query = `
      SELECT 
        qa.id as assignment_id,
        qa.quiz_id,
        qa.quiz_session_id,
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
        g.name as group_name,
        q.title as assessmentName,      
        qs.session_name as sessionName  
      FROM quiz_assignments qa
      JOIN users u ON qa.user_id = u.id
      LEFT JOIN teams t ON qa.team_id = t.id
      LEFT JOIN groups g ON qa.group_id = g.id
      LEFT JOIN quizzes q ON qa.quiz_id = q.id          
      LEFT JOIN quiz_sessions qs ON qa.quiz_session_id = qs.id  
      WHERE qa.quiz_session_id = ?
    `;

    const params = [session_id];

    // Filters
    if (group && group !== "all") {
      query += " AND g.name = ?";
      params.push(group);
    }
    if (team && team !== "all") {
      query += " AND t.name = ?";
      params.push(team);
    }
    if (status && status !== "all") {
      query += " AND qa.status = ?";
      params.push(status);
    }
    if (location && location !== "all") {
      query += " AND u.location = ?";
      params.push(location);
    }
    if (minScore !== undefined && minScore !== "" && !isNaN(Number(minScore))) {
      query += " AND qa.score >= ?";
      params.push(Number(minScore));
    }

    query += " ORDER BY qa.created_at DESC";

    // Execute query
    const [rows] = await db.query(query, params);

    // Extract assessmentName and sessionName only once
    let assessmentName = null;
    let sessionName = null;
    if (rows.length > 0) {
      assessmentName = rows[0].assessmentName; // first row
      sessionName = rows[0].sessionName;       // first row
    }

    res.json({
      success: true,
      assessmentName,
      sessionName,
      data: rows, // all rows
    });

    console.log("Assignments for session:", session_id, "count:", rows.length);
  } catch (error) {
    console.error("Error fetching quiz report details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete assigned quiz
exports.deleteAssignedQuiz = async (req, res) => {
  try {
    const { id, quiz_id, user_id } = req.body;

    // Validate input
    if (!id || !quiz_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "id, quiz_id, and user_id are required",
      });
    }

    const [result] = await db.query(
      `
      DELETE FROM quiz_assignments
      WHERE id = ? AND quiz_id = ? AND user_id = ?
      `,
      [id, quiz_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assigned not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: `Assigned deleted successfully (id: ${id}, quiz_id: ${quiz_id}, user_id: ${user_id})`,
    });
  } catch (error) {
    console.error("Error deleting assigned quiz:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.rescheduleAssignedQuiz = async (req, res) => {
  try {
    const { id, quiz_id, user_id } = req.body;
    console.log("Reschedule payload:", req.body);

    // Validate input
    if (!id || !quiz_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "id, quiz_id, and user_id are required",
      });
    }

    // Update quiz_assignments
    const [updateResult] = await db.query(
      `
      UPDATE quiz_assignments
      SET 
        status = 'scheduled',
        user_started_at = NULL,
        user_ended_at = NULL,
        score = NULL,
        reassigned = reassigned + 1
      WHERE id = ? AND quiz_id = ? AND user_id = ?
      `,
      [id, quiz_id, user_id]
    );

    if (updateResult.affectedRows === 0) {
      await db.rollback();
      return res.status(404).json({
        success: false,
        message: "Assigned assessment not found or update failed",
      });
    }

    // Delete assigned questions for this assignment
    await db.query(
      `
      DELETE FROM assigned_questions
      WHERE assignment_id = ? AND quiz_id = ? AND user_id = ?
      `,
      [id, quiz_id, user_id]
    );
    await db.query(
      `
      DELETE FROM answers
      WHERE assignment_id = ? AND quiz_id = ? AND user_id = ?
      `,
      [id, quiz_id, user_id]
    );
    // Delete certificate(s) linked to this assignment & session
    // Delete certificate(s) linked to this assignment & session
    await db.query(
      `
      DELETE FROM certificates
      WHERE quiz_assignment_id = ? AND quiz_session_id = (
        SELECT quiz_session_id FROM quiz_assignments WHERE id = ? AND quiz_id = ? AND user_id = ?
      ) AND quiz_id = ? AND user_id = ?
      `,
      [id, id, quiz_id, user_id, quiz_id, user_id]
    );


    res.status(200).json({
      success: true,
      message: `Assigned assessment rescheduled successfully and assigned questions cleared (id: ${id}, quiz_id: ${quiz_id}, user_id: ${user_id})`,
    });
  } catch (error) {
    console.error("Error rescheduling assigned quiz:", error);
    await db.rollback();
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// exports.exportQuizReport = async (req, res) => {
//   try {
//     const {
//       session_id,
//       group = "all",
//       team = "all",
//       status = "all",
//       location = "all",
//       minScore,
//     } = req.body;

//     if (!session_id) {
//       return res
//         .status(400)
//         .json({ success: false, message: "quiz_id is required" });
//     }

//     let query = `
//       SELECT 
//         qa.id AS assignment_id,
//         u.name AS user_name,
//         u.id AS user_id,
//         t.name AS team_name,
//         g.name AS group_name,
//         qa.time_limit,
//         qa.score,
//         qa.status,
//         u.location,
//         qa.user_started_at,
//         qa.user_ended_at,
//         qa.reassigned
//       FROM quiz_assignments qa
//       JOIN users u ON qa.user_id = u.id
//       LEFT JOIN teams t ON qa.team_id = t.id
//       LEFT JOIN groups g ON qa.group_id = g.id
//       WHERE qa.quiz_session_id = ?
//     `;

//     const params = [session_id];

//     if (group !== "all") {
//       query += " AND g.name = ?";
//       params.push(group);
//     }

//     if (team !== "all") {
//       query += " AND t.name = ?";
//       params.push(team);
//     }

//     if (status !== "all") {
//       query += " AND qa.status = ?";
//       params.push(status);
//     }

//     if (location !== "all") {
//       query += " AND u.location = ?";
//       params.push(location);
//     }

//     if (minScore) {
//       query += " AND qa.score >= ?";
//       params.push(parseFloat(minScore));
//     }

//     query += " ORDER BY u.name ASC";

//     const [rows] = await db.query(query, params);

//     if (!rows.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No records found for this quiz" });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Quiz Report");

//     worksheet.columns = [
//       { header: "User Name", key: "user_name", width: 25 },
//       { header: "User ID", key: "user_id", width: 15 },
//       { header: "Team Name", key: "team_name", width: 20 },
//       { header: "Group Name", key: "group_name", width: 20 },
//       { header: "Time Limit", key: "time_limit", width: 15 },
//       { header: "Score", key: "score", width: 10 },
//       { header: "Status", key: "status", width: 15 },
//       { header: "Location", key: "location", width: 20 },
//       { header: "User Started At", key: "user_started_at", width: 20 },
//       { header: "User Ended At", key: "user_ended_at", width: 20 },
//       { header: "Attempt No", key: "reassigned", width: 15 },
//     ];

//     rows.forEach((row) => worksheet.addRow(row));

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=Quiz_Report_${session_id}_${Date.now()}.xlsx`
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error exporting quiz report:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// Update quiz is_active status

exports.exportQuizReport = async (req, res) => {
  try {
    const {
      session_id,
      group = "all",
      team = "all",
      status = "all",
      location = "all",
      minScore,
    } = req.body;

    console.log("📤 Export request received:", req.body);

    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "quiz_id is required" });
    }

    let query = `
      SELECT 
        qa.id AS assignment_id,
        u.name AS user_name,
        u.id AS user_id,
        t.name AS team_name,
        g.name AS group_name,
        qa.time_limit,
        qa.score,
        qa.status,
        u.location,
        qa.user_started_at,
        qa.user_ended_at,
        qa.reassigned,
        qa.user_timezone
      FROM quiz_assignments qa
      JOIN users u ON qa.user_id = u.id
      LEFT JOIN teams t ON qa.team_id = t.id
      LEFT JOIN groups g ON qa.group_id = g.id
      WHERE qa.quiz_session_id = ?
    `;

    const params = [session_id];

    if (group !== "all") {
      query += " AND g.name = ?";
      params.push(group);
    }

    if (team !== "all") {
      query += " AND t.name = ?";
      params.push(team);
    }

    if (status !== "all") {
      query += " AND qa.status = ?";
      params.push(status);
    }

    if (location !== "all") {
      query += " AND u.location = ?";
      params.push(location);
    }

    if (minScore) {
      query += " AND qa.score >= ?";
      params.push(parseFloat(minScore));
    }

    query += " ORDER BY u.name ASC";

    const [rows] = await db.query(query, params);

    console.log(`✅ Rows fetched: ${rows.length}`);
    if (rows[0]) {
      console.log("🧾 Sample row:", rows[0]);
    }

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "No records found for this quiz" });
    }

    // Format start/end times with timezone
    const formattedRows = rows.map((r) => {
      const tz = r.user_timezone || "UTC";
      return {
        ...r,
        user_started_at: r.user_started_at
          ? moment.tz(r.user_started_at + "Z", tz).format("YYYY-MM-DD HH:mm")
          : "-",
        user_ended_at: r.user_ended_at
          ? moment.tz(r.user_ended_at + "Z", tz).format("YYYY-MM-DD HH:mm")
          : "-",
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Quiz Report");

    worksheet.columns = [
      { header: "User Name", key: "user_name", width: 25 },
      { header: "User ID", key: "user_id", width: 15 },
      { header: "Team Name", key: "team_name", width: 20 },
      { header: "Group Name", key: "group_name", width: 20 },
      { header: "Time Limit", key: "time_limit", width: 15 },
      { header: "Score", key: "score", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "User Started At", key: "user_started_at", width: 22 },
      { header: "User Ended At", key: "user_ended_at", width: 22 },
      { header: "Attempt No", key: "reassigned", width: 15 },
    ];

    formattedRows.forEach((row) => worksheet.addRow(row));

    console.log("📊 Excel sheet generated with", formattedRows.length, "rows");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Quiz_Report_${session_id}_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

    console.log("✅ Excel export completed successfully.");
  } catch (error) {
    console.error("❌ Error exporting quiz report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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

exports.getNormalUsersWithAssignments = async (req, res) => {
  const { quizId, sessionId } = req.query; // or req.params, depending on your route

  try {
    const [rows] = await db.execute(
      `
  SELECT
    u.id, 
    u.name,
    u.location,
    u.employee_id,
    u.team_id,
    u.group_id,
    u.controlling_team,
    u.\`group\`,
    u.email,
    u.role,
    u.phone,
    u.position,
    u.bio,
    u.is_active,
    u.profile_pic_url,
    u.created_at,
    u.updated_at,
    qa.user_started_at,
    qa.user_ended_at,
    qa.reassigned,
    qa.score,
    qa.status
  FROM users u
  LEFT JOIN quiz_assignments qa
    ON qa.id = (
      SELECT id FROM quiz_assignments
      WHERE quiz_assignments.user_id = u.id 
        AND quiz_assignments.quiz_id = ?
      ORDER BY quiz_assignments.user_ended_at DESC
      LIMIT 1
    )
  WHERE u.role = 'user'
  ORDER BY u.created_at DESC
  `,
      [quizId]
    );


const [countResult] = await db.execute(
      `SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'`
    );

    const totalUsers = countResult[0].total_users;

    res.json({ success: true,  totalUsers, data: rows });
  } catch (error) {
    console.error("Get normal users with assignments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

