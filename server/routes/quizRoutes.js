const express = require("express");
const { getAllQuizAttempts, getAllQuizTitles,getAllQuizzes,updateQuiz, getQuizQuestions } = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);
// Fetch all active quizzes
router.get("/list", getAllQuizzes);
router.get("/title", getAllQuizTitles);
router.put('/edit/:id', updateQuiz);
router.get("/:quizId/questions", getQuizQuestions);

module.exports = router;