const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function cleanReset() {
  const loginRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'tennis2026' });

  const token = loginRes.data?.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/players/1',
    method: 'PUT',
    headers: authHeaders
  }, {
    name: 'Arjun Mehta',
    age: 24,
    country: 'India',
    country_flag: '🇮🇳',
    group: 'A',
    category: 'Group A',
    base_price: 10000,
    playing_hand: 'Right Hand',
    image_url: '/images/players/arjun-mehta.jpg'
  });

  console.log('Clean reset complete & saved.');
}

cleanReset().catch(console.error);
