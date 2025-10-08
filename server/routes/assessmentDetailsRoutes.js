const express = require("express");
const { getAllAssessmentDetails, exportAssessmentDetails, getQuizSummary ,exportQuizUserData} = require("../controllers/assessmentDetailsController");
const router = express.Router();

router.get("/", getAllAssessmentDetails);
router.get("/list", getQuizSummary);
router.post("/export", exportAssessmentDetails);
router.post("/export-quiz-users", exportQuizUserData);

module.exports = router;