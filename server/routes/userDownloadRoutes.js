const express = require('express');
const { downloadUsersExcel, downloadAllUsersExcel } = require('../controllers/userDownloadController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/download-users',authenticate, downloadUsersExcel);
router.get('/download-allusers',authenticate, downloadAllUsersExcel);

module.exports = router;