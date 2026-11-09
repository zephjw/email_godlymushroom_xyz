const config = require('../config');

/**
 * Validates whether an email has valid syntax and belongs to the allowed domain.
 *
 * @param {string} email
 * @param {string} [allowedDomain]
 * @returns {boolean}
 */
function isValidMailbox(email, allowedDomain = config.mailDomain) {
  return (
    typeof email === 'string' &&
    /^\S+@\S+$/.test(email) &&
    email.toLowerCase().endsWith('@' + allowedDomain.toLowerCase())
  );
}

/**
 * Validates recipient email syntax.
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidRecipient(email) {
  return typeof email === 'string' && /^\S+@\S+$/.test(email);
}

/**
 * Validates send email payload.
 *
 * @param {object} payload
 * @returns {{ valid: boolean, message?: string }}
 */
function validateSendPayload(payload) {
  const { to, subject, text } = payload || {};

  if (!isValidRecipient(to)) {
    return { valid: false, message: 'Enter a valid recipient' };
  }

  if (
    typeof subject !== 'string' ||
    !subject.trim() ||
    subject.length > 200 ||
    typeof text !== 'string' ||
    !text.trim() ||
    text.length > 100000
  ) {
    return { valid: false, message: 'Subject and message are required' };
  }

  return { valid: true };
}

module.exports = {
  isValidMailbox,
  isValidRecipient,
  validateSendPayload,
};
