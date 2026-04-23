const express = require('express');
const { protect } = require('../middleware/auth');
const { getTemplates, getTemplate, saveTemplate } = require('../controllers/template.controller');

const router = express.Router();

router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/save', protect, saveTemplate);

module.exports = router;
