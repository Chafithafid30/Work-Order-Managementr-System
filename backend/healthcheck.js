'use strict';

const http = require('node:http');

// Use Node's standard library so the production image does not depend on curl
// or wget. Docker treats exit code 0 as healthy and any other code as unhealthy.
const request = http.get(
  {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 3000),
    path: '/api/health',
    timeout: 3000,
  },
  (response) => {
    response.resume();
    process.exit(response.statusCode === 200 ? 0 : 1);
  },
);

request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});

request.on('error', () => process.exit(1));
