// controllers/authController.js
const User = require("../models/user")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user: { id: newUser._id, email }, token });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user: { id: user._id, email }, token });
  } catch (err) {
    res.status(500).json({ msg: "Login failed" });
  }
};

// Generate and send OTP for password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email not found. Please sign up first." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user document with expiry
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // Send OTP via email
    const transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - StudyDeck",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Best regards,<br>StudyDeck Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ msg: "OTP sent successfully to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send OTP. Please try again." });
  }
};

// Verify OTP and reset password
const verifyOTPAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Verify OTP
    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ msg: "OTP has expired" });

    // Validate new password
    if (newPassword.length < 8) return res.status(400).json({ msg: "Password must be at least 8 characters" });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ msg: "Password must contain at least one uppercase letter" });
    if (!/[a-z]/.test(newPassword)) return res.status(400).json({ msg: "Password must contain at least one lowercase letter" });
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return res.status(400).json({ msg: "Password must contain at least one special character" });
    if (!/\d/.test(newPassword)) return res.status(400).json({ msg: "Password must contain at least one number" });

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to reset password" });
  }
};

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email not found. Please sign up first." });
    }

    res.status(200).json({ msg: "Email exists" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to check email" });
  }
};

module.exports = { signup, login, requestPasswordReset, verifyOTPAndResetPassword, checkEmail };
