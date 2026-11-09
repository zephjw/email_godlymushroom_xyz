const express = require('express');
const { emailController } = require('../controllers');
const { requireSession } = require('../middleware');

const router = express.Router();

router.get('/emails', requireSession, (req, res, next) =>
  emailController.getEmails(req, res, next)
);

router.get('/emails/:uid', requireSession, (req, res, next) =>
  emailController.getEmailByUid(req, res, next)
);

router.post('/send-email', requireSession, (req, res, next) =>
  emailController.sendEmail(req, res, next)
);

module.exports = router;
