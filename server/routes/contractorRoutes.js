// backend/routes/contractorRoutes.js
const express = require("express");
const {
  createContractor,
  getContractors,
  updateContractor,
  deleteContractor,
} = require("../controllers/contractorController");

const router = express.Router();

// Create contractor
router.post("/", createContractor);

// Get all contractors
router.get("/", getContractors);

// Update contractor
router.put("/:id", updateContractor);

// Delete contractor
router.delete("/:id", deleteContractor);

module.exports = router;
