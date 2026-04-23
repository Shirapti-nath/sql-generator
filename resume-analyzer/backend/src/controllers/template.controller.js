const User = require('../models/User');

const templates = [
  // Student Templates
  {
    id: 'student-minimal',
    name: 'Clean Minimal',
    category: 'student',
    tags: ['fresher', 'internship', 'minimal', 'clean'],
    description: 'A clean, minimal template perfect for freshers and internship applications.',
    atsScore: 95,
    preview: '/templates/student-minimal.png',
    accentColor: '#6366f1',
  },
  {
    id: 'student-modern',
    name: 'Modern Student',
    category: 'student',
    tags: ['fresher', 'modern', 'colorful'],
    description: 'Modern design with subtle color accents, ideal for CS students.',
    atsScore: 90,
    preview: '/templates/student-modern.png',
    accentColor: '#8b5cf6',
  },
  {
    id: 'student-tech',
    name: 'Tech Focused',
    category: 'student',
    tags: ['fresher', 'technical', 'internship'],
    description: 'Highlights technical skills and projects prominently.',
    atsScore: 92,
    preview: '/templates/student-tech.png',
    accentColor: '#06b6d4',
  },
  {
    id: 'student-creative',
    name: 'Creative Graduate',
    category: 'student',
    tags: ['fresher', 'creative', 'portfolio'],
    description: 'Stand out with a creative layout while staying ATS-friendly.',
    atsScore: 85,
    preview: '/templates/student-creative.png',
    accentColor: '#ec4899',
  },
  {
    id: 'student-classic',
    name: 'Academic Classic',
    category: 'student',
    tags: ['fresher', 'academic', 'classic'],
    description: 'Traditional academic format, great for research positions.',
    atsScore: 98,
    preview: '/templates/student-classic.png',
    accentColor: '#1d4ed8',
  },
  // Professional Templates
  {
    id: 'pro-executive',
    name: 'Executive Pro',
    category: 'professional',
    tags: ['senior', 'executive', 'leadership'],
    description: 'Command attention with an executive-level professional layout.',
    atsScore: 96,
    preview: '/templates/pro-executive.png',
    accentColor: '#1e293b',
  },
  {
    id: 'pro-modern',
    name: 'Modern Professional',
    category: 'professional',
    tags: ['experienced', 'modern', 'industry'],
    description: 'Sleek modern design for experienced professionals.',
    atsScore: 93,
    preview: '/templates/pro-modern.png',
    accentColor: '#0ea5e9',
  },
  {
    id: 'pro-tech',
    name: 'Senior Engineer',
    category: 'professional',
    tags: ['senior', 'technical', 'engineering'],
    description: 'Optimized for senior engineering and tech leadership roles.',
    atsScore: 94,
    preview: '/templates/pro-tech.png',
    accentColor: '#10b981',
  },
  {
    id: 'pro-data',
    name: 'Data Scientist',
    category: 'professional',
    tags: ['data-science', 'analytics', 'ml'],
    description: 'Highlights ML projects, publications, and data skills.',
    atsScore: 91,
    preview: '/templates/pro-data.png',
    accentColor: '#f59e0b',
  },
  {
    id: 'pro-minimal',
    name: 'Professional Minimal',
    category: 'professional',
    tags: ['experienced', 'minimal', 'clean'],
    description: 'Ultra-clean design that lets achievements speak for themselves.',
    atsScore: 97,
    preview: '/templates/pro-minimal.png',
    accentColor: '#6b7280',
  },
];

const getTemplates = async (req, res) => {
  const { category } = req.query;
  const filtered = category ? templates.filter(t => t.category === category) : templates;
  res.json({ templates: filtered });
};

const getTemplate = async (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ message: 'Template not found.' });
  res.json({ template });
};

const saveTemplate = async (req, res) => {
  const { templateId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedTemplates.includes(templateId)) {
      user.savedTemplates.push(templateId);
      await user.save();
    }
    res.json({ savedTemplates: user.savedTemplates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTemplates, getTemplate, saveTemplate };
