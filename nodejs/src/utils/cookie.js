const config = require('../config');

/**
 * Creates a Set-Cookie header string for session cookies.
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAge - Expiration in seconds
 * @returns {string} Serialized cookie string
 */
function serializeCookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Strict${
    config.isProduction ? '; Secure' : ''
  }`;
}

/**
 * Extracts a named cookie value from a request Cookie header.
 *
 * @param {string|undefined} cookieHeader - raw Cookie header
 * @param {string} name - cookie name
 * @returns {string|null} Decoded cookie value or null
 */
function parseCookie(cookieHeader, name) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;
  const regex = new RegExp(`(?:^|; )${name}=([^;]+)`);
  const match = cookieHeader.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
}

module.exports = {
  serializeCookie,
  parseCookie,
};
