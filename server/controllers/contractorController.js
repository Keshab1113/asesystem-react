// backend/controllers/contractorController.js
const pool = require("../config/database");

// Create Contractor
exports.createContractor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company_name,
      address,
      license_number,
      specialization,
      company_id,
      created_by,
    } = req.body;

    if (!name || !company_id || !created_by) {
      return res.status(400).json({
        success: false,
        message: "Name, company_id, and created_by are required",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO contractors 
       (name, email, phone, company_name, address, license_number, specialization, company_id, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        company_name,
        address,
        license_number,
        specialization,
        company_id,
        created_by,
      ]
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
    const [rows] = await pool.execute(
      `SELECT * FROM contractors ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Contractor
exports.updateContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      company_name,
      address,
      license_number,
      specialization,
      isActive,
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE contractors 
       SET name = ?, email = ?, phone = ?, company_name = ?, address = ?, 
           license_number = ?, specialization = ?, is_active = ?
       WHERE id = ?`,
      [
        name,
        email,
        phone,
        company_name,
        address,
        license_number,
        specialization,
        isActive ?? 1, // default active if not passed
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor not found" });
    }

    res.json({ success: true, message: "Contractor updated successfully" });
  } catch (error) {
    console.error("Error updating contractor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Contractor
exports.deleteContractor = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      `DELETE FROM contractors WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor not found" });
    }

    res.json({ success: true, message: "Contractor deleted successfully" });
  } catch (error) {
    console.error("Error deleting contractor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
