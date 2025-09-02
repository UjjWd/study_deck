const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response
    const profile = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;
    
    // Validate required fields
    if (!updates.name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile
    const updatedUser = await user.updateProfile(updates);
    
    // Format response
    const profile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      dateOfBirth: updatedUser.dateOfBirth,
      city: updatedUser.city,
      profilePhoto: updatedUser.profilePhoto,
      updatedAt: updatedUser.updatedAt
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete profile photo
router.delete('/profile/photo', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.profilePhoto = null;
    await user.save();
    
    res.json({ message: 'Profile photo removed' });
  } catch (error) {
    console.error('Error removing profile photo:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
