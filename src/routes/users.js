'use strict';

const express = require('express');
const { asyncHandler, paginate, AppError } = require('replycraft');
const userService = require('../services/userService');

const router = express.Router();

/**
 * GET /api/users
 * Returns paginated user records with ReplyCraft's paginate() and res.success()
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const allUsers = userService.getAll();
    const paginated = paginate(allUsers, page, limit);

    return res.success(paginated.data, 'Users retrieved successfully', 200, paginated.pagination);
  })
);

/**
 * GET /api/users/:id
 * Returns a specific user or fails via AppError / res.fail
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.fail('User ID must be a valid number', 400, { param: 'id', value: req.params.id });
    }

    const user = userService.getById(id);
    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404, { requestedId: id });
    }

    return res.success(user, 'User found');
  })
);

/**
 * POST /api/users
 * Validates payload and creates a new user, returning 201 Created
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, role } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.fail('Validation error: name is required', 400, {
        field: 'name',
        issue: 'Must be a non-empty string'
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.fail('Validation error: valid email is required', 400, {
        field: 'email',
        issue: 'Email address must contain @'
      });
    }

    const user = userService.create({ name: name.trim(), email: email.trim(), role });
    return res.success(user, 'User created successfully', 201);
  })
);

/**
 * DELETE /api/users/:id
 * Deletes user by ID
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.fail('User ID must be a valid number', 400);
    }

    const deleted = userService.delete(id);
    if (!deleted) {
      throw new AppError(`Cannot delete: user ${id} does not exist`, 404);
    }

    return res.success({ deleted: true, id }, 'User deleted successfully');
  })
);

module.exports = router;
