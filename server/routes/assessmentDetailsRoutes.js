const express = require("express");
const { getAllAssessmentDetails, exportAssessmentDetails, getQuizSummary } = require("../controllers/assessmentDetailsController");
const router = express.Router();

router.get("/", getAllAssessmentDetails);
router.get("/list", getQuizSummary);
router.post("/export", exportAssessmentDetails);

module.exports = router;