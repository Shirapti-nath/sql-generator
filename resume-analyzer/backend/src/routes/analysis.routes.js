const express = require('express');
const { protect } = require('../middleware/auth');
const {
  analyzeResumeHandler, getAnalysisHistory, getAnalysis, improveBulletsHandler,
} = require('../controllers/analysis.controller');

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeResumeHandler);
router.get('/history', getAnalysisHistory);
router.get('/:id', getAnalysis);
router.post('/improve-bullets', improveBulletsHandler);

module.exports = router;
