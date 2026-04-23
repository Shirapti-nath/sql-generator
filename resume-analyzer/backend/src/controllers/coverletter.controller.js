const CoverLetter = require('../models/CoverLetter');
const Resume = require('../models/Resume');
const { generateCoverLetter } = require('../services/coverletter.service');

const buildResumeText = (resume) => {
  if (resume.extractedText) return resume.extractedText.slice(0, 3000);
  if (resume.builderData) {
    const d = resume.builderData;
    let text = '';
    if (d.personalInfo) text += `${d.personalInfo.fullName}\n${d.personalInfo.summary || ''}\n`;
    if (d.experience?.length) {
      text += 'Experience:\n';
      d.experience.forEach(e => {
        text += `${e.position} at ${e.company}\n`;
        (e.bullets || []).forEach(b => (text += `• ${b}\n`));
      });
    }
    if (d.skills) {
      const all = Object.values(d.skills).flat().filter(Boolean);
      text += `Skills: ${all.join(', ')}\n`;
    }
    return text.slice(0, 3000);
  }
  return '';
};

const generate = async (req, res) => {
  const { jobTitle, company, jobDescription, resumeId, resumeText, tone, additionalContext } = req.body;

  if (!jobTitle || !company) {
    return res.status(400).json({ message: 'Job title and company are required.' });
  }

  try {
    let resolvedResumeText = resumeText || '';
    let resumeRef = null;

    if (resumeId && !resumeText) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume) {
        resolvedResumeText = buildResumeText(resume);
        resumeRef = resume._id;
      }
    }

    const result = await generateCoverLetter({
      jobTitle,
      company,
      jobDescription,
      resumeText: resolvedResumeText,
      tone: tone || 'professional',
      additionalContext,
    });

    const coverLetter = await CoverLetter.create({
      user: req.user._id,
      resume: resumeRef,
      jobTitle,
      company,
      jobDescription,
      tone: tone || 'professional',
      resumeSnapshot: resolvedResumeText.slice(0, 500),
      generatedLetter: result.generatedLetter,
      keyStrengths: result.keyStrengths || [],
      matchedSkills: result.matchedSkills || [],
      wordCount: result.wordCount || result.generatedLetter?.split(/\s+/).length || 0,
      title: `${jobTitle} at ${company}`,
    });

    res.status(201).json({ coverLetter });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const letters = await CoverLetter.find({ user: req.user._id })
      .select('jobTitle company tone wordCount createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ letters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLetter = async (req, res) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, user: req.user._id });
    if (!letter) return res.status(404).json({ message: 'Cover letter not found.' });
    res.json({ letter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLetter = async (req, res) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, user: req.user._id });
    if (!letter) return res.status(404).json({ message: 'Not found.' });
    await letter.deleteOne();
    res.json({ message: 'Deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generate, getHistory, getLetter, deleteLetter };
