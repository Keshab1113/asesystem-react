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

// End Assessment
exports.endAssessment = async (req, res) => {
  try {
    const { quiz_id, user_id, score, passing_score } = req.body;

    if (!quiz_id || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: "quiz_id and user_id required" });
    }

    const endedAt = new Date();
    const percentage = score * 10;
    const status = percentage >= passing_score ? "passed" : "failed";

    // Update the quiz_assignments table
    await db.query(
      `UPDATE quiz_assignments 
       SET user_ended_at = ?, status = ?, score = ? 
       WHERE quiz_id = ? AND user_id = ?`,
      [endedAt, status, percentage, quiz_id, user_id]
    );

    return res.json({
      success: true,
      message: "Assessment ended",
      user_ended_at: endedAt,
    });
  } catch (error) {
    console.error("Error in endAssessment:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
