const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const Folder = require("../models/Folder");
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/pdfs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Add error handling middleware for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ msg: err.message });
  }
  next(err);
});

// Create a separate upload instance for the route
const pdfUpload = upload.single('file');

// Upload PDF route
router.post('/upload-pdf', authMiddleware, pdfUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Generate URL for the uploaded PDF
    const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/pdfs/${req.file.filename}`;
    
    res.json({ url: pdfUrl });
  } catch (err) {
    console.error('Error uploading PDF:', err);
    res.status(500).json({ msg: 'Error uploading PDF file' });
  }
});

// Get all notes & folders for user
router.get("/data", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await Note.find({ user: userId });
    const folders = await Folder.find({ user: userId });
    res.json({ notes, folders });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ msg: "Error fetching data" });
  }
});

// Create a folder
router.post("/folder", authMiddleware, async (req, res) => {
  try {
    const { name, parentId, color } = req.body;
    const userId = req.user.id;

    const folder = new Folder({
      name,
      parentId,
      color,
      user: userId
    });

    await folder.save();
    res.json(folder);
  } catch (err) {
    console.error("Error creating folder:", err);
    res.status(500).json({ msg: "Error creating folder" });
  }
});

// Delete a note
router.delete("/note/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if note exists and belongs to the user
    const note = await Note.findOne({ _id: id, user: userId });
    if (!note) {
      return res.status(404).json({ msg: "Note not found or unauthorized" });
    }

    // Delete the note
    await Note.findByIdAndDelete(id);
    
    res.json({ msg: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ msg: "Error deleting note" });
  }
});

// Create or update a note
router.post("/note", authMiddleware, async (req, res) => {
  try {
    console.log("📥 Received note data:", req.body); // Debug log
    
    const { _id, id, ...noteData } = req.body;
    const user = req.user.id;
    
    // Use _id if available, fallback to id
    const noteId = _id || id;
    
    // Helper function to check if ID is valid ObjectId
    const isValidObjectId = (id) => {
      return id && /^[0-9a-fA-F]{24}$/.test(id);
    };
    
    let note;
    if (noteId && isValidObjectId(noteId)) {
      // Update existing note (valid ObjectId)
      console.log("📝 Updating existing note with ID:", noteId);
      note = await Note.findOneAndUpdate(
        { _id: noteId, user }, 
        { ...noteData, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      );
      
      if (!note) {
        return res.status(404).json({ msg: "Note not found or unauthorized" });
      }
    } else {
      // Create new note (no ID or invalid ObjectId)
      console.log("🆕 Creating new note");
      note = await Note.create({ 
        ...noteData, 
        user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log("✅ Note saved successfully:", note._id); // Debug log
    res.json(note);
  } catch (err) {
    console.error("❌ Error saving note:", err); // Detailed error log
    res.status(500).json({ msg: "Error saving note", error: err.message });
  }
});

// Create or update a folder
router.post("/folder", authMiddleware, async (req, res) => {
  try {
    console.log("📥 Received folder data:", req.body); // Debug log
    
    const { _id, id, ...folderData } = req.body;
    const user = req.user.id;
    
    // Use _id if available, fallback to id
    const folderId = _id || id;
    
    let folder;
    if (folderId) {
      // Update existing folder
      folder = await Folder.findOneAndUpdate(
        { _id: folderId, user }, 
        { ...folderData, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      );
      
      if (!folder) {
        return res.status(404).json({ msg: "Folder not found or unauthorized" });
      }
    } else {
      // Create new folder
      folder = await Folder.create({ 
        ...folderData, 
        user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log("✅ Folder saved successfully:", folder._id); // Debug log
    res.json(folder);
  } catch (err) {
    console.error("❌ Error saving folder:", err); // Detailed error log
    res.status(500).json({ msg: "Error saving folder", error: err.message });
  }
});

module.exports = router;