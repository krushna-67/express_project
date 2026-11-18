'use strict';

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Express Project running with ReplyCraft on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/users?page=1&limit=2');
  console.log('  GET  /api/users/:id');
  console.log('  POST /api/users');
  console.log('  GET  /api/errors/operational');
  console.log('  GET  /api/errors/unhandled');
});
