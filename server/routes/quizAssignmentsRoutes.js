const express = require("express");
const { getAllAssignments, getAssignmentById, startAssessment, endAssessment } = require("../controllers/quizAssignmentsController");
const router = express.Router();

// Routes
router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);
router.post("/start", startAssessment);
router.post("/end", endAssessment);

module.exports = router;
