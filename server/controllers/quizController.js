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
         q.id,
         q.title,
         q.description,
         q.subject_id,
         q.time_limit,
         q.passing_score,
         q.max_attempts,
         q.is_active,
         q.created_by,
         q.created_at,
         q.updated_at,
         COUNT(ques.id) AS question_count
       FROM quizzes q
       LEFT JOIN questions ques ON ques.quiz_id = q.id
       WHERE q.is_active = 1
       GROUP BY q.id
       ORDER BY q.created_at DESC`
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
