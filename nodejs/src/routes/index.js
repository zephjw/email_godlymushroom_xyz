const express = require('express');
const authRoutes = require('./authRoutes');
const emailRoutes = require('./emailRoutes');
const healthRoutes = require('./healthRoutes');

const apiRouter = express.Router();

// Mount authentication routes under /api
apiRouter.use('/', authRoutes);

// Mount email routes under /api
apiRouter.use('/', emailRoutes);

module.exports = {
  apiRouter,
  healthRoutes,
};
