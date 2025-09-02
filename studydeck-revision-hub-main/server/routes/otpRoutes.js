const express = require('express');
const router = express.Router();
const OTP = require('../models/otp');
const { sendVerificationEmail } = require('../utils/email');
const crypto = require('crypto');

// Generate and send OTP
router.post('/generate', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Create OTP record with 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Delete any existing OTP for this email
    await OTP.deleteOne({ email });

    // Create new OTP record
    const newOTP = new OTP({
      email,
      code: otp,
      expiresAt
    });
    
    await newOTP.save();
    console.log('💾 OTP saved to database for:', email);
    
    // Send email with OTP
    await sendVerificationEmail(email, otp);
    
    res.status(200).json({ 
      message: 'OTP sent successfully',
      email: email // Return email for confirmation
    });
    
  } catch (error) {
    console.error('❌ Error generating OTP:', error);
    
    // Check if it's an email-related error
    if (error.message.includes('Missing credentials') || 
        error.message.includes('EAUTH') ||
        error.message.includes('Invalid login')) {
      return res.status(500).json({ 
        error: 'Email service configuration error. Please contact support.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate OTP. Please try again.' 
    });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }
    
    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.status(404).json({ error: 'No OTP found for this email. Please request a new one.' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP code
    if (otpRecord.code === code.toString()) {
      // Delete OTP record after successful verification
      await OTP.deleteOne({ _id: otpRecord._id });
      console.log('✅ OTP verified successfully for:', email);
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP code' });
    }
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

// Test endpoint for email configuration
router.get('/test-email', async (req, res) => {
  try {
    const { testEmailConnection } = require('../utils/email');
    await testEmailConnection();
    res.status(200).json({ message: 'Email configuration is working correctly' });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({ 
      error: 'Email configuration test failed',
      details: error.message 
    });
  }
});

module.exports = router;