'use strict';

const express = require('express');
const { asyncHandler, AppError } = require('replycraft');

const router = express.Router();

/**
 * GET /api/errors/operational
 * Throws an operational AppError with custom HTTP status code and details
 */
router.get(
  '/operational',
  asyncHandler(async (req, res) => {
    throw new AppError('Payment gateway timeout', 504, {
      gateway: 'stripe',
      retryAfterSeconds: 60
    });
  })
);

/**
 * GET /api/errors/unhandled
 * Simulates an unexpected internal runtime error (e.g., database crash)
 */
router.get(
  '/unhandled',
  asyncHandler(async (req, res) => {
    // Throws a generic Error that ReplyCraft's errorHandler will mask in production
    throw new Error('Database connection pool exhausted: conn_string=postgres://usr:sec@db');
  })
);

module.exports = router;
