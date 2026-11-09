const express = require('express');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');
const { generalLimiter, errorHandler } = require('./middleware');
const { apiRouter, healthRoutes } = require('./routes');

const app = express();

// Trust reverse proxy (cPanel / Passenger / Nginx)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Request body parsing
app.use(express.json({ limit: '1mb' }));

// Global rate limiting
app.use(generalLimiter);

// Access logging
app.use(logger.requestLogger);

// Static assets (excluding default index serving to control route explicitly)
app.use(express.static(config.paths.root, { index: false }));

// Serve main webmail interface
app.get('/', (req, res) => {
  res.sendFile(config.paths.publicHtml);
});

// Health check endpoint
app.use('/health', healthRoutes);

// Mount API routes
app.use('/api', apiRouter);

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
