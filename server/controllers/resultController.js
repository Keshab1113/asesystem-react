const db = require("../config/database"); // MySQL connection
require("dotenv").config();

exports.getQuizResult = async (req, res) => {
  const { assignmentId } = req.params;

  if (!assignmentId) {
    return res.status(400).json({ message: "Assignment ID is required" });
  }

  try {
    // Fetch assignment + quiz details
    const [rows] = await db.query(
      `SELECT 
  qa.id AS assignment_id,
  qa.quiz_id,
  qa.quiz_session_id,
  qa.user_id,
  qa.user_started_at,
  qa.user_ended_at,
  qa.score AS user_score,
  qs.max_questions,
  qs.passing_score
FROM quiz_assignments qa
JOIN quizzes q ON qa.quiz_id = q.id
JOIN quiz_sessions qs ON qa.quiz_session_id = qs.id
WHERE qa.id = ?
`,
      [assignmentId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const assignment = rows[0];
    const {
      quiz_id,
      user_id,
      max_questions,
      passing_score,
      user_started_at,
      user_ended_at,
      user_score,
    } = assignment;

    // Total questions
    const totalQuestions = max_questions || 0;

    // Correct answers
    const [correctRows] = await db.query(
      `SELECT COUNT(*) AS correctCount
       FROM assigned_questions
       WHERE assignment_id = ? AND is_correct = 1`,
      [assignmentId]
    );
    const correctAnswers = correctRows[0]?.correctCount || 0;

    // Wrong answers
    // 🔹 Get current reassigned cycle for this assignment
const [qaRows] = await db.query(
  `SELECT reassigned 
   FROM quiz_assignments 
   WHERE id = ?`,
  [assignmentId]
);
const reassignedCycle = qaRows[0]?.reassigned || 0;

const [wrongRows] = await db.query(
  `SELECT 
      aq.id AS assigned_question_id,
      aq.question_id,
      q.question_text,
      q.options,
      q.correct_answer,
      a.answer AS userAnswer
   FROM assigned_questions aq
   JOIN questions q ON aq.question_id = q.id
   LEFT JOIN answers a 
      ON a.quiz_id = aq.quiz_id 
      AND a.assignment_id = aq.assignment_id 
      AND a.question_id = aq.question_id 
      AND a.user_id = aq.user_id
   WHERE aq.assignment_id = ? 
     AND aq.user_id = ? 
     AND aq.reassigned = ? 
     AND (aq.is_correct = 0 OR aq.answer_id IS NULL)`,
  [assignmentId, assignment.user_id, reassignedCycle]
);

    const wrongAnswers = wrongRows.map((wa) => ({
  id: wa.question_id,
  question: wa.question_text,
  options: JSON.parse(wa.options || "[]"),
  userAnswer: wa.userAnswer || null, // keep null for skipped/wrong answers
  correctAnswer: wa.correct_answer,
}));


    // Time spent
    let timeSpent = null;
    if (user_started_at && user_ended_at) {
      const start = new Date(user_started_at);
      const end = new Date(user_ended_at);
      const diffMs = end - start;
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      timeSpent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    const result = {
        quizId: quiz_id,          
      totalQuestions,
      correctAnswers,
      timeSpent,
      score: user_score || 0,
      passingScore: passing_score || 0,
      wrongAnswers,
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
};
