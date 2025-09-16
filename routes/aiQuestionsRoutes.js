const express = require('express');
const router = express.Router();
const { generateQuestionsFromDescription ,saveQuestions} = require('../controllers/aiQuestionsController');
// const { authenticate } = require('../middleware/auth');

// POST route to generate questions
router.post('/generate-from-description',  generateQuestionsFromDescription);
// Route to save questions permanently
router.post('/save-questions', saveQuestions);

module.exports = router;
