const express = require("express");
const { getAllQuizAttempts } = require("../controllers/quizController");
const router = express.Router();

router.get("/", getAllQuizAttempts);

module.exports = router;