const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ sub: '123', email: 'test@test.com', role: 'SUPERADMIN' }, process.env.JWT_SECRET || 'secret');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/tenants',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': 'some-tenant-id'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.on('error', console.error);
req.end();
