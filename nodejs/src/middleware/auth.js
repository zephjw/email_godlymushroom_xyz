const config = require('../config');
const { parseCookie } = require('../utils/cookie');
const { sessionService } = require('../services');

/**
 * Middleware that extracts session from request cookies and populates req.mailSession.
 */
function extractSession(req, res, next) {
  const token = parseCookie(req.headers.cookie, config.session.cookieName);
  req.mailSession = token ? sessionService.getSession(token) : null;
  req.sessionToken = token;
  next();
}

/**
 * Middleware that requires a valid active mailbox session.
 */
function requireSession(req, res, next) {
  const token = parseCookie(req.headers.cookie, config.session.cookieName);
  const session = token ? sessionService.getSession(token) : null;

  if (!session) {
    return res.status(401).json({ message: 'Your session has expired' });
  }

  req.mailSession = session;
  req.sessionToken = token;
  next();
}

module.exports = {
  extractSession,
  requireSession,
};
