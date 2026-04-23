const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadResume, createBuiltResume, updateBuiltResume,
  getResumes, getResume, deleteResume,
} = require('../controllers/resume.controller');

const router = express.Router();

router.use(protect);

router.get('/', getResumes);
router.post('/upload', upload.single('resume'), uploadResume);
router.post('/build', createBuiltResume);
router.get('/:id', getResume);
router.put('/:id', updateBuiltResume);
router.delete('/:id', deleteResume);

module.exports = router;
