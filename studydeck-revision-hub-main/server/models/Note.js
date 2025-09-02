// models/Note.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  content: String,
  tags: [String],
  subject: String,
  isMarkedForRevision: Boolean,
  folderId: String,
  type: { type: String, enum: ["note", "pdf"], default: "note" },
  pdfUrl: String, // optional for PDFs
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
