const express = require('express');
const multer = require('multer');
const router = express.Router();
const logController = require('../controllers/logController');

const upload = multer({ dest: 'uploads/' });

router.get('/', logController.getLogs);
router.get('/stats', logController.getLogStats);
router.post('/upload', upload.single('logFile'), logController.uploadLog);

module.exports = router;
