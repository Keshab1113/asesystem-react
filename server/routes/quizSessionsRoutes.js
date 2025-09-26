const express = require("express");
const router = express.Router();
const { getQuizSessions,updateQuizSession ,assignSession, createSession} = require("../controllers/quizSessionsController");
const { authenticate } = require('../middleware/authMiddleware');

// Get all sessions (optional quizId filter)
router.get("/",   getQuizSessions);
router.put("/:sessionId",   updateQuizSession); 
router.post("/assign-session", assignSession);
router.post("/create-session",   createSession);

module.exports = router;
