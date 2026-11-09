const sanitizeHtml = require('sanitize-html');

/**
 * Sanitizes HTML content for safe rendering.
 *
 * @param {string} html
 * @returns {string}
 */
function sanitizeEmailHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html);
}

module.exports = {
  sanitizeEmailHtml,
};
