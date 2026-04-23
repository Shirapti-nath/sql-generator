const LinkedInOptimization = require('../models/LinkedInOptimization');
const { optimizeLinkedIn } = require('../services/linkedin.service');

const optimizeProfile = async (req, res) => {
  const { currentHeadline, about, experienceSummaries, skills, targetRole, linkedinUrl } = req.body;

  if (!currentHeadline && !about) {
    return res.status(400).json({ message: 'Please provide at least your current headline or About section.' });
  }

  try {
    const result = await optimizeLinkedIn({ currentHeadline, about, experienceSummaries, skills, targetRole, linkedinUrl });

    const optimization = await LinkedInOptimization.create({
      user: req.user._id,
      input: { currentHeadline, about, experienceSummaries, skills, targetRole, linkedinUrl },
      profileScore: result.profileScore,
      scoreBreakdown: result.scoreBreakdown,
      headlineSuggestions: result.headlineSuggestions || [],
      rewrittenAbout: result.rewrittenAbout,
      missingKeywords: result.missingKeywords || [],
      skillsToAdd: result.skillsToAdd || [],
      experienceImprovements: result.experienceImprovements || [],
      actionableTips: result.actionableTips || [],
      seoKeywords: result.seoKeywords || [],
    });

    res.status(201).json({ optimization });
  } catch (error) {
    console.error('LinkedIn optimization error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const optimizations = await LinkedInOptimization.find({ user: req.user._id })
      .select('profileScore input.targetRole input.currentHeadline createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ optimizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOptimization = async (req, res) => {
  try {
    const optimization = await LinkedInOptimization.findOne({ _id: req.params.id, user: req.user._id });
    if (!optimization) return res.status(404).json({ message: 'Optimization not found.' });
    res.json({ optimization });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOptimization = async (req, res) => {
  try {
    const opt = await LinkedInOptimization.findOne({ _id: req.params.id, user: req.user._id });
    if (!opt) return res.status(404).json({ message: 'Not found.' });
    await opt.deleteOne();
    res.json({ message: 'Deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { optimizeProfile, getHistory, getOptimization, deleteOptimization };
