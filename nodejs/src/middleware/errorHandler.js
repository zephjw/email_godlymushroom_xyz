const logger = require('../utils/logger');

/**
 * 404 Not Found handler for unmatched routes.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Resource not found' });
}

/**
 * Global Express error handling middleware.
 */
function errorHandler(err, req, res, next) {
  logger.error('Unhandled server error', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.expose || statusCode < 500
    ? err.message
    : 'Unexpected server error';

  res.status(statusCode).json({ message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
