const express = require('express');
const router = express.Router();
const { login, register, changePassword } = require('../controllers/auth-controller');
const authMiddleWare = require('../middleware/auth-middleware');
router.post('/login', login);
router.post('/register', register);
module.exports = router;