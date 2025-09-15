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
