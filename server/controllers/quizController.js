const db = require("../config/database");

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

exports.updateQuiz = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    timeLimit,
    passingScore,
    maxAttempts,
    scheduleStartDate,
    scheduleStartTime,
    scheduleEndDate,
    scheduleEndTime,
  } = req.body;

  // Fetch current quiz first
const [existing] = await db.query("SELECT time_limit, max_attempts FROM quizzes WHERE id = ?", [id]);
if (!existing.length) {
  return res.status(404).json({ success: false, message: "Quiz not found" });
}
const currentQuiz = existing[0];

// If not already set in DB, then require them
if ((currentQuiz.time_limit == null && (timeLimit === undefined || timeLimit === null)) ||
    (currentQuiz.max_attempts == null && (maxAttempts === undefined || maxAttempts === null))) {
  return res.status(400).json({ success: false, message: "Time limit and max attempts are required" });
}



  try {
    const [result] = await db.query(
      `UPDATE quizzes SET 
  ${name ? "title = ?," : ""}
  ${timeLimit !== undefined ? "time_limit = ?," : ""}
  passing_score = ?,
  ${maxAttempts !== undefined ? "max_attempts = ?," : ""}
  schedule_start_date = ?,
  schedule_start_time = ?,
  schedule_end_date = ?,
  schedule_end_time = ?,
  updated_at = NOW()
WHERE id = ?`,
[
  ...(name ? [name] : []),
  ...(timeLimit !== undefined ? [timeLimit] : []),
  passingScore,
  ...(maxAttempts !== undefined ? [maxAttempts] : []),
  scheduleStartDate,
  scheduleStartTime,
  scheduleEndDate,
  scheduleEndTime,
  id,
]


    );

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
      `SELECT time_limit, 
              schedule_start_date, schedule_start_time, 
              schedule_end_date, schedule_end_time
       FROM quizzes 
       WHERE id = ? LIMIT 1`,
      [quiz_id]
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const { time_limit, schedule_start_date, schedule_start_time, schedule_end_date, schedule_end_time } = quizRows[0];

    // 🚨 Check if scheduling is missing
    if (!schedule_start_date || !schedule_start_time || !schedule_end_date || !schedule_end_time) {
      return res.status(400).json({
        success: false,
        message: "This quiz has not been scheduled. Please schedule it before assigning.",
      });
    }

    // Combine date + time into SQL-compatible strings
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
      return res.status(404).json({ success: false, message: "Users not found" });
    }

    // 3. Prepare values
    const now = new Date();
    const values = userRows.map((u) => [
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

    // 4. Insert
    await db.query(
      `INSERT INTO quiz_assignments 
        (quiz_id, user_id, team_id, group_id, time_limit, started_at, ended_at, score, status, created_at, updated_at) 
       VALUES ?`,
      [values]
    );

    res.status(201).json({ success: true, message: "Quiz assigned successfully" });
  } catch (error) {
    console.error("Error assigning quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// Fetch assigned users for a quiz
exports.getQuizAssignments = async (req, res) => {
  const { quiz_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT qa.*, u.name as user_name 
       FROM quiz_assignments qa
       JOIN users u ON qa.user_id = u.id
       WHERE qa.quiz_id = ?`,
      [quiz_id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getQuizQuestions = async (req, res) => {
  const { id } = req.params; // quizId
  const quizId = id;

  if (!quizId) {
    return res.status(400).json({ success: false, message: "Quiz ID is required" });
  }

  try {
    // Fetch quiz questions along with quiz title
    const [rows] = await db.query(
      `SELECT q.id, q.question_text, q.question_type, q.options, q.correct_answer, 
              q.explanation, q.difficulty_level, qu.title AS quiz_name
       FROM questions q
       JOIN quizzes qu ON q.quiz_id = qu.id
       WHERE q.quiz_id = ? AND q.is_active = 1
       ORDER BY q.id ASC`,
      [quizId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


