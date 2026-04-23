const express = require('express');
const { protect } = require('../middleware/auth');
const { generate, getHistory, getLetter, deleteLetter } = require('../controllers/coverletter.controller');

const router = express.Router();

router.use(protect);

router.post('/generate', generate);
router.get('/history', getHistory);
router.get('/:id', getLetter);
router.delete('/:id', deleteLetter);

module.exports = router;
