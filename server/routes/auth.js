const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const router = express.Router();
const pool = require("../config/database");
const { changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");


router.post('/change-password', authenticate, changePassword);
// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      position,
      employeeId,
      email,
      controllingTeam,
      group,
      password,
    } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // 1. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert into users table
    await pool.execute(
      `INSERT INTO users 
        (name, position, employee_id, email, controlling_team, \`group\`, otp, role, is_active, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', FALSE, ?)`,
      [
        fullName,
        position,
        employeeId,
        email,
        controllingTeam,
        group,
        otp,
        passwordHash,
      ]
    );

    // 4. Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
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

    await transporter.sendMail({
      from: `"ASESystem - No Reply" <${process.env.MAIL_USER_NOREPLY_VIEW}>`,
      to: email,
      replyTo: process.env.MAIL_USER_NOREPLY_VIEW,
      subject: "ASESystem - Your One-Time Password (OTP)",
      text: `Hello ${fullName},

Welcome to ASESystem!

Your One-Time Password (OTP) is: ${otp}

⚠️ This code is valid for 10 minutes only. 
Do not share this code with anyone.

Best regards,  
ASESystem Team`,
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">ASESystem</h2>
      <p style="font-size: 16px; color: #333;">Hello <b>${fullName}</b>,</p>
      <p style="font-size: 16px; color: #333;">Welcome to <b>ASESystem</b>! Please use the following One-Time Password (OTP) to complete your verification:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2563eb; background: #e0f2fe; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 15px; color: #555;">⚠️ This code is valid for <b>10 minutes</b> only. Please do not share it with anyone.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #777;">Best regards,</p>
      <p style="font-size: 14px; font-weight: bold; color: #333;">ASESystem Team</p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">
      © ${new Date().getFullYear()} ASESystem. All rights reserved.
    </p>
  </div>
  `,
    });

    res.json({
      success: true,
      message: "User registered. OTP sent.",
    });
  } catch (error) {
    console.error("Register error:", error);

    // Handle duplicate email error
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
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
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
});

// Resend OTP endpoint
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 1. Check if user exists
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

    // 2. Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Update OTP in database
    await pool.execute("UPDATE users SET otp = ? WHERE email = ?", [
      otp,
      email,
    ]);

    // 4. Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
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

    // 5. Send OTP email
    await transporter.sendMail({
      from: `"ASESystem - No Reply" <${process.env.MAIL_USER_NOREPLY_VIEW}>`,
      to: email,
      replyTo: process.env.MAIL_USER_NOREPLY_VIEW,
      subject: "ASESystem - Your New OTP Code",
      text: `Hello ${user.name},

We have generated a new One-Time Password (OTP) for you.

Your new OTP code is: ${otp}

⚠️ This code is valid for 10 minutes only.
Do not share this code with anyone.

Best regards,
ASESystem Team`,
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">ASESystem</h2>
      <p style="font-size: 16px; color: #333;">Hello <b>${user.name}</b>,</p>
      <p style="font-size: 16px; color: #333;">We have generated a new One-Time Password (OTP) for your account verification:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2563eb; background: #e0f2fe; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 15px; color: #555;">⚠️ This code is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #777;">Best regards,</p>
      <p style="font-size: 14px; font-weight: bold; color: #333;">ASESystem Team</p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">
      © ${new Date().getFullYear()} ASESystem. All rights reserved.
    </p>
  </div>
  `,
    });

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
});

// Login endpoint (from previous conversion)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await pool.execute(
      "SELECT id, name, email, password_hash, role, is_active, otp, profile_pic_url, bio, position, last_login, created_at, phone FROM users WHERE email = ?",
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

    // Generate JWT token valid for 1 day
    const jwt = require("jsonwebtoken");
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
});

module.exports = router;
