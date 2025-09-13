// backend/routes/contractorRoutes.js
const express = require("express");
const { createContractor, getContractors } = require("../controllers/contractorController");
const router = express.Router();

router.post("/", createContractor);
router.get("/", getContractors);

module.exports = router;
