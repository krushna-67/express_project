'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { PassThrough } = require('node:stream');
const app = require('../src/app');

function simulate(expressApp, { method = 'GET', url = '/', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const socket = new PassThrough();
      const req = new http.IncomingMessage(socket);
      req.method = method.toUpperCase();
      req.url = url;

      const normalizedHeaders = Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
      );

      let payloadBuffer = null;
      if (body !== null && body !== undefined) {
        const payloadString = typeof body === 'string' ? body : JSON.stringify(body);
        payloadBuffer = Buffer.from(payloadString);
        if (!normalizedHeaders['content-type']) {
          normalizedHeaders['content-type'] = 'application/json';
        }
        normalizedHeaders['content-length'] = payloadBuffer.length.toString();
      }

      req.headers = normalizedHeaders;
      const res = new http.ServerResponse(req);
      const chunks = [];

      res.write = function (chunk, encoding, cb) {
        if (chunk) chunks.push(Buffer.from(chunk));
        if (typeof cb === 'function') cb();
        return true;
      };

      res.end = function (chunk, encoding, cb) {
        if (chunk) chunks.push(Buffer.from(chunk));
        if (typeof cb === 'function') cb();

        const rawBody = Buffer.concat(chunks).toString('utf8');
        let parsedBody = null;
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = rawBody;
        }

        resolve({
          status: res.statusCode,
          headers: res.getHeaders(),
          body: parsedBody
        });
      };

      expressApp.handle(req, res);

      if (payloadBuffer !== null) {
        req.push(payloadBuffer);
      }
      req.push(null);
    } catch (err) {
      reject(err);
    }
  });
}

describe('Express Project with ReplyCraft - API Tests', () => {
  test('GET /health returns standardized success with request ID', async () => {
    const res = await simulate(app, { method: 'GET', url: '/health' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
    assert.ok(res.headers['x-request-id']);
  });

  test('GET /api/users returns paginated results', async () => {
    const res = await simulate(app, { method: 'GET', url: '/api/users?page=1&limit=2' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 2);
    assert.deepEqual(res.body.meta, {
      page: 1,
      limit: 2,
      total: 6,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    });
  });

  test('GET /api/users/:id returns user when found', async () => {
    const res = await simulate(app, { method: 'GET', url: '/api/users/1' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, 1);
  });

  test('GET /api/users/:id returns 404 AppError when not found', async () => {
    const res = await simulate(app, { method: 'GET', url: '/api/users/999' });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.data, null);
    assert.deepEqual(res.body.error.details, { requestedId: 999 });
  });

  test('POST /api/users validates payload and returns 201 Created', async () => {
    const res = await simulate(app, {
      method: 'POST',
      url: '/api/users',
      body: { name: 'Grace Hopper', email: 'grace@example.com', role: 'admin' }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Grace Hopper');
  });

  test('POST /api/users rejects invalid input with 400 res.fail', async () => {
    const res = await simulate(app, {
      method: 'POST',
      url: '/api/users',
      body: { name: '' }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.details.field, 'name');
  });

  test('GET /api/errors/operational handles custom AppError with 504', async () => {
    const res = await simulate(app, { method: 'GET', url: '/api/errors/operational' });
    assert.equal(res.status, 504);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Payment gateway timeout');
    assert.deepEqual(res.body.error.details, { gateway: 'stripe', retryAfterSeconds: 60 });
  });

  test('GET /unknown-route triggers 404 handler', async () => {
    const res = await simulate(app, { method: 'GET', url: '/non-existent' });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
