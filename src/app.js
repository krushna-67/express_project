'use strict';

const express = require('express');
const { responseHandler, errorHandler, requestId } = require('replycraft');
const usersRouter = require('./routes/users');
const errorDemoRouter = require('./routes/errorDemo');

const app = express();

// 1. Parse JSON bodies
app.use(express.json());

// 2. Request correlation middleware (assigns req.id and sets X-Request-ID response header)
app.use(requestId());

// 3. Response standardization middleware (attaches res.success and res.fail)
app.use(responseHandler());

// Health check endpoint
app.get('/health', (req, res) => {
  return res.success({ status: 'ok', timestamp: new Date().toISOString() }, 'Service is healthy');
});

// Mount domain routes
app.use('/api/users', usersRouter);
app.use('/api/errors', errorDemoRouter);

// 404 handler for unknown routes
app.use((req, res) => {
  return res.fail(`Cannot ${req.method} ${req.originalUrl}`, 404);
});

// 4. Centralized error handling middleware
app.use(
  errorHandler({
    isProduction: process.env.NODE_ENV === 'production',
    defaultServerError: 'Internal Server Error'
  })
);

module.exports = app;
