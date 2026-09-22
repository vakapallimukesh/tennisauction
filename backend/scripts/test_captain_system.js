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

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE CAPTAIN & SQUAD LIMITS TEST ---');

  // 1. Admin login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'tennis2026' });

  console.log('Login Status:', loginRes.status);
  const token = loginRes.data?.token;
  if (!token) throw new Error('Failed to get admin token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test Get Teams and verify Captains
  const teamsRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/teams',
    method: 'GET',
    headers: authHeaders
  });

  console.log('\n--- VERIFYING TEAMS & CAPTAINS ---');
  const teams = teamsRes.data?.data || teamsRes.data;
  console.log(`Found ${teams.length} teams.`);
  for (const t of teams) {
    console.log(`Team ${t.id} (${t.name}):`);
    console.log(`  Captain:`, t.captain ? `${t.captain.name} (${t.captain.category || t.captain.group}, designation: ${t.captain.designation})` : 'MISSING!');
    console.log(`  Players count: ${t.players_bought} / ${t.max_players}`);
    console.log(`  Group A count: ${t.group_a_count} / ${t.max_group_a}`);
    console.log(`  Group B count: ${t.group_b_count} / ${t.max_group_b}`);
    
    if (!t.captain || !t.captain.is_captain || t.captain.group !== 'A') {
      throw new Error(`Team ${t.id} does not have a valid Group A captain!`);
    }
    if (t.players_bought < 1 || t.group_a_count < 1) {
      throw new Error(`Team ${t.id} squad counts do not include the captain!`);
    }
  }

  // 3. Test Captain cannot be selected for Auction via /set-live
  console.log('\n--- TESTING CAPTAIN AUCTION EXCLUSION ---');
  const captainId = teams[0].captain.id;
  const selectCaptainRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auction/set-live',
    method: 'POST',
    headers: authHeaders
  }, { player_id: captainId });

  console.log('Attempt to start auction for Captain:', selectCaptainRes.status, selectCaptainRes.data);
  if (selectCaptainRes.status === 200) {
    throw new Error('Captain was incorrectly allowed to be set as live player on auction!');
  } else {
    console.log('✅ Captain successfully blocked from auction selection.');
  }

  // 4. Test Captain Edit API
  console.log('\n--- TESTING CAPTAIN UPDATE API ---');
  const updateCaptainRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/teams/${teams[0].id}/captain`,
    method: 'PUT',
    headers: authHeaders
  }, {
    name: 'Rohan Bopanna (Updated Champion)',
    age: 44,
    country: 'India',
    playing_hand: 'Right Hand',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'
  });

  console.log('Update Captain Status:', updateCaptainRes.status);
  const updatedCap = updateCaptainRes.data?.data?.captain;
  console.log('Updated Captain Data:', updatedCap?.name);
  if (updatedCap?.name !== 'Rohan Bopanna (Updated Champion)') {
    throw new Error('Captain update was not reflected in response!');
  }
  console.log('✅ Captain update API passed.');

  // 5. Test Auction Snapshot & Socket State
  const stateRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auction/state',
    method: 'GET',
    headers: authHeaders
  });
  const snapshotData = stateRes.data?.data || stateRes.data;
  const stateTeam1 = snapshotData?.teams?.find(t => t.id === 1);
  console.log('\n--- VERIFYING AUCTION STATE SNAPSHOT ---');
  console.log(`Team 1 in Snapshot: roster length=${stateTeam1?.roster?.length}, first roster item=${stateTeam1?.roster?.[0]?.name} (is_captain=${stateTeam1?.roster?.[0]?.is_captain})`);
  if (!stateTeam1?.roster?.[0]?.is_captain) {
    throw new Error('Captain not prepended to roster in auction snapshot!');
  }
  console.log('✅ Auction snapshot includes captain.');

  console.log('\n=============================================');
  console.log('🎉 ALL CAPTAIN & SQUAD LIMITS TESTS PASSED!');
  console.log('=============================================');
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
