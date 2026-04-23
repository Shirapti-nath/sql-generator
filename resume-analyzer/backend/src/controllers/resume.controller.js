const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { extractText, cleanText } = require('../services/pdf.service');

const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const rawText = await extractText(req.file.path);
    const extractedText = cleanText(rawText);

    const resume = await Resume.create({
      user: req.user._id,
      title: req.body.title || req.file.originalname.replace(/\.[^.]+$/, ''),
      type: 'uploaded',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf',
      extractedText,
    });

    res.status(201).json({ resume });
  } catch (error) {
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ message: error.message });
  }
};

const createBuiltResume = async (req, res) => {
  const { title, builderData } = req.body;
  try {
    const resume = await Resume.create({
      user: req.user._id,
      title: title || 'My Resume',
      type: 'built',
      builderData,
    });
    res.status(201).json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBuiltResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const { title, builderData } = req.body;
    if (title) resume.title = title;
    if (builderData) resume.builderData = builderData;
    await resume.save();

    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .populate('latestAnalysis', 'atsScore createdAt')
      .sort({ updatedAt: -1 });
    res.json({ resumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
      .populate('latestAnalysis');
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    if (resume.fileUrl) {
      const filePath = path.join(__dirname, '../../', resume.fileUrl);
      try { fs.unlinkSync(filePath); } catch {}
    }

    await resume.deleteOne();
    res.json({ message: 'Resume deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume, createBuiltResume, updateBuiltResume, getResumes, getResume, deleteResume };
