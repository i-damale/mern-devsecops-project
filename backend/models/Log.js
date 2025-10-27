const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  ip: String,
  user: String,
  timestamp: Date,
  method: String,
  url: String,
  status: Number,
  size: Number,
  message: String,
  source: String,
  level: String, // Add level field for filtering
});

// Add indexes for better query performance
logSchema.index({ timestamp: -1 }); // For sorting by timestamp
logSchema.index({ level: 1 }); // For filtering by level
logSchema.index({ message: 'text' }); // For text search

module.exports = mongoose.model('Log', logSchema);
