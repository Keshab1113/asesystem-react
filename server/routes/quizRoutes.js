const express = require("express");
const { getAllQuizAttempts, getAllQuizTitles } = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);
router.get("/title", getAllQuizTitles);

module.exports = router;