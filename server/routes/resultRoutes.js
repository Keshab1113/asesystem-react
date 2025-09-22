// routes/resultRoutes.js
const express = require("express");
const router = express.Router();
const { getQuizResult } = require("../controllers/resultController");

router.get("/:assignmentId", getQuizResult);

module.exports = router;
