const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');

// Load environment variables FIRST, before importing other modules
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Log what's in the environment
console.log('Environment variables loaded:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Found' : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Found' : '❌ Missing');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Missing');
console.log('PORT:', process.env.PORT ? '✅ Found' : '❌ Missing');

// Verify critical environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Error: Email credentials not found in environment variables');
  console.error('Please make sure your .env file contains:');
  console.error('EMAIL_USER=your-email@gmail.com');
  console.error('EMAIL_PASS=your-app-specific-password');
  console.error('');
  console.error('Current .env file path:', path.join(__dirname, '.env'));
  process.exit(1);
}

// Now import routes AFTER environment variables are loaded
const otpRoutes = require('./routes/otpRoutes');

const app = express();

// Updated CORS configuration
app.use(cors({
  origin: "http://localhost:8080", // Your frontend port
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Serve static files from uploads directory (go up one level from server folder)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper headers for PDF files
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Add URL-encoded parsing for all routes
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Add JSON parsing middleware for POST and PUT requests
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    express.json({ limit: '10mb' })(req, res, next);
  } else {
    next();
  }
});

// Middleware to validate file size for profile photo uploads
app.use('/api/profile', (req, res, next) => {
  if (req.method === 'PUT' && req.body && req.body.profilePhoto) {
    try {
      // Validate base64 image size
      const base64Data = req.body.profilePhoto.split(',')[1];
      const byteCount = (base64Data.length * 3) / 4;
      
      if (byteCount > 10 * 1024 * 1024) { // 10MB limit
        return res.status(413).json({
          message: 'Image size exceeds the maximum allowed size (10MB)'
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid image format'
      });
    }
  }
  next();
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const noteRoutes = require("./routes/noteRoutes");
app.use("/api/notes", noteRoutes);
app.use("/api/data", noteRoutes);
app.use("/api/otp", otpRoutes);
const tasksRoutes = require("./routes/tasks");
app.use("/api", tasksRoutes);
const userProfileRoutes = require("./routes/userProfile");
app.use("/api", userProfileRoutes);

// Connect DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));