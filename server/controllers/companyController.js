// backend/controllers/companyController.js
const pool = require("../config/database");

// Create Company
exports.createCompany = async (req, res) => {
  try {
    const { company_name, email, phone, address, is_active } = req.body;

    if (!company_name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO companies 
       (name, email, phone, address, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [company_name, email, phone, address, is_active ?? true]
    );

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      companyId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Companies
exports.getCompanies = async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM companies ORDER BY created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
