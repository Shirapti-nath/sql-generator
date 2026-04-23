const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Resume' },
  type: { type: String, enum: ['uploaded', 'built'], default: 'uploaded' },
  fileUrl: { type: String },
  fileName: { type: String },
  fileType: { type: String, enum: ['pdf', 'docx'] },
  extractedText: { type: String },
  builderData: {
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String,
      summary: String,
    },
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: String,
      endDate: String,
      gpa: String,
      achievements: [String],
    }],
    experience: [{
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      location: String,
      description: String,
      bullets: [String],
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String,
      github: String,
      bullets: [String],
    }],
    skills: {
      languages: [String],
      frameworks: [String],
      tools: [String],
      databases: [String],
      cloud: [String],
      other: [String],
    },
    certifications: [{
      name: String,
      issuer: String,
      date: String,
      url: String,
    }],
    templateId: { type: String, default: 'modern-classic' },
  },
  latestAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
