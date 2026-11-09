const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure log directory exists
if (!fs.existsSync(config.paths.logsDir)) {
  fs.mkdirSync(config.paths.logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(config.paths.logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(config.paths.logsDir, 'error.log'),
  { flags: 'a' }
);

function formatLogEntry(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}\n`;
}

const logger = {
  info(message, meta) {
    const entry = formatLogEntry('info', message, meta);
    accessLogStream.write(entry);
    if (!config.isProduction) {
      console.log(`[INFO] ${message}`, meta || '');
    }
  },

  warn(message, meta) {
    const entry = formatLogEntry('warn', message, meta);
    accessLogStream.write(entry);
    console.warn(`[WARN] ${message}`, meta || '');
  },

  error(message, error) {
    const meta = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    const entry = formatLogEntry('error', message, meta);
    errorLogStream.write(entry);
    console.error(`[ERROR] ${message}`, error || '');
  },

  requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  },
};

module.exports = logger;
