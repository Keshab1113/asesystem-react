const nodemailer = require("nodemailer");

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

async function sendOtpEmail(email, name, otp, type) {
  let subject = "Advance Safety and Efficiency System - Your One-Time Password (OTP)";
  let text = `Hello ${name},

Welcome to asesystem!

Your One-Time Password (OTP) is: ${otp}

⚠️ This code is valid for 10 minutes only. 
Do not share this code with anyone.

Best regards,  
asesystem Team`;

  if (type === "resend") {
    subject = "Advance Safety and Efficiency System - Your New OTP Code";
    text = `Hello ${name},

We have generated a new One-Time Password (OTP) for you.

Your new OTP code is: ${otp}

⚠️ This code is valid for 10 minutes only.
Do not share this code with anyone.

Best regards,
asesystem Team`;
  }

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">asesystem</h2>
      <p style="font-size: 16px; color: #333;">Hello <b>${name}</b>,</p>
      <p style="font-size: 16px; color: #333;">${type === "register" ? "Welcome to <b>asesystem</b>! Please use the following One-Time Password (OTP) to complete your verification:" : "We have generated a new One-Time Password (OTP) for your account verification:"}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2563eb; background: #e0f2fe; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 15px; color: #555;">⚠️ This code is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #777;">Best regards,</p>
      <p style="font-size: 14px; font-weight: bold; color: #333;">asesystem Team</p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">
      © ${new Date().getFullYear()} asesystem. All rights reserved.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"asesystem - No Reply" <${process.env.MAIL_USER_NOREPLY_VIEW}>`,
    to: email,
    replyTo: process.env.MAIL_USER_NOREPLY_VIEW,
    subject,
    text,
    html: htmlContent,
  });
}

module.exports = { sendOtpEmail };
