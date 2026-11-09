const rateLimit = require('express-rate-limit');
const config = require('../config');

const generalLimiter = rateLimit(config.rateLimits.general);
const authLimiter = rateLimit(config.rateLimits.auth);

module.exports = {
  generalLimiter,
  authLimiter,
};
