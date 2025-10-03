const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import database configuration
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const contractorRoutes = require('./routes/contractorRoutes');
const companyRoutes = require('./routes/companyRoutes');
const aiQuestionsRoutes = require('./routes/aiQuestionsRoutes');
const fileRoutes = require('./routes/fileRoutes');
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const quizAssignmentsRoutes = require("./routes/quizAssignmentsRoutes");
const resultRoutes = require("./routes/resultRoutes");
const userDownloadRoutes = require("./routes/userDownloadRoutes");
const quizSessionsRoutes = require("./routes/quizSessionsRoutes");
const assessmentDetailsRoutes = require("./routes/assessmentDetailsRoutes");
 
// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    res.json({ message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', userDownloadRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/companies", companyRoutes);
app.use('/api/ai-questions', aiQuestionsRoutes);
app.use('/api/files',  fileRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/quiz-attempts", quizRoutes);
app.use("/api/quiz-assignments", quizAssignmentsRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/assessment", assessmentDetailsRoutes);
app.use("/api/quiz-sessions", quizSessionsRoutes);


// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// 404 handler for API routes - FIXED: Use parameter instead of *
app.use('/api/:any', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Quiz App API Server', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      testDb: '/api/test-db',
      auth: '/api/auth',
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});