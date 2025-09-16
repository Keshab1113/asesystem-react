const express = require("express");
const { getAllQuizAttempts, getAllQuizTitles,getAllQuizzes } = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);
// Fetch all active quizzes
router.get("/list", getAllQuizzes);
router.get("/title", getAllQuizTitles);

module.exports = router;