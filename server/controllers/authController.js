const bcrypt = require("bcryptjs");
const db = require("../config/database");
const uploadToFTP = require("../config/uploadToFTP.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/mailer.js");
const pool = require("../config/database");

const OTP_TTL_MINUTES = 10;
const otpExpiryStore = new Map();

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER_NOREPLY,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

// Change password controller
const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;

    // Validation
    if (!email || !newPassword || !confirmPassword) {
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
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

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
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?",
      [hashedPassword, email]
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
      employee_id,
      group,
      controlling_team,
      location,
      team_id,
      group_id,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    await db.execute(
      `UPDATE users 
       SET name = ?, team_id = ?, group_id = ?, email = ?, role = ?, phone = ?, position = ?, bio = ?, is_active = ?, \`group\` = ?,employee_id = ? ,controlling_team = ?,location= ?, profile_pic_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        team_id,
        group_id,
        email,
        role,
        phone,
        position,
        bio,
        is_active,
        group,
        employee_id,
        controlling_team,
        location,
        profile_pic_url,
        id,
      ]
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
      "SELECT id, name,location,employee_id,team_id, group_id, controlling_team, `group`, email, role, phone, position, bio, is_active, profile_pic_url, created_at, updated_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get normal users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPasswordLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const [rows] = await db.execute(
      "SELECT id, name FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }
    const user = rows[0];

    // generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // store OTP in DB
    await db.execute("UPDATE users SET otp = ? WHERE id = ?", [otp, user.id]);

    // store expiry in memory
    otpExpiryStore.set(user.id, Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"asesystem - No Reply" <${process.env.MAIL_USER_NOREPLY_VIEW}>`,
      to: email,
      replyTo: process.env.MAIL_USER_NOREPLY_VIEW,
      subject:
        "Advance Safety and Efficiency System - Your One-Time Password (OTP)",
      text: `Hello ${user.name || ""},

Your One-Time Password (OTP) is: ${otp}

⚠️ This code is valid for ${OTP_TTL_MINUTES} minutes only. 
Do not share this code with anyone.

Best regards,
asesystem Team`,
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">asesystem</h2>
      <p style="font-size: 16px; color: #333;">Hello <b>${
        user.name || ""
      }</b>,</p>
      <p style="font-size: 16px; color: #333;">Please use the following One-Time Password (OTP) to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2563eb; background: #e0f2fe; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 15px; color: #555;">⚠️ This code is valid for <b>${OTP_TTL_MINUTES} minutes</b> only. Please do not share it with anyone.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #777;">Best regards,</p>
      <p style="font-size: 14px; font-weight: bold; color: #333;">asesystem Team</p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">
      © ${new Date().getFullYear()} asesystem. All rights reserved.
    </p>
  </div>
  `,
    });

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPasswordLogin = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and newPassword are required",
      });
    }

    const [rows] = await db.execute(
      "SELECT id, otp FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }
    const user = rows[0];
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    const expiry = otpExpiryStore.get(user.id);
    if (!expiry || Date.now() > expiry) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // update DB
    await db.execute(
      "UPDATE users SET password_hash = ?, otp = NULL, updated_at = NOW() WHERE id = ?",
      [passwordHash, user.id]
    );

    // clear expiry
    otpExpiryStore.delete(user.id);

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// Register
const register = async (req, res) => {
  try {
    const {
      fullName,
      position,
      employee_id,
      email,
      controlling_team,
      group,
      password,
      location,
      phone,
      team_id,
      group_id,
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
        (name, position, employee_id, email,phone, controlling_team, location, \`group\`, otp, role, is_active, password_hash, group_id, team_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', FALSE, ?, ?, ?)`,
      [
        fullName,
        position,
        employee_id,
        email,
        phone,
        controlling_team,
        location,
        group,
        otp,
        passwordHash,
        group_id,
        team_id,
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

    await pool.execute("UPDATE users SET otp = ? WHERE email = ?", [
      otp,
      email,
    ]);

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
      "SELECT id, group_id, team_id, name, email, password_hash, role, is_active, otp, profile_pic_url, bio, position, last_login, created_at,location, phone, `group`, controlling_team, employee_id FROM users WHERE email = ?",
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

// Delete user by ID (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body; // user ID from request body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const [users] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};


module.exports = {
  changePassword,
  updateUser,
  uploadProfilePicture,
  getNormalUsers,
  forgotPasswordLogin,
  resetPasswordLogin,
  register,
  verifyOtp,
  resendOtp,
  login,
  deleteUser,
};
