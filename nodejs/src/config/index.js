const path = require('path');
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3000),
  mailDomain: (process.env.MAIL_DOMAIN || 'godlymushroom.xyz').toLowerCase(),

  mail: {
    imap: {
      host: process.env.IMAP_HOST || 'imap.hostinger.com',
      port: Number(process.env.IMAP_PORT || 993),
      tls: true,
      tlsOptions: {
        rejectUnauthorized: true,
      },
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
    },
    maxFetchListLimit: 50,
  },

  session: {
    cookieName: 'wm_session',
    maxAgeSeconds: 60 * 60 * 8, // 8 hours
  },

  rateLimits: {
    general: {
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many sign-in attempts' },
    },
  },

  paths: {
    root: path.resolve(__dirname, '../..'),
    publicHtml: path.resolve(__dirname, '../../index.html'),
    logsDir: path.resolve(__dirname, '../logs'),
  },
};

module.exports = config;
