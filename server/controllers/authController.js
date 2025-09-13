const bcrypt = require("bcryptjs");
const db = require("../config/database");
const uploadToFTP = require("../config/uploadToFTP.js");

// Change password controller
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    // Password requirements validation
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet requirements",
        errors: passwordErrors,
      });
    }

    // Find user with password hash
    const [users] = await db.execute(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as current password",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in MySQL
    await db.execute(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId]
    );

    // Send success response
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Password validation helper function
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/\d/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("One special character");

  return errors;
};

const updateUser = async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      role,
      phone,
      position,
      bio,
      is_active,
      profile_pic_url,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    await db.execute(
      `UPDATE users 
       SET name = ?, email = ?, role = ?, phone = ?, position = ?, bio = ?, is_active = ?, profile_pic_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, email, role, phone, position, bio, is_active, profile_pic_url, id]
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.userId;
    const buffer = req.file.buffer;
    const originalName = req.file.originalname;
    const ftpUrl = await uploadToFTP(buffer, originalName, "profile_pictures");
    const [user] = await db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await db.query("UPDATE users SET profile_pic_url = ? WHERE id = ?", [
      ftpUrl,
      userId,
    ]);

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePic: ftpUrl,
    });
  } catch (err) {
    console.error("❌ [Profile Upload] Error:", err);
    res
      .status(500)
      .json({ message: "Server error while uploading profile picture" });
  }
};

module.exports = {
  changePassword,
  updateUser,
  uploadProfilePicture,
};
