const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', auth(), controller.getProfile);

router.post('/send-otp', controller.sendOtp);
router.post('/login-otp', controller.loginWithOtp); // ✅ Add this for OTP login


module.exports = router;
