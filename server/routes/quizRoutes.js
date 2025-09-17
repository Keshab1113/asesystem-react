const express = require("express");
const { getAllQuizAttempts, getAllQuizTitles,getAllQuizzes,updateQuiz } = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);
// Fetch all active quizzes
router.get("/list", getAllQuizzes);
router.get("/title", getAllQuizTitles);
router.put('/edit/:id', updateQuiz);

module.exports = router;