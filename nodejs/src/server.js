const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const server = app.listen(config.port, () => {
  console.log(`Webmail server listening on ${config.port}`);
  logger.info(`Webmail server listening on ${config.port}`, {
    port: config.port,
    env: config.env,
    domain: config.mailDomain,
  });
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 5 seconds if connections linger
  setTimeout(() => {
    logger.warn('Forcing server shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
