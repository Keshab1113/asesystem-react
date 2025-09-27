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
      qa.quiz_session_id, 
      qa.team_id,
      qa.group_id,
      qa.time_limit AS assignment_time_limit,
      qa.user_started_at,
      qa.user_ended_at,
      qa.score,
      qa.status,
      qa.reassigned,
      qa.created_at AS assignment_created_at,
      qa.updated_at AS assignment_updated_at,

      q.id AS quiz_id,
      q.title AS quiz_title,
      q.description AS quiz_description,
      q.difficulty_level,
      q.subject_id,
      q.company_id,
      q.is_active,
      q.created_by,
      q.created_at AS quiz_created_at,
      q.updated_at AS quiz_updated_at,

      -- Now everything below comes from quiz_sessions table
      qs.time_limit AS quiz_time_limit,
      qs.passing_score,
      qs.max_attempts,
      qs.max_questions,
      qs.schedule_start_at,
      qs.schedule_end_at

  FROM quiz_assignments qa
  JOIN quizzes q ON qa.quiz_id = q.id
  JOIN quiz_sessions qs ON qa.quiz_session_id = qs.id
  WHERE qa.user_id = ? AND q.is_active = 1
  ORDER BY qs.schedule_start_at DESC`,
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
    const { quiz_id, user_id, assignment_id, quiz_session_id } = req.body;
    console.log(req.body);

    if (!quiz_id || !user_id || !assignment_id || !quiz_session_id) {
      return res.status(400).json({
        success: false,
        message:
          "quiz_id, user_id, assignment_id, and quiz_session_id required",
      });
    }

    const startedAt = new Date(); // current date & time

    // Update the quiz_assignments table
    await db.query(
      `UPDATE quiz_assignments 
   SET user_started_at = ?, status = ? 
   WHERE id = ? AND quiz_id = ? AND quiz_session_id = ? AND user_id = ?`,
      [
        new Date(),
        "in_progress",
        assignment_id,
        quiz_id,
        quiz_session_id,
        user_id,
      ]
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

// exports.endAssessment = async (req, res) => {
//   try {
//     const {
//       quiz_id,
//       user_id,
//       assignment_id,
//       passing_score,
//       answers,
//       quiz_session_id,
//     } = req.body;

//     if (!quiz_id || !user_id || !assignment_id || !Array.isArray(answers)) {
//       return res.status(400).json({
//         success: false,
//         message: "quiz_id, user_id, assignment_id, and answers required",
//       });
//     }

//     let score = 0;

//     // 🔹 Insert/update each answer
//     for (const { question_id, answer } of answers) {
//       // question_id here might be assigned_questions.id, so map it
//       const [aqRows] = await db.query(
//         "SELECT question_id FROM assigned_questions WHERE id = ? AND assignment_id = ? AND quiz_session_id = ? AND user_id = ?",
//         [question_id, assignment_id, quiz_session_id, user_id]
//       );

//       if (!aqRows.length) continue;
//       const real_question_id = aqRows[0].question_id; // ✅ actual questions.id

//       // Get correct answer from questions table
//       const [qRows] = await db.query(
//         "SELECT correct_answer FROM questions WHERE id = ?",
//         [real_question_id]
//       );
//       if (!qRows.length) continue;

//       const correct_answer = qRows[0].correct_answer;
//       const is_correct =
//         answer && answer.trim() === correct_answer.trim() ? 1 : 0;

//       // Insert into answers table with real question id
//       const [ansRes] = await db.query(
//         `INSERT INTO answers (quiz_id, question_id, user_id, assignment_id, answer, is_correct, answered_at) 
//    VALUES (?, ?, ?, ?, ?, ?, NOW())
//    ON DUPLICATE KEY UPDATE 
//      answer = VALUES(answer),
//      is_correct = VALUES(is_correct),
//      answered_at = NOW()`,
//         [
//           quiz_id,
//           real_question_id,
//           user_id,
//           assignment_id,
//           answer || "",
//           is_correct,
//         ]
//       );

//       const answer_id = ansRes.insertId;

//       // Update assigned_questions row (using assigned_questions.id)
//       // Only update answer_id if we actually have a valid answer inserted
//       await db.query(
//         `UPDATE assigned_questions 
//    SET answer_id = ?, is_correct = ?, correct_answers = ?, score = ? 
//    WHERE id = ? AND assignment_id = ? AND user_id = ?`,
//         [
//           answer_id || null, // use null instead of 0 to satisfy FK constraint
//           is_correct,
//           correct_answer,
//           is_correct,
//           question_id,
//           assignment_id,
//           user_id,
//         ]
//       );

//       if (is_correct) score++;
//     }

//     // 🔹 Total assigned questions
//     const [assignedCountRows] = await db.query(
//       "SELECT COUNT(*) as totalAssigned FROM assigned_questions WHERE assignment_id = ? AND user_id = ?",
//       [assignment_id, user_id]
//     );
//     const totalAssigned = assignedCountRows[0]?.totalAssigned || 1;

//     // 🔹 Count how many answered
//     const [answeredCountRows] = await db.query(
//       "SELECT COUNT(*) as totalAnswered FROM assigned_questions WHERE assignment_id = ? AND user_id = ? AND answer_id IS NOT NULL",
//       [assignment_id, user_id]
//     );
//     const totalAnswered = answeredCountRows[0]?.totalAnswered || 0;

//     let status = "terminated";
//     let percentage = 0;

//     if (totalAnswered === totalAssigned) {
//       // All answered → calculate result
//       percentage = (score / totalAssigned) * 100;
//       status = percentage >= passing_score ? "passed" : "failed";
//     }

//     // ✅ Update quiz_assignments
//     await db.query(
//       `UPDATE quiz_assignments 
//    SET user_ended_at = ?, status = ?, score = ?, reassigned = reassigned + 1 
//    WHERE id = ? AND quiz_session_id = ? AND user_id = ?`,
//       [new Date(), status, percentage, assignment_id, quiz_session_id, user_id]
//     );

//     return res.json({
//       success: true,
//       message: "Assessment ended",
//       score,
//       percentage,
//       status,
//     });
//   } catch (error) {
//     console.error("Error in endAssessment:", error);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// exports.endAssessment = async (req, res) => {
//   try {
//     const {
//       quiz_id,
//       user_id,
//       assignment_id,
//       passing_score,
//       answers,
//       quiz_session_id,
//     } = req.body;

//     if (!quiz_id || !user_id || !assignment_id || !Array.isArray(answers)) {
//       return res.status(400).json({
//         success: false,
//         message: "quiz_id, user_id, assignment_id, and answers required",
//       });
//     }

//     // 🔹 Get current reassigned cycle for this assignment
//     const [qaRows] = await db.query(
//       `SELECT reassigned 
//        FROM quiz_assignments 
//        WHERE id = ? AND user_id = ? AND quiz_session_id = ?`,
//       [assignment_id, user_id, quiz_session_id]
//     );
//     if (!qaRows.length) {
//       return res.status(404).json({ success: false, message: "Assignment not found" });
//     }
//     const reassignedCycle = qaRows[0].reassigned;

//     let score = 0;

//     // 🔹 Insert/update each answer
//     for (const { question_id, answer } of answers) {
//       // Map assigned_questions.id → real questions.id (filtered by reassigned cycle)
//       const [aqRows] = await db.query(
//         `SELECT question_id 
//          FROM assigned_questions 
//          WHERE id = ? 
//            AND assignment_id = ? 
//            AND quiz_session_id = ? 
//            AND user_id = ? 
//            AND reassigned = ?`,
//         [question_id, assignment_id, quiz_session_id, user_id, reassignedCycle]
//       );

//       if (!aqRows.length) continue;
//       const real_question_id = aqRows[0].question_id;

//       // Get correct answer
//       const [qRows] = await db.query(
//         "SELECT correct_answer FROM questions WHERE id = ?",
//         [real_question_id]
//       );
//       if (!qRows.length) continue;

//       const correct_answer = qRows[0].correct_answer;
//       const is_correct =
//         answer && answer.trim() === correct_answer.trim() ? 1 : 0;

//       // Insert/update into answers table
//       const [ansRes] = await db.query(
//         `INSERT INTO answers (quiz_id, question_id, user_id, assignment_id, answer, is_correct, answered_at) 
//          VALUES (?, ?, ?, ?, ?, ?, NOW())
//          ON DUPLICATE KEY UPDATE 
//            answer = VALUES(answer),
//            is_correct = VALUES(is_correct),
//            answered_at = NOW()`,
//         [
//           quiz_id,
//           real_question_id,
//           user_id,
//           assignment_id,
//           answer || "",
//           is_correct,
//         ]
//       );

//       const answer_id = ansRes.insertId || null;

//       // Update assigned_questions row
//       await db.query(
//         `UPDATE assigned_questions 
//          SET answer_id = ?, is_correct = ?, correct_answers = ?, score = ? 
//          WHERE id = ? AND assignment_id = ? AND user_id = ? AND reassigned = ?`,
//         [
//           answer_id,
//           is_correct,
//           correct_answer,
//           is_correct,
//           question_id, // assigned_questions.id
//           assignment_id,
//           user_id,
//           reassignedCycle,
//         ]
//       );

//       if (is_correct) score++;
//     }

//     // 🔹 Total assigned questions (filtered by reassigned cycle)
//     const [assignedCountRows] = await db.query(
//       `SELECT COUNT(*) as totalAssigned 
//        FROM assigned_questions 
//        WHERE assignment_id = ? AND user_id = ? AND reassigned = ?`,
//       [assignment_id, user_id, reassignedCycle]
//     );
//     const totalAssigned = assignedCountRows[0]?.totalAssigned || 1;

//     // 🔹 Count answered (answer_id is set)
//     const [answeredCountRows] = await db.query(
//       `SELECT COUNT(*) as totalAnswered 
//        FROM assigned_questions 
//        WHERE assignment_id = ? AND user_id = ? AND reassigned = ? AND answer_id IS NOT NULL`,
//       [assignment_id, user_id, reassignedCycle]
//     );
//     const totalAnswered = answeredCountRows[0]?.totalAnswered || 0;

//     let status = "terminated";
//     let percentage = 0;

//     if (totalAnswered === totalAssigned) {
//       percentage = (score / totalAssigned) * 100;
//       status = percentage >= passing_score ? "passed" : "failed";
//     }

//     // ✅ Update quiz_assignments (without changing reassigned counter)
//         // ✅ Update quiz_assignments (without changing reassigned counter)
//     await db.query(
//       `UPDATE quiz_assignments 
//        SET user_ended_at = ?, status = ?, score = ? 
//        WHERE id = ? AND quiz_session_id = ? AND user_id = ?`,
//       [new Date(), status, percentage, assignment_id, quiz_session_id, user_id]
//     );

//     // 🔹 Fetch wrong answers (filtered by reassigned cycle)
//     // 🔹 Fetch wrong answers (filtered by reassigned cycle)
// // 🔹 Fetch wrong or unanswered questions (filtered by reassigned cycle)
// const [wrongAnswers] = await db.query(
//   `SELECT 
//       aq.id, 
//       q.question_text AS question, 
//       q.options, 
//       q.correct_answer AS correctAnswer, 
//       a.answer AS userAnswer
//    FROM assigned_questions aq
//    JOIN questions q ON aq.question_id = q.id
//    LEFT JOIN answers a 
//       ON a.quiz_id = aq.quiz_id 
//       AND a.assignment_id = aq.assignment_id 
//       AND a.question_id = aq.question_id 
//       AND a.user_id = aq.user_id
//    WHERE aq.assignment_id = ? 
//      AND aq.user_id = ? 
//      AND aq.quiz_session_id = ? 
//      AND aq.reassigned = ? 
//      AND (aq.is_correct = 0 OR aq.answer_id IS NULL)`,
//   [assignment_id, user_id, quiz_session_id, reassignedCycle]
// );



//     return res.json({
//       success: true,
//       message: "Assessment ended",
//       score,
//       percentage,
//       status,
//       wrongAnswers,
//     });

//   } catch (error) {
//     console.error("Error in endAssessment:", error);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

exports.endAssessment = async (req, res) => {
  try {
    const {
      quiz_id,
      user_id,
      assignment_id,
      passing_score,
      answers,
      quiz_session_id,
    } = req.body;
console.log(req.body);
    if (!quiz_id || !user_id || !assignment_id || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "quiz_id, user_id, assignment_id, and answers required",
      });
    }

    // 🔹 Get current reassigned cycle
    const [qaRows] = await db.query(
      `SELECT reassigned 
       FROM quiz_assignments 
       WHERE id = ? AND user_id = ? AND quiz_session_id = ?`,
      [assignment_id, user_id, quiz_session_id]
    );
    if (!qaRows.length) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    const reassignedCycle = qaRows[0].reassigned;

    let score = 0;

    // 🔹 Insert/update each answer
    for (const { question_id: assigned_question_id, answer } of answers) {

      // Ensure this is a valid assigned question for this cycle
    const [aqRows] = await db.query(
  `SELECT id, question_id 
   FROM assigned_questions 
   WHERE id = ? 
     AND assignment_id = ? 
     AND quiz_session_id = ? 
     AND user_id = ? 
     AND reassigned = ?`,
  [assigned_question_id, assignment_id, quiz_session_id, user_id, reassignedCycle]
);


      if (!aqRows.length) continue;
      const real_question_id = aqRows[0].question_id;

      // Get correct answer
      const [qRows] = await db.query(
        "SELECT correct_answer FROM questions WHERE id = ?",
        [real_question_id]
      );
      if (!qRows.length) continue;

      const correct_answer = qRows[0].correct_answer;
      const is_correct =
        answer && answer.trim() === correct_answer.trim() ? 1 : 0;

      // ✅ Insert/update into answers table WITH quiz_session_id + reassigned
      await db.query(
  `INSERT INTO answers 
     (quiz_id, question_id, user_id, assignment_id, answer, is_correct, attempt_number, answered_at) 
   VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
   ON DUPLICATE KEY UPDATE 
     answer = VALUES(answer),
     is_correct = VALUES(is_correct),
     attempt_number = VALUES(attempt_number),
     answered_at = NOW()`,
  [
    quiz_id,
    real_question_id,
    user_id,
    assignment_id,
    answer || "",
    is_correct,
    reassignedCycle,
  ]
);

// ✅ Get the answer_id reliably
const [[existingAnswer]] = await db.query(
  `SELECT id FROM answers 
   WHERE quiz_id = ? AND question_id = ? AND user_id = ? AND assignment_id = ?`,
  [quiz_id, real_question_id, user_id, assignment_id]
);
const answer_id = existingAnswer?.id || null;



     

      // ✅ Update assigned_questions row with same filters
     await db.query(
  `UPDATE assigned_questions 
   SET answer_id = ?, is_correct = ?, correct_answers = ?, score = ? 
   WHERE id = ? 
     AND assignment_id = ? 
     AND user_id = ? 
     AND quiz_session_id = ? 
     AND reassigned = ?`,
  [
    answer_id,
    is_correct,
    correct_answer,
    is_correct,
    assigned_question_id,
    assignment_id,
    user_id,
    quiz_session_id,
    reassignedCycle,
  ]
);



      if (is_correct) score++;
    }

    // 🔹 Total assigned questions (filtered by cycle + session)
    const [assignedCountRows] = await db.query(
      `SELECT COUNT(*) as totalAssigned 
       FROM assigned_questions 
       WHERE assignment_id = ? 
         AND user_id = ? 
         AND quiz_session_id = ? 
         AND reassigned = ?`,
      [assignment_id, user_id, quiz_session_id, reassignedCycle]
    );
    const totalAssigned = assignedCountRows[0]?.totalAssigned || 1;

    // 🔹 Count answered
    const [answeredCountRows] = await db.query(
      `SELECT COUNT(*) as totalAnswered 
       FROM assigned_questions 
       WHERE assignment_id = ? 
         AND user_id = ? 
         AND quiz_session_id = ? 
         AND reassigned = ? 
         AND answer_id IS NOT NULL`,
      [assignment_id, user_id, quiz_session_id, reassignedCycle]
    );
    const totalAnswered = answeredCountRows[0]?.totalAnswered || 0;

    let status = "terminated";
    let percentage = 0;

    if (totalAnswered === totalAssigned) {
      percentage = (score / totalAssigned) * 100;
      status = percentage >= passing_score ? "passed" : "failed";
    }

    // 🔹 Update quiz_assignments
    await db.query(
      `UPDATE quiz_assignments 
       SET user_ended_at = ?, status = ?, score = ? 
       WHERE id = ? AND quiz_session_id = ? AND user_id = ?`,
      [new Date(), status, percentage, assignment_id, quiz_session_id, user_id]
    );

    // 🔹 Fetch wrong/unanswered (filtered by reassigned + session)
    const [wrongAnswers] = await db.query(
      `SELECT 
          aq.id, 
          q.question_text AS question, 
          q.options, 
          q.correct_answer AS correctAnswer, 
          a.answer AS userAnswer
       FROM assigned_questions aq
       JOIN questions q ON aq.question_id = q.id
       LEFT JOIN answers a 
   ON a.quiz_id = aq.quiz_id 
   AND a.assignment_id = aq.assignment_id 
   AND a.question_id = aq.question_id 
   AND a.user_id = aq.user_id 
   AND a.attempt_number = aq.reassigned


       WHERE aq.assignment_id = ? 
         AND aq.user_id = ? 
         AND aq.quiz_session_id = ? 
         AND aq.reassigned = ? 
         AND (aq.is_correct = 0 OR aq.answer_id IS NULL)`,
      [assignment_id, user_id, quiz_session_id, reassignedCycle]
    );

    return res.json({
      success: true,
      message: "Assessment ended",
      score,
      percentage,
      status,
      wrongAnswers,
    });

  } catch (error) {
    console.error("Error in endAssessment:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.assignRandomQuestions = async (req, res) => {
  const { quizSessionId, quizId, userId, assignmentId } = req.body;

  if (!quizSessionId || !quizId || !userId || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "quizSessionId, quizId, userId, and assignmentId are required",
    });
  }

  try {
    // 1. Check if questions already assigned for this user + session + assignment
   // Get reassigned value from quiz_assignments
const [[assignmentRow]] = await db.query(
  `SELECT reassigned FROM quiz_assignments WHERE id = ?`,
  [assignmentId]
);
const reassigned = assignmentRow ? assignmentRow.reassigned : 0;

// 1. Check if questions already assigned for this user + session + assignment + reassigned
const [existingRows] = await db.query(
  `SELECT aq.id, q.id AS question_id, q.question_text, q.question_type, q.options, q.correct_answer, q.explanation, q.difficulty_level,
          aq.answer_id, aq.is_correct, aq.correct_answers, aq.score
   FROM assigned_questions aq
   JOIN questions q ON aq.question_id = q.id
   WHERE aq.quiz_session_id = ? AND aq.quiz_id = ? AND aq.user_id = ? AND aq.assignment_id = ? AND aq.reassigned = ?`,
  [quizSessionId, quizId, userId, assignmentId, reassigned]
);


    if (existingRows.length > 0) {
      return res.json({
        success: true,
        message: "Questions already assigned",
        data: existingRows,
      });
    }

    // 2. Get session info (max_questions overrides quiz)
    const [sessionRows] = await db.query(
      `SELECT max_questions FROM quiz_sessions WHERE id = ?`,
      [quizSessionId]
    );
    if (!sessionRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Quiz session not found" });

    const maxQuestions = sessionRows[0].max_questions || 10;

    // 3. Get all active questions for this quiz
    const [questionRows] = await db.query(
      `SELECT id, question_text, question_type, options, correct_answer, explanation, difficulty_level
       FROM questions 
       WHERE quiz_id = ? AND is_active = 1`,
      [quizId]
    );
    if (!questionRows.length)
      return res
        .status(404)
        .json({ success: false, message: "No active questions found" });

    // 4. Shuffle + pick
    const shuffled = [...questionRows].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxQuestions);

    // 5. Save in assigned_questions
    // 5. Save in assigned_questions with reassigned value
await Promise.all(
  selected.map((q) =>
    db.query(
      `INSERT INTO assigned_questions 
       (quiz_id, quiz_session_id, user_id, assignment_id, reassigned, question_id, answer_id, is_correct, correct_answers, score) 
       VALUES (?, ?, ?, ?, ?, ?, NULL, 0, ?, 0)`,
      [quizId, quizSessionId, userId, assignmentId, reassigned, q.id, q.correct_answer]
    )
  )
);


    return res.json({
      success: true,
      message: "Random questions assigned successfully",
      data: selected,
    });
  } catch (err) {
    console.error("Error assigning random questions:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.fetchAssignedQuestions = async (req, res) => {
  const { quizId } = req.params;
  const { userId, quizSessionId, assignmentId } = req.query;

  if (!quizId || !quizSessionId || !userId || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "quizId, quizSessionId, userId, and assignmentId are required",
    });
  }

  if (!quizId || !quizSessionId || !userId || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "quizId, quizSessionId, userId, and assignmentId are required",
    });
  }

  try {
    // Get reassigned value from quiz_assignments
const [[assignmentRow]] = await db.query(
  `SELECT reassigned FROM quiz_assignments WHERE id = ?`,
  [assignmentId]
);
const reassigned = assignmentRow ? assignmentRow.reassigned : 0;

const [rows] = await db.query(
  `SELECT aq.id, q.id AS question_id, q.question_text, q.question_type, q.options, q.correct_answer, q.explanation, q.difficulty_level,
          aq.answer_id, aq.is_correct, aq.correct_answers, aq.score
   FROM assigned_questions aq
   JOIN questions q ON aq.question_id = q.id
   WHERE aq.quiz_session_id = ? AND aq.quiz_id = ? AND aq.user_id = ? AND aq.assignment_id = ? AND aq.reassigned = ?`,
  [quizSessionId, quizId, userId, assignmentId, reassigned]
);


    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching assigned questions:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
