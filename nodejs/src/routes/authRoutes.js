const express = require('express');
const { authController } = require('../controllers');
const { authLimiter } = require('../middleware');

const router = express.Router();

router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

module.exports = router;
