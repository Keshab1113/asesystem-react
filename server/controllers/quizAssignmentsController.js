const db = require("../config/database");

// Get all quiz assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM quiz_assignments ORDER BY id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching quiz assignments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAssignmentById = async (req, res) => {
  const { id } = req.params; // this is user_id
  try {
    const [rows] = await db.query(
      `SELECT 
        qa.id AS assignment_id,
        qa.quiz_id,
        qa.user_id,
        qa.team_id,
        qa.group_id,
        qa.time_limit AS assignment_time_limit,
        qa.user_started_at,
        qa.user_ended_at,
        qa.score,
        qa.status,
        qa.created_at AS assignment_created_at,
        qa.updated_at AS assignment_updated_at,
        q.id AS quiz_id,
        q.title AS quiz_title,
        q.description AS quiz_description,
        q.difficulty_level,
        q.subject_id,
        q.company_id,
        q.time_limit AS quiz_time_limit,
        q.passing_score,
        q.max_attempts,
        q.max_questions,   -- ✅ Added this line
        q.is_active,
        q.created_by,
        q.created_at AS quiz_created_at,
        q.updated_at AS quiz_updated_at,
        q.schedule_start_date,
        q.schedule_start_time,
        q.schedule_end_date,
        q.schedule_end_time
      FROM quiz_assignments qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assignments found for this user",
      });
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching assignment with quiz details:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.startAssessment = async (req, res) => {
    
  try {
    const { quiz_id, user_id } = req.body;
 

    if (!quiz_id || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "quiz_id and user_id required" });
    }

    const startedAt = new Date(); // current date & time

    // Update the quiz_assignments table
    await db.query(
      `UPDATE quiz_assignments 
       SET user_started_at = ?, status = ? 
       WHERE quiz_id = ? AND user_id = ?`,
      [startedAt, "in_progress", quiz_id, user_id]
    );

    return res.json({
      success: true,
      message: "Assessment started",
      user_started_at: startedAt,
    });
  } catch (error) {
    console.error("Error in startAssessment:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

 
exports.endAssessment = async (req, res) => {
  try {
    const { quiz_id, user_id, assignment_id, passing_score, answers } = req.body;

    if (!quiz_id || !user_id || !assignment_id || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "quiz_id, user_id, assignment_id, and answers required",
      });
    }

    let score = 0;

   for (const { question_id, answer } of answers) {
  // question_id here might be assigned_questions.id, so map it
  const [aqRows] = await db.query(
    "SELECT question_id FROM assigned_questions WHERE id = ? AND assignment_id = ? AND user_id = ?",
    [question_id, assignment_id, user_id]
  );

  if (!aqRows.length) continue;
  const real_question_id = aqRows[0].question_id; // ✅ actual questions.id

  // Get correct answer from questions table
  const [qRows] = await db.query(
    "SELECT correct_answer FROM questions WHERE id = ?",
    [real_question_id]
  );
  if (!qRows.length) continue;

  const correct_answer = qRows[0].correct_answer;
  const is_correct = answer.trim() === correct_answer.trim() ? 1 : 0;

  // Insert into answers table with real question id
  const [ansRes] = await db.query(
    `INSERT INTO answers 
     (quiz_id, question_id, user_id, assignment_id, answer, is_correct) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [quiz_id, real_question_id, user_id, assignment_id, answer, is_correct]
  );

  const answer_id = ansRes.insertId;

  // Update assigned_questions row (using assigned_questions.id)
  await db.query(
    `UPDATE assigned_questions 
     SET answer_id = ?, is_correct = ?, correct_answers = ?, score = ? 
     WHERE id = ? AND assignment_id = ? AND user_id = ?`,
    [answer_id, is_correct, correct_answer, is_correct, question_id, assignment_id, user_id]
  );

  if (is_correct) score++;
}


    // ✅ Calculate percentage & status
    const percentage = (score / answers.length) * 100;
    const status = percentage >= passing_score ? "passed" : "failed";

    // ✅ Update quiz_assignments
    await db.query(
      `UPDATE quiz_assignments 
       SET user_ended_at = ?, status = ?, score = ? 
       WHERE id = ? AND quiz_id = ? AND user_id = ?`,
      [new Date(), status, percentage, assignment_id, quiz_id, user_id]
    );

    return res.json({
      success: true,
      message: "Assessment ended",
      score,
      percentage,
      status,
    });
  } catch (error) {
    console.error("Error in endAssessment:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



 
exports.assignRandomQuestions = async (req, res) => {
   
  const { quizId, userId, assignmentId } = req.body;

  if (!quizId || !userId || !assignmentId) {
    return res.status(400).json({ success: false, message: "quizId, userId, and assignmentId are required" });
  }

  try {
    // 1. Check if questions already assigned for this user + quiz + assignment
    const [existingRows] = await db.query(
      `SELECT aq.id, q.id AS question_id, q.question_text, q.question_type, q.options, q.correct_answer, q.explanation, q.difficulty_level,
              aq.answer_id, aq.is_correct, aq.correct_answers, aq.score
       FROM assigned_questions aq
       JOIN questions q ON aq.question_id = q.id
       WHERE aq.quiz_id = ? AND aq.user_id = ? AND aq.assignment_id = ?`,
      [quizId, userId, assignmentId]
    );

    if (existingRows.length > 0) {
      return res.json({ success: true, message: "Questions already assigned", data: existingRows });
    }

    // 2. Get quiz info (max_questions)
    const [quizRows] = await db.query(`SELECT max_questions FROM quizzes WHERE id = ?`, [quizId]);
    if (!quizRows.length) return res.status(404).json({ success: false, message: "Quiz not found" });

    const maxQuestions = quizRows[0].max_questions || 10;

    // 3. Get all active questions
    const [questionRows] = await db.query(
      `SELECT id, question_text, question_type, options, correct_answer, explanation, difficulty_level
       FROM questions 
       WHERE quiz_id = ? AND is_active = 1`,
      [quizId]
    );
    if (!questionRows.length) return res.status(404).json({ success: false, message: "No active questions found" });

    // 4. Shuffle + pick
    const shuffled = [...questionRows].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxQuestions);

    // 5. Save in assigned_questions
   await Promise.all(
  selected.map((q) =>
    db.query(
      `INSERT INTO assigned_questions 
         (quiz_id, user_id, assignment_id, question_id, answer_id, is_correct, correct_answers, score) 
       VALUES (?, ?, ?, ?, NULL, 0, ?, 0)`,
      [quizId, userId, assignmentId, q.id, q.correct_answer]
    )
  )
);


    return res.json({ success: true, message: "Random questions assigned successfully", data: selected });
  } catch (err) {
    console.error("Error assigning random questions:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.fetchAssignedQuestions = async (req, res) => {
  const { quizId } = req.params;
  const { userId, assignmentId } = req.query;

  if (!quizId || !userId || !assignmentId) {
    return res.status(400).json({ success: false, message: "quizId, userId, and assignmentId are required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT aq.id, q.id AS question_id, q.question_text, q.question_type, q.options, q.correct_answer, q.explanation, q.difficulty_level,
              aq.answer_id, aq.is_correct, aq.correct_answers, aq.score
       FROM assigned_questions aq
       JOIN questions q ON aq.question_id = q.id
       WHERE aq.quiz_id = ? AND aq.user_id = ? AND aq.assignment_id = ?`,
      [quizId, userId, assignmentId]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching assigned questions:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
