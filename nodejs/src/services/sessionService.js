const crypto = require('crypto');
const UserSession = require('../models/session');

class SessionService {
  constructor() {
    /** @type {Map<string, UserSession>} */
    this.sessions = new Map();
  }

  /**
   * Generates a secure random URL-safe base64 token.
   * @returns {string}
   */
  generateToken() {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Stores a user session associated with a newly generated token.
   * @param {string} email
   * @param {string} password
   * @returns {string} token
   */
  createSession(email, password) {
    const token = this.generateToken();
    const session = new UserSession(email, password);
    this.sessions.set(token, session);
    return token;
  }

  /**
   * Retrieves a session by token.
   * @param {string} token
   * @returns {UserSession|null}
   */
  getSession(token) {
    if (!token) return null;
    return this.sessions.get(token) || null;
  }

  /**
   * Removes a session by token.
   * @param {string} token
   * @returns {boolean}
   */
  deleteSession(token) {
    if (!token) return false;
    return this.sessions.delete(token);
  }

  /**
   * Clears all sessions (useful for testing or server restart).
   */
  clear() {
    this.sessions.clear();
  }
}

// Singleton instance
const sessionService = new SessionService();

module.exports = sessionService;
