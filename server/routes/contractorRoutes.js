const express = require("express");
const {
  createContractor,
  getContractors,
  updateContractor,
  deleteContractor,
  updateContractorStatus,
} = require("../controllers/contractorController");

const router = express.Router();


router.post("/", createContractor);
router.get("/", getContractors);
router.put("/:id", updateContractor);
router.delete("/:id", deleteContractor);
router.patch("/:id/status", updateContractorStatus);

module.exports = router;
