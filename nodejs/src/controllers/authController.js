const config = require('../config');
const { isValidMailbox } = require('../utils/validator');
const { serializeCookie, parseCookie } = require('../utils/cookie');
const { sessionService, emailService } = require('../services');

class AuthController {
  /**
   * Authenticates user against IMAP server and establishes session.
   */
  async login(req, res, next) {
    const { email, password } = req.body || {};

    if (!isValidMailbox(email) || typeof password !== 'string' || !password) {
      return res.status(400).json({
        message: `Use a valid mailbox ending in @${config.mailDomain}`,
      });
    }

    const normalizedEmail = email.toLowerCase();
    const imap = emailService.createImap({ email: normalizedEmail, password });

    try {
      await emailService.openBox(imap, 'INBOX');
      const token = sessionService.createSession(normalizedEmail, password);
      res.setHeader(
        'Set-Cookie',
        serializeCookie(config.session.cookieName, token, config.session.maxAgeSeconds)
      );
      return res.json({
        success: true,
        userEmail: normalizedEmail,
      });
    } catch (err) {
      return res.status(401).json({
        message: 'Unable to sign in with those mailbox credentials',
      });
    } finally {
      emailService.close(imap);
    }
  }

  /**
   * Terminates active user session and clears session cookie.
   */
  async logout(req, res, next) {
    const token = parseCookie(req.headers.cookie, config.session.cookieName);
    if (token) {
      sessionService.deleteSession(token);
    }

    res.setHeader(
      'Set-Cookie',
      serializeCookie(config.session.cookieName, '', 0)
    );
    return res.json({ success: true });
  }
}

const authController = new AuthController();

module.exports = authController;
