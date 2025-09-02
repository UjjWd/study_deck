// models/Folder.js
const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  parentId: String,
  color: String,
}, { timestamps: true });

module.exports = mongoose.model("Folder", folderSchema);
