const express = require('express');
const router = express.Router();
const { getAreas } = require('../controllers/areasController');

router.get('/', getAreas);

module.exports = router;
