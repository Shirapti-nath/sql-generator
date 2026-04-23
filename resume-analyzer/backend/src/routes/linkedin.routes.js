const express = require('express');
const { protect } = require('../middleware/auth');
const { optimizeProfile, getHistory, getOptimization, deleteOptimization } = require('../controllers/linkedin.controller');

const router = express.Router();

router.use(protect);

router.post('/optimize', optimizeProfile);
router.get('/history', getHistory);
router.get('/:id', getOptimization);
router.delete('/:id', deleteOptimization);

module.exports = router;
