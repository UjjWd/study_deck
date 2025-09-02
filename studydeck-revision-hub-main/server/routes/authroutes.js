// routes/authRoutes.js
const express = require("express");
const { signup, login, requestPasswordReset, verifyOTPAndResetPassword, checkEmail } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", verifyOTPAndResetPassword);
router.post("/check-email", checkEmail);

module.exports = router;
