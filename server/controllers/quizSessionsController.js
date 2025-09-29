const db = require("../config/database"); // Your MySQL connection

// Get all quiz sessions (optionally filtered by quiz_id)
exports.getQuizSessions = async (req, res) => {
  const { quizId } = req.query; // optional query param

  try {
    let sql = `
      SELECT 
        qs.id AS sessionId,
        qs.quiz_id,
        q.title AS quizTitle,
        qs.session_name,
        qs.time_limit,
        qs.passing_score,
        qs.max_attempts,
        qs.max_questions,
        qs.schedule_start_at,
        qs.schedule_end_at,
        qs.created_at,
        qs.updated_at
      FROM quiz_sessions qs
      JOIN quizzes q ON qs.quiz_id = q.id
    `;

    const values = [];
    if (quizId) {
      sql += " WHERE qs.quiz_id = ?";
      values.push(quizId);
    }

    sql += " ORDER BY qs.created_at DESC";

    const [sessions] = await db.query(sql, values);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a session
exports.updateQuizSession = async (req, res) => {
  const { sessionId } = req.params;
  const {
    sessionName,
    timeLimit,
    passingScore,
    maxAttempts,
    maxQuestions,
    scheduleStartDate,
    scheduleStartTime,
    scheduleEndDate,
    scheduleEndTime,
  } = req.body;

  const toUTC = (date, time) => {
    if (!date || !time) return null;
    const local = new Date(`${date}T${time}:00`);
    if (isNaN(local.getTime())) return null;
    return new Date(local.getTime() - local.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  };

  try {
    const [existing] = await db.query(
      "SELECT * FROM quiz_sessions WHERE id=?",
      [sessionId]
    );
    if (!existing.length)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    const updates = [];
    const values = [];

    if (sessionName !== undefined) {
      updates.push("session_name=?");
      values.push(sessionName);
    }
    if (timeLimit !== undefined) {
      updates.push("time_limit=?");
      values.push(timeLimit);
    }
    if (passingScore !== undefined) {
      updates.push("passing_score=?");
      values.push(passingScore);
    }
    if (maxAttempts !== undefined) {
      updates.push("max_attempts=?");
      values.push(maxAttempts);
    }
    if (maxQuestions !== undefined) {
      updates.push("max_questions=?");
      values.push(maxQuestions);
    }

    const startUTC = toUTC(scheduleStartDate, scheduleStartTime);
    if (startUTC) {
      updates.push("schedule_start_at=?");
      values.push(startUTC);
    }

    const endUTC = toUTC(scheduleEndDate, scheduleEndTime);
    if (endUTC) {
      updates.push("schedule_end_at=?");
      values.push(endUTC);
    }

    updates.push("updated_at=NOW()");
    values.push(sessionId);

    await db.query(
      `UPDATE quiz_sessions SET ${updates.join(", ")} WHERE id=?`,
      values
    );
    res.json({ success: true, message: "Session updated successfully" });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.assignSession = async (req, res) => {
  const { session_id, user_ids } = req.body;

  if (!session_id || !user_ids || user_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Session ID and users are required",
    });
  }

  try {
    // 1. Fetch session details
    const [sessionRows] = await db.query(
      `SELECT id, quiz_id, time_limit, max_attempts,
              schedule_start_at, schedule_end_at
       FROM quiz_sessions
       WHERE id = ? LIMIT 1`,
      [session_id]
    );

    if (!sessionRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    const {
      id: quiz_session_id,
      quiz_id,
      time_limit,
      max_attempts,
      schedule_start_at,
      schedule_end_at,
    } = sessionRows[0];

    if (!schedule_start_at || !schedule_end_at) {
      return res.status(400).json({
        success: false,
        message:
          "This session has not been scheduled. Please schedule it before assigning.",
      });
    }

    const started_at = schedule_start_at;
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

    // 3. Filter out users who already have an assignment for this session
    // 3. Filter out users who already have an assignment for this session
const [existingAssignments] = await db.query(
  `SELECT qa.user_id, COUNT(qa.id) AS assignment_count
   FROM quiz_assignments qa
   WHERE qa.quiz_session_id = ? AND qa.user_id IN (?)
   GROUP BY qa.user_id`,
  [quiz_session_id, user_ids]
);

const existingMap = {};
existingAssignments.forEach((row) => {
  existingMap[row.user_id] = {
    assignments: row.assignment_count,
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
          quiz_session_id,
          u.user_id,
          u.team_id || null,
          u.group_id || null,
          time_limit || 0,
          started_at,
          ended_at,
          null, // score
          "scheduled", // status
          null, // user_started_at
          null, // user_ended_at
          0, // reassigned
          now,
          now,
        ]);
      } else {
        // ✅ Already assigned → skip or check attempts
        // if (existing.attempts < max_attempts) {
        //   values.push([...]);
        // }
      }
    }

    if (values.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No eligible users to assign (already assigned or max attempts reached).",
      });
    }

    // 4. Insert assignments
    await db.query(
      `INSERT INTO quiz_assignments 
        (quiz_id, quiz_session_id, user_id, team_id, group_id, time_limit, started_at, ended_at, score, status, user_started_at, user_ended_at, reassigned, created_at, updated_at) 
       VALUES ?`,
      [values]
    );

    res.status(201).json({
      success: true,
      message: `Session assigned to ${values.length} user(s) successfully`,
    });
  } catch (error) {
    console.error("Error assigning session:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createSession = async (req, res) => {
  const { quiz_id } = req.body;

  if (!quiz_id) {
    return res.status(400).json({ success: false, message: "quiz_id is required" });
  }

  try {
    // 1️⃣ Check for existing session with no schedule
    const [existing] = await db.query(
      `SELECT id FROM quiz_sessions WHERE quiz_id = ? AND schedule_start_at IS NULL`,
      [quiz_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a new session. Existing session without schedule found.",
      });
    }

    // 2️⃣ Fetch quiz info to get title, time_limit, passing_score, max_attempts
    const [quizData] = await db.query(
      `SELECT title, time_limit, passing_score, max_attempts FROM quizzes WHERE id = ?`,
      [quiz_id]
    );

    if (quizData.length === 0) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const quiz = quizData[0];

    // 3️⃣ Auto-generate session_name: quiz title + session count
    const [sessionCount] = await db.query(
      `SELECT COUNT(*) as cnt FROM quiz_sessions WHERE quiz_id = ?`,
      [quiz_id]
    );

    const sessionName = `${quiz.title} ${sessionCount[0].cnt + 1}`;

    // 4️⃣ Insert new session (created_by can be NULL or a fixed admin ID, e.g., 1)
    const [result] = await db.query(
      `INSERT INTO quiz_sessions
       (quiz_id, session_name, time_limit, passing_score, max_attempts, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [quiz_id, sessionName, quiz.time_limit, quiz.passing_score, quiz.max_attempts, 1] // 1 = admin
    );

    res.json({
      success: true,
      message: "Assessment session created successfully",
      session_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating Assessment session:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
