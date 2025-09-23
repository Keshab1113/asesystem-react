const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const router = express.Router();
const pool = require("../config/database");
const {
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
  getUsersByGroupAndTeam,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer();


router.post('/change-password', changePassword);
router.put('/update',authenticate, updateUser);
router.post(
  "/upload-profile-picture",
  authenticate,
  upload.single("profilePic"),
  uploadProfilePicture
);
router.get("/role/user", getNormalUsers);
router.get("/users/:group_id/:team_id", getUsersByGroupAndTeam);
router.post("/forgot-password", forgotPasswordLogin);
router.post("/reset-password", resetPasswordLogin);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/delete", authenticate, deleteUser);


module.exports = router;
