/**
 * Represents an authenticated mailbox session.
 */
class UserSession {
  /**
   * @param {string} email
   * @param {string} password
   */
  constructor(email, password) {
    this.email = email.toLowerCase().trim();
    this.password = password;
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      email: this.email,
      createdAt: this.createdAt,
    };
  }
}

module.exports = UserSession;
