const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  atsScore: { type: Number, min: 0, max: 100 },
  scoreBreakdown: {
    keywords: { score: Number, max: Number, explanation: String },
    formatting: { score: Number, max: Number, explanation: String },
    completeness: { score: Number, max: Number, explanation: String },
    experienceClarity: { score: Number, max: Number, explanation: String },
    skillsRelevance: { score: Number, max: Number, explanation: String },
  },
  strengths: [String],
  weaknesses: [String],
  missingKeywords: [String],
  suggestions: [{
    category: { type: String, enum: ['skills', 'experience', 'projects', 'formatting', 'keywords', 'summary'] },
    original: String,
    improved: String,
    explanation: String,
  }],
  improvedBullets: [{
    section: String,
    original: String,
    improved: String,
  }],
  domainAnalysis: {
    domain: String,
    relevantSkillsFound: [String],
    missingCriticalSkills: [String],
    domainScore: Number,
  },
  aiGeneratedSummary: String,
  jobDescriptionMatch: {
    jobDescription: String,
    matchScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
  },
  rawResponse: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
