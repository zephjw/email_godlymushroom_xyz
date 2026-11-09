const express = require('express');
const { healthController } = require('../controllers');

const router = express.Router();

router.get('/', (req, res) => healthController.check(req, res));

module.exports = router;
