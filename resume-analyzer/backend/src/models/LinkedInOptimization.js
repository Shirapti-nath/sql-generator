const mongoose = require('mongoose');

const linkedInOptimizationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  input: {
    currentHeadline: String,
    about: String,
    experienceSummaries: [String],
    skills: [String],
    targetRole: String,
    linkedinUrl: String,
  },
  profileScore: { type: Number, min: 0, max: 100 },
  scoreBreakdown: {
    headline: { score: Number, max: Number, explanation: String },
    about: { score: Number, max: Number, explanation: String },
    experience: { score: Number, max: Number, explanation: String },
    skills: { score: Number, max: Number, explanation: String },
    keywords: { score: Number, max: Number, explanation: String },
  },
  headlineSuggestions: [String],
  rewrittenAbout: String,
  missingKeywords: [String],
  skillsToAdd: [String],
  experienceImprovements: [{
    original: String,
    improved: String,
    reason: String,
  }],
  actionableTips: [String],
  seoKeywords: [String],
}, { timestamps: true });

module.exports = mongoose.model('LinkedInOptimization', linkedInOptimizationSchema);
