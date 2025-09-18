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
        qa.started_at,
        qa.ended_at,
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
      return res
        .status(404)
        .json({ success: false, message: "No assignments found for this user" });
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching assignment with quiz details:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

