const bcrypt = require("bcryptjs");
const db = require("../config/database");
const uploadToFTP = require("../config/uploadToFTP.js");
 
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/mailer.js");

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

const getNormalUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, controlling_team, `group`, email, role, phone, position, bio, is_active, profile_pic_url, created_at, updated_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get normal users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Register
const register = async (req, res) => {
  try {
    const {
      fullName,
      position,
      employeeId,
      email,
      controllingTeam,
      group,
      password,
      userLocationType,
    } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.execute(
      `INSERT INTO users 
        (name, position, employee_id, email, controlling_team, userLocationType, \`group\`, otp, role, is_active, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', FALSE, ?)`,
      [
        fullName,
        position,
        employeeId,
        email,
        controllingTeam,
        userLocationType,
        group,
        otp,
        passwordHash,
      ]
    );

    await sendOtpEmail(email, fullName, otp, "register");

    res.json({
      success: true,
      message: "User registered. OTP sent.",
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [users] = await pool.execute(
      "SELECT id, otp FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.otp === otp) {
      await pool.execute(
        "UPDATE users SET is_active = TRUE, otp = NULL, updated_at = NOW() WHERE id = ?",
        [user.id]
      );

      return res.json({
        success: true,
        message: "OTP verified successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];
    const otp = crypto.randomInt(100000, 999999).toString();

    await pool.execute("UPDATE users SET otp = ? WHERE email = ?", [otp, email]);

    await sendOtpEmail(email, user.name, otp, "resend");

    res.json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await pool.execute(
      "SELECT id, name, email, password_hash, role, is_active, otp, profile_pic_url, bio, position, last_login, created_at, phone, `group`, controlling_team, employee_id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account not active. Please verify OTP first.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    const { password_hash, otp, ...userSafe } = user;

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      user: userSafe,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  changePassword,
  updateUser,
  uploadProfilePicture,
  getNormalUsers,
  register,
  verifyOtp,
  resendOtp,
  login,
};
