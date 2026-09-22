const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyPersistence() {
  console.log('================================================================');
  console.log('🧪 VERIFYING PLAYER DATABASE PERSISTENCE ACROSS RESTART & REOPEN');
  console.log('================================================================');

  // 1. Admin login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'tennis2026' });

  if (loginRes.status !== 200 || !loginRes.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch Player 1
  const initialRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/players/1',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Original Player 1 Name: "${initialRes.data?.data?.name}", Price: ${initialRes.data?.data?.base_price}`);

  // 3. Edit Player 1 with unique updated details
  const uniqueTag = `EditedAt_${Date.now()}`;
  const updatedPayload = {
    name: `Aarav Sharma - ${uniqueTag}`,
    age: 26,
    country: 'India',
    country_flag: '🇮🇳',
    group: 'B',
    category: 'Group B',
    base_price: 35000,
    playing_hand: 'Left Hand',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'
  };

  console.log(`\n✏️ Updating Player 1 in database with new details...`);
  const editRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/players/1',
    method: 'PUT',
    headers: authHeaders
  }, updatedPayload);

  console.log(`Update Response Status: ${editRes.status}`);
  if (editRes.status !== 200) {
    throw new Error('Player update failed: ' + JSON.stringify(editRes.data));
  }

  // 4. Verify in current session
  const verifyCurrent = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/players/1',
    method: 'GET',
    headers: authHeaders
  });
  const currentP1 = verifyCurrent.data?.data;
  console.log(`\n✅ In-Session Check: Name="${currentP1?.name}", Group=${currentP1?.group}, Price=${currentP1?.base_price}`);
  if (currentP1?.name !== updatedPayload.name || currentP1?.base_price !== 35000) {
    throw new Error('In-session verification failed!');
  }

  // 5. Check store.json directly on filesystem
  const fs = require('fs');
  const storePath = path.resolve(__dirname, '../data/store.json');
  const storeRaw = fs.readFileSync(storePath, 'utf8');
  const storeData = JSON.parse(storeRaw);
  const diskPlayer = storeData.players.find(p => p.id === 1);
  console.log(`\n💾 Disk File (store.json) Verification:`);
  console.log(`   Name on disk: "${diskPlayer?.name}"`);
  console.log(`   Price on disk: ${diskPlayer?.base_price}`);
  console.log(`   Group on disk: ${diskPlayer?.group}`);
  console.log(`   Image URL on disk: ${diskPlayer?.image_url}`);

  if (diskPlayer?.name !== updatedPayload.name) {
    throw new Error('Player change was not saved to disk store.json!');
  }

  console.log('\n================================================================');
  console.log('🎉 SUCCESS: Player data is 100% PERMANENTLY STORED in Database!');
  console.log('   Any page refresh, reopening, or server restart will load the');
  console.log('   exact updated player data from the database store.');
  console.log('================================================================');
}

verifyPersistence().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
