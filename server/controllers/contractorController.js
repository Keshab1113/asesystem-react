// backend/controllers/contractorController.js
const pool = require("../config/database");

// Create Contractor
exports.createContractor = async (req, res) => {
  try {
    const {
      contractor_name,
      email,
      phone,
      company_name,
      address,
      license_number,
      specialization,
      company_id,
      created_by,
    } = req.body;

    if (!contractor_name || !company_id || !created_by) {
      return res.status(400).json({
        success: false,
        message: "Name, company_id, and created_by are required",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO contractors 
       (name, email, phone, company_name, address, license_number, specialization, company_id, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contractor_name, email, phone, company_name, address, license_number, specialization, company_id, created_by]
    );

    return res.status(201).json({
      success: true,
      message: "Contractor created successfully",
      contractorId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating contractor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Contractors
exports.getContractors = async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM contractors ORDER BY created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
