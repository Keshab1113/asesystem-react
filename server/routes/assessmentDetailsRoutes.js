const express = require("express");
const { getAllAssessmentDetails } = require("../controllers/assessmentDetailsController");
const router = express.Router();

router.get("/", getAllAssessmentDetails);

module.exports = router;