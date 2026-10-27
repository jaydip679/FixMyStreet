const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../shared/middleware/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');
const { authenticate } = require('../../shared/middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
