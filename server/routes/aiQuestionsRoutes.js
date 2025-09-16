const express = require('express');
const router = express.Router();
const { generateQuestionsFromDescription ,saveQuestions} = require('../controllers/aiQuestionsController');
const { authenticate } = require('../middleware/authMiddleware');

// POST route to generate questions
router.post('/generate-from-description', authenticate,  generateQuestionsFromDescription);
// Route to save questions permanently
router.post('/save-questions', authenticate, saveQuestions);


module.exports = router;
