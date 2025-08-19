const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/teacher', require('./teacher.routes'));
router.use('/student', require('./student.routes'));
router.use('/messages', require('./message.routes')); // Add this line

module.exports = router;
