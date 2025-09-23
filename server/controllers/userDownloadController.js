const ExcelJS = require("exceljs");
const pool = require("../config/database");

const downloadUsersExcel = async (req, res) => {
  try {
    const { group_id, team_id } = req.query;

    if (!group_id || !team_id) {
      return res.status(400).json({
        success: false,
        error: "Group ID and Team ID are required",
      });
    }

    const query = `
      SELECT 
        name,
        phone,
        employee_id,
        controlling_team,
        position,
        email,
        \`group\`,
        location,
        created_at
      FROM users
      WHERE group_id = ? AND team_id = ? AND role = "user"
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute(query, [group_id, team_id]);
    const users = Array.isArray(rows) ? rows : [];

    if (!users.length) {
      return res
        .status(404)
        .json({ success: false, error: "No users found for the selected criteria" });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Columns
    worksheet.columns = [
      { header: "Sr. No.", key: "sr_no", width: 8 },
      { header: "Name", key: "name", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Controlling Team", key: "controlling_team", width: 25 },
      { header: "Position", key: "position", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Group", key: "group", width: 20 },
      { header: "Work Location", key: "location", width: 20 },
    ];

    // Header style
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2E86AB" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Add rows
    users.forEach((user, index) => {
      worksheet.addRow({
        sr_no: index + 1,
        name: user.name || "N/A",
        phone: user.phone || "N/A",
        employee_id: user.employee_id || "N/A",
        controlling_team: user.controlling_team || "N/A",
        position: user.position || "N/A",
        email: user.email || "N/A",
        group: user.group || "N/A",
        location: user.location || "N/A",
      });
    });

    // Style rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: "middle", horizontal: "left" };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F8F9FA" },
          };
        }
      }
      row.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Send Excel file
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `users-report-${timestamp}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate Excel file: " + error.message,
    });
  }
};
const downloadAllUsersExcel = async (req, res) => {
  try {
    // Fetch all users
    const query = `
      SELECT 
        name,
        phone,
        employee_id,
        controlling_team,
        position,
        email,
        \`group\`,
        location,
        created_at
      FROM users WHERE role = "user"
      ORDER BY controlling_team DESC
    `;
    
    const [rows] = await pool.execute(query);
    const users = Array.isArray(rows) ? rows : [];

    if (!users.length) {
      return res.status(404).json({
        success: false,
        error: "No users found in the database",
      });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("All Users");

    // Columns
    worksheet.columns = [
      { header: "Sr. No.", key: "sr_no", width: 8 },
      { header: "Name", key: "name", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Controlling Team", key: "controlling_team", width: 25 },
      { header: "Work Location", key: "location", width: 20 },
      { header: "Position", key: "position", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Group", key: "group", width: 20 },
    ];

    // Header style
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2E86AB" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Add rows
    users.forEach((user, index) => {
      worksheet.addRow({
        sr_no: index + 1,
        name: user.name || "N/A",
        phone: user.phone || "N/A",
        employee_id: user.employee_id || "N/A",
        controlling_team: user.controlling_team || "N/A",
        position: user.position || "N/A",
        email: user.email || "N/A",
        group: user.group || "N/A",
        location: user.location || "N/A",
      });
    });

    // Style rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: "middle", horizontal: "left" };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F8F9FA" },
          };
        }
      }
      row.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Send Excel file
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `all-users-report-${timestamp}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate Excel file: " + error.message,
    });
  }
};

module.exports = { downloadUsersExcel, downloadAllUsersExcel };
