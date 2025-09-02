// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  mobile: { 
    type: String,
    trim: true,
    maxlength: 20,
    match: /^\+?[0-9]{10,15}$/
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Ensure date is not in the future
        return v <= new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  city: {
    type: String,
    trim: true,
    maxlength: 50
  },
  profilePhoto: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Allow either URL or base64 image
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(v) || 
               /^data:image\/\w+;base64,/.test(v);
      },
      message: 'Profile photo must be a valid image URL or base64 image'
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 });

// Static method to get user profile
userSchema.statics.getProfile = async function(userId) {
  return this.findById(userId, { password: 0 });
};

// Method to update profile
userSchema.methods.updateProfile = async function(profileData) {
  const updates = Object.keys(profileData);
  updates.forEach(update => {
    if (update !== 'password') {
      this[update] = profileData[update];
    }
  });
  await this.save();
  return this;
};

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("User", userSchema);
