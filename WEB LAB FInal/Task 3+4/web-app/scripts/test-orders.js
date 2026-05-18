const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const loginBody = JSON.stringify({ email: 'admin@tissot.com', password: 'password123' });
    const loginRes = await request({
      hostname: 'localhost', port: 4000, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
    }, loginBody);

    console.log('LOGIN STATUS', loginRes.statusCode);
    console.log('LOGIN BODY', loginRes.body);

    const parsed = JSON.parse(loginRes.body || '{}');
    const token = parsed.token;
    if (!token) {
      console.error('No token returned; aborting');
      process.exit(1);
    }

    const ordersRes = await request({
      hostname: 'localhost', port: 4000, path: '/api/v1/orders', method: 'GET',
      headers: { 'x-auth-token': token }
    });

    console.log('ORDERS STATUS', ordersRes.statusCode);
    console.log('ORDERS BODY', ordersRes.body);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
