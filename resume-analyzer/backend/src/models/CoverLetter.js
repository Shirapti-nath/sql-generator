const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  jobDescription: String,
  tone: {
    type: String,
    enum: ['professional', 'enthusiastic', 'concise', 'creative'],
    default: 'professional',
  },
  resumeSnapshot: String,
  generatedLetter: { type: String, required: true },
  keyStrengths: [String],
  matchedSkills: [String],
  wordCount: Number,
  title: String,
}, { timestamps: true });

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
