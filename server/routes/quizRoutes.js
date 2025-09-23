const express = require("express");
const { getAllQuizAttempts, getAllQuizTitles,getAllQuizzes,updateQuiz ,assignQuiz,getQuizAssignments,getQuizQuestions,updateQuizQuestionsBulk,getQuizReportDetails, deleteQuiz, updateQuizStatus, getAllQuizzesWithNoActive} = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);
// Fetch all active quizzes
router.get("/list", getAllQuizzes);
router.get("/list/2", getAllQuizzesWithNoActive);
router.get("/title", getAllQuizTitles);
router.put('/edit/:id', updateQuiz);
router.post("/assign", assignQuiz);
router.delete("/:id", deleteQuiz);
// router.get("/:id", getQuizAssignments);
router.get("/:quiz_id", getQuizAssignments);
router.put("/:id/status", updateQuizStatus);
router.get("/:id/details", getQuizReportDetails);
router.get("/:id/questions", getQuizQuestions);

// router.put("/edit-questions/:quizId", updateQuizQuestionsBulk);
router.put('/edit-question/:id', updateQuizQuestionsBulk);


module.exports = router;