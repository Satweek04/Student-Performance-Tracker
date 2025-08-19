const router = require('express').Router();
const messageController = require('../controllers/message.controller');
const auth = require('../middleware/auth'); // <-- Changed this line

router.post('/send', auth(['teacher', 'student']), messageController.sendMessage);
router.get('/', auth(['teacher', 'student']), messageController.getMessages);
router.post('/groups', auth(['teacher']), messageController.createGroup); // Only teachers can create groups
router.get('/conversations', auth(['teacher', 'student']), messageController.getUserConversations);

module.exports = router;
