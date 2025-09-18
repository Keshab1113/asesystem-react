const express = require("express");
const { getAllAssignments, getAssignmentById } = require("../controllers/quizAssignmentsController");
const router = express.Router();

// Routes
router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);

module.exports = router;
