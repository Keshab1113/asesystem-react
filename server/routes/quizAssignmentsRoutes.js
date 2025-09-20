const express = require("express");
const { getAllAssignments, getAssignmentById, startAssessment, endAssessment ,assignRandomQuestions,fetchAssignedQuestions} = require("../controllers/quizAssignmentsController");
const router = express.Router();

// Routes
router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);
router.post("/start", startAssessment);
router.post("/end", endAssessment);

// ✅ new route
router.post("/assign-random", assignRandomQuestions);
// New route for fetching assigned questions
router.get("/:quizId/fetch-assigned-questions", fetchAssignedQuestions);

module.exports = router;
