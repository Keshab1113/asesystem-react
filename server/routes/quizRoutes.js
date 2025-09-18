const express = require("express");
const { getAllQuizAttempts, getAllQuizTitles,getAllQuizzes,updateQuiz ,assignQuiz,getQuizAssignments,getQuizQuestions} = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);
// Fetch all active quizzes
router.get("/list", getAllQuizzes);
router.get("/title", getAllQuizTitles);
router.put('/edit/:id', updateQuiz);
router.post("/assign", assignQuiz);
router.get("/:id", getQuizAssignments);
router.get("/:id/questions", getQuizQuestions);

module.exports = router;