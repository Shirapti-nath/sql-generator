const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const { analyzeResume, improveBullets, generateSummary } = require('../services/ai.service');
const { extractText, cleanText } = require('../services/pdf.service');

const buildTextFromBuilderData = (data) => {
  const { personalInfo, education, experience, projects, skills } = data;
  let text = '';

  if (personalInfo) {
    text += `${personalInfo.fullName}\n${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n`;
    if (personalInfo.summary) text += `\nSUMMARY\n${personalInfo.summary}\n`;
  }

  if (education?.length) {
    text += '\nEDUCATION\n';
    education.forEach(e => {
      text += `${e.degree} in ${e.field} - ${e.institution} (${e.startDate} - ${e.endDate})\n`;
    });
  }

  if (experience?.length) {
    text += '\nEXPERIENCE\n';
    experience.forEach(e => {
      text += `${e.position} at ${e.company} (${e.startDate} - ${e.current ? 'Present' : e.endDate})\n`;
      if (e.bullets?.length) e.bullets.forEach(b => (text += `• ${b}\n`));
      if (e.description) text += `${e.description}\n`;
    });
  }

  if (projects?.length) {
    text += '\nPROJECTS\n';
    projects.forEach(p => {
      text += `${p.name} | ${p.technologies?.join(', ')}\n`;
      if (p.bullets?.length) p.bullets.forEach(b => (text += `• ${b}\n`));
      if (p.description) text += `${p.description}\n`;
    });
  }

  if (skills) {
    text += '\nSKILLS\n';
    const allSkills = [
      ...(skills.languages || []),
      ...(skills.frameworks || []),
      ...(skills.tools || []),
      ...(skills.databases || []),
      ...(skills.cloud || []),
    ];
    text += allSkills.join(', ') + '\n';
  }

  return text;
};

const analyzeResumeHandler = async (req, res) => {
  const { resumeId, domain, jobDescription } = req.body;

  try {
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    let textToAnalyze = resume.extractedText || '';
    if (!textToAnalyze && resume.type === 'built' && resume.builderData) {
      textToAnalyze = buildTextFromBuilderData(resume.builderData);
    }

    if (!textToAnalyze || textToAnalyze.length < 50) {
      return res.status(400).json({ message: 'Resume text is too short to analyze.' });
    }

    const analysisResult = await analyzeResume(
      textToAnalyze,
      domain || req.user.domain || 'software-engineering',
      jobDescription || ''
    );

    const analysis = await Analysis.create({
      resume: resume._id,
      user: req.user._id,
      atsScore: analysisResult.atsScore,
      scoreBreakdown: analysisResult.scoreBreakdown,
      strengths: analysisResult.strengths || [],
      weaknesses: analysisResult.weaknesses || [],
      missingKeywords: analysisResult.missingKeywords || [],
      suggestions: analysisResult.suggestions || [],
      improvedBullets: analysisResult.improvedBullets || [],
      domainAnalysis: analysisResult.domainAnalysis,
      aiGeneratedSummary: analysisResult.aiGeneratedSummary,
      jobDescriptionMatch: analysisResult.jobDescriptionMatch,
      rawResponse: analysisResult.rawResponse,
    });

    resume.latestAnalysis = analysis._id;
    await resume.save();

    res.status(201).json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAnalysisHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .populate('resume', 'title type')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id })
      .populate('resume', 'title type fileName');
    if (!analysis) return res.status(404).json({ message: 'Analysis not found.' });
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const improveBulletsHandler = async (req, res) => {
  const { bullets, context } = req.body;
  if (!bullets?.length) {
    return res.status(400).json({ message: 'Bullets array is required.' });
  }
  try {
    const improved = await improveBullets(bullets, context || 'Software Engineering');
    res.json({ improved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeResumeHandler, getAnalysisHistory, getAnalysis, improveBulletsHandler };
