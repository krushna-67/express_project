# Express Project with ReplyCraft

A production-ready Express.js REST API demonstrating how to use the [`replycraft`](https://www.npmjs.com/package/replycraft) npm package for:
- Standardized API success and error responses (`res.success`, `res.fail`)
- Centralized error handling and production error masking (`errorHandler`, `AppError`)
- Asynchronous route error forwarding (`asyncHandler`)
- In-memory pagination calculation (`paginate`)
- Request ID correlation (`requestId`)

## Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/krushna-67/express_project.git
cd express_project
npm install
```

## Running the Application

### Start server
```bash
npm start
```

Server runs by default at `http://localhost:4000`.

### Development mode (auto-reload)
```bash
npm run dev
```

### Run Automated Tests
```bash
npm test
```

## API Endpoints

### 1. Health Check
```bash
curl -i http://localhost:4000/health
```
Response:
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-11-18T18:00:00.000Z"
  }
}
```

### 2. Paginated Users
```bash
curl -i "http://localhost:4000/api/users?page=1&limit=2"
```
Response:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    { "id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": "admin" },
    { "id": 2, "name": "Bob Jones", "email": "bob@example.com", "role": "member" }
  ],
  "meta": {
    "page": 1,
    "limit": 2,
    "total": 6,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 3. Get User by ID
```bash
curl -i http://localhost:4000/api/users/1
```

### 4. Create User
```bash
curl -i -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Grace Hopper", "email": "grace@example.com", "role": "admin"}'
```

### 5. Validation Failure Demo
```bash
curl -i -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'
```
Response:
```json
{
  "success": false,
  "message": "Validation error: name is required",
  "data": null,
  "error": {
    "details": {
      "field": "name",
      "issue": "Must be a non-empty string"
    }
  }
}
```

### 6. Operational Error Handling (AppError)
```bash
curl -i http://localhost:4000/api/errors/operational
```
Response (HTTP 504):
```json
{
  "success": false,
  "message": "Payment gateway timeout",
  "data": null,
  "error": {
    "details": {
      "gateway": "stripe",
      "retryAfterSeconds": 60
    }
  }
}
```

## License

MIT
