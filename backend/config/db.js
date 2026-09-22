const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Hash default passwords from environment variables (or generate random defaults for development)
const ADMIN_PASS = process.env.DEFAULT_ADMIN_PASSWORD || 'tennis2026';
const TEAM1_PASS = process.env.DEFAULT_TEAM1_PASSWORD || 'team1@auction';
const TEAM2_PASS = process.env.DEFAULT_TEAM2_PASSWORD || 'team2@auction';
const TEAM3_PASS = process.env.DEFAULT_TEAM3_PASSWORD || 'team3@auction';
const TEAM4_PASS = process.env.DEFAULT_TEAM4_PASSWORD || 'team4@auction';

const adminHash = bcrypt.hashSync(ADMIN_PASS, 10);
const team1Hash = bcrypt.hashSync(TEAM1_PASS, 10);
const team2Hash = bcrypt.hashSync(TEAM2_PASS, 10);
const team3Hash = bcrypt.hashSync(TEAM3_PASS, 10);
const team4Hash = bcrypt.hashSync(TEAM4_PASS, 10);

const initialSeed = {
  users: [
    { id: 1, username: 'admin', password_hash: adminHash, full_name: 'Tournament Director', role: 'admin', team_id: null },
    { id: 2, username: 'team1', password_hash: team1Hash, full_name: 'Team A Captain', role: 'team', team_id: 1 },
    { id: 3, username: 'team2', password_hash: team2Hash, full_name: 'Team B Manager', role: 'team', team_id: 2 },
    { id: 4, username: 'team3', password_hash: team3Hash, full_name: 'Team C Owner', role: 'team', team_id: 3 },
    { id: 5, username: 'team4', password_hash: team4Hash, full_name: 'Team D Head Coach', role: 'team', team_id: 4 }
  ],
  sponsors: [
    { id: 1, category: 'POWERED BY', name: 'SportWave', logo_icon: 'sportwave', website: 'https://sportwave.example.com' },
    { id: 2, category: 'CO-SPONSOR', name: 'ApexHealth', logo_icon: 'apexhealth', website: 'https://apexhealth.example.com' },
    { id: 3, category: 'ASSOCIATE SPONSOR', name: 'NovaTech', logo_icon: 'novatech', website: 'https://novatech.example.com' },
    { id: 4, category: 'OFFICIAL PARTNER', name: 'GrandVista', logo_icon: 'grandvista', website: 'https://grandvista.example.com' }
  ],
  teams: [
    {
      id: 1,
      team_number: 1,
      name: 'Team A',
      owner: 'Rohan Iyer',
      total_purse: 400000.00,
      purse_remaining: 400000.00,
      max_players: 10,
      max_group_a: 3,
      max_group_b: 7,
      logo_url: '/images/teams/team1-lion.svg',
      primary_color: '#22c55e',
      accent_color: '#4ade80',
      glow_color: 'rgba(34, 197, 94, 0.45)',
      bg_gradient: 'from-emerald-950/40 to-slate-950/80'
    },
    {
      id: 2,
      team_number: 2,
      name: 'Team B',
      owner: 'Vikramaditya Roy',
      total_purse: 400000.00,
      purse_remaining: 400000.00,
      max_players: 10,
      max_group_a: 3,
      max_group_b: 7,
      logo_url: '/images/teams/team2-eagle.svg',
      primary_color: '#0ea5e9',
      accent_color: '#38bdf8',
      glow_color: 'rgba(14, 165, 233, 0.45)',
      bg_gradient: 'from-sky-950/40 to-slate-950/80'
    },
    {
      id: 3,
      team_number: 3,
      name: 'Team C',
      owner: 'Maya Sengupta',
      total_purse: 400000.00,
      purse_remaining: 400000.00,
      max_players: 10,
      max_group_a: 3,
      max_group_b: 7,
      logo_url: '/images/teams/team3-crown.svg',
      primary_color: '#a855f7',
      accent_color: '#c084fc',
      glow_color: 'rgba(168, 85, 247, 0.45)',
      bg_gradient: 'from-purple-950/40 to-slate-950/80'
    },
    {
      id: 4,
      team_number: 4,
      name: 'Team D',
      owner: 'Kabir Malhotra',
      total_purse: 400000.00,
      purse_remaining: 400000.00,
      max_players: 10,
      max_group_a: 3,
      max_group_b: 7,
      logo_url: '/images/teams/team4-flame.svg',
      primary_color: '#f97316',
      accent_color: '#fb923c',
      glow_color: 'rgba(249, 115, 22, 0.45)',
      bg_gradient: 'from-orange-950/40 to-slate-950/80'
    }
  ],
  players: [
    {
      id: 1,
      player_number: 'PLAYER #07',
      name: 'Arjun Mehta',
      age: 22,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 148,
      wins: 32,
      aces: 87,
      matches: 47,
      win_percentage: 68,
      base_price: 10000.00,
      image_url: '/images/players/arjun-mehta.jpg',
      status: 'live',
      display_order: 1
    },
    {
      id: 2,
      player_number: 'PLAYER #12',
      name: 'Rohan Iyer',
      age: 24,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 176,
      wins: 28,
      aces: 64,
      matches: 42,
      win_percentage: 66,
      base_price: 10000.00,
      image_url: '/images/players/rohan-iyer.jpg',
      status: 'upcoming',
      display_order: 2
    },
    {
      id: 3,
      player_number: 'PLAYER #04',
      name: 'Liam Carter',
      age: 21,
      country: 'Australia',
      country_flag: '🇦🇺',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 112,
      wins: 45,
      aces: 115,
      matches: 60,
      win_percentage: 75,
      base_price: 10000.00,
      image_url: '/images/players/liam-carter.jpg',
      status: 'upcoming',
      display_order: 3
    },
    {
      id: 4,
      player_number: 'PLAYER #09',
      name: 'Sana Kapoor',
      age: 23,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 89,
      wins: 52,
      aces: 94,
      matches: 68,
      win_percentage: 76,
      base_price: 10000.00,
      image_url: '/images/players/sana-kapoor.jpg',
      status: 'upcoming',
      display_order: 4
    },
    {
      id: 5,
      player_number: 'PLAYER #15',
      name: 'Vikram Desai',
      age: 25,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Left Hand',
      world_ranking: 160,
      wins: 38,
      aces: 72,
      matches: 54,
      win_percentage: 70,
      base_price: 10000.00,
      image_url: '/images/players/vikram-desai.jpg',
      status: 'upcoming',
      display_order: 5
    },
    {
      id: 6,
      player_number: 'PLAYER #18',
      name: 'Elena Rostova',
      age: 20,
      country: 'Spain',
      country_flag: '🇪🇸',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 74,
      wins: 58,
      aces: 130,
      matches: 72,
      win_percentage: 80,
      base_price: 10000.00,
      image_url: '/images/players/elena-rostova.jpg',
      status: 'upcoming',
      display_order: 6
    },
    {
      id: 7,
      player_number: 'PLAYER #22',
      name: 'Mateo Silva',
      age: 26,
      country: 'Argentina',
      country_flag: '🇦🇷',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Left Hand',
      world_ranking: 134,
      wins: 40,
      aces: 88,
      matches: 59,
      win_percentage: 67,
      base_price: 10000.00,
      image_url: '/images/players/mateo-silva.jpg',
      status: 'upcoming',
      display_order: 7
    },
    {
      id: 8,
      player_number: 'PLAYER #27',
      name: 'Kenji Tanaka',
      age: 22,
      country: 'Japan',
      country_flag: '🇯🇵',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 98,
      wins: 49,
      aces: 104,
      matches: 65,
      win_percentage: 75,
      base_price: 10000.00,
      image_url: '/images/players/kenji-tanaka.jpg',
      status: 'upcoming',
      display_order: 8
    },
    {
      id: 9,
      player_number: 'PLAYER #01',
      name: 'Rohan Iyer (Sr.)',
      age: 26,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 148,
      wins: 48,
      aces: 45,
      matches: 12,
      win_percentage: 75,
      base_price: 10000.00,
      image_url: '/images/players/rohan-iyer.jpg',
      status: 'upcoming',
      display_order: 9
    },
    {
      id: 10,
      player_number: 'PLAYER #02',
      name: 'Sana Kapoor (Sr.)',
      age: 22,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 132,
      wins: 34,
      aces: 32,
      matches: 10,
      win_percentage: 70,
      base_price: 10000.00,
      image_url: '/images/players/sana-kapoor.jpg',
      status: 'upcoming',
      display_order: 10
    },
    {
      id: 11,
      player_number: 'PLAYER #03',
      name: 'Arjun Mehta (Sr.)',
      age: 24,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 140,
      wins: 39,
      aces: 40,
      matches: 14,
      win_percentage: 68,
      base_price: 10000.00,
      image_url: '/images/players/arjun-mehta.jpg',
      status: 'upcoming',
      display_order: 11
    },
    {
      id: 12,
      player_number: 'PLAYER #05',
      name: 'Naveen Reddy',
      age: 24,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Left Hand',
      world_ranking: 155,
      wins: 30,
      aces: 60,
      matches: 44,
      win_percentage: 68,
      base_price: 10000.00,
      image_url: '/images/players/devansh-verma.jpg',
      status: 'upcoming',
      display_order: 12
    },
    {
      id: 13,
      player_number: 'PLAYER #06',
      name: 'Lucas Meyer',
      age: 23,
      country: 'Germany',
      country_flag: '🇩🇪',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 105,
      wins: 46,
      aces: 96,
      matches: 62,
      win_percentage: 74,
      base_price: 10000.00,
      image_url: '/images/players/lucas-meyer.jpg',
      status: 'upcoming',
      display_order: 13
    },
    {
      id: 14,
      player_number: 'PLAYER #08',
      name: 'Tanvi Joshi',
      age: 21,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 130,
      wins: 32,
      aces: 54,
      matches: 45,
      win_percentage: 71,
      base_price: 10000.00,
      image_url: '/images/players/tanvi-joshi.jpg',
      status: 'upcoming',
      display_order: 14
    },
    {
      id: 15,
      player_number: 'PLAYER #10',
      name: 'Marcus Vance',
      age: 25,
      country: 'USA',
      country_flag: '🇺🇸',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 95,
      wins: 54,
      aces: 118,
      matches: 70,
      win_percentage: 77,
      base_price: 10000.00,
      image_url: '/images/players/liam-carter.jpg',
      status: 'upcoming',
      display_order: 15
    },
    {
      id: 16,
      player_number: 'PLAYER #11',
      name: 'Priya Nair',
      age: 23,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group B',
      group: 'B',
      playing_hand: 'Right Hand',
      world_ranking: 142,
      wins: 33,
      aces: 62,
      matches: 48,
      win_percentage: 68,
      base_price: 10000.00,
      image_url: '/images/players/elena-rostova.jpg',
      status: 'upcoming',
      display_order: 16
    },
    {
      id: 17,
      player_number: 'PLAYER #14',
      name: 'Zack Taylor',
      age: 24,
      country: 'UK',
      country_flag: '🇬🇧',
      category: 'Group A',
      group: 'A',
      playing_hand: 'Right Hand',
      world_ranking: 118,
      wins: 41,
      aces: 85,
      matches: 56,
      win_percentage: 73,
      base_price: 10000.00,
      image_url: '/images/players/vikram-desai.jpg',
      status: 'upcoming',
      display_order: 17
    }
  ],
  team_players: [],
  auction: {
    id: 1,
    title: 'Grand Circuit Tennis Player Auction 2026',
    status: 'live',
    current_player_id: 1,
    current_bid: 10000.00,
    highest_bidder_team_id: null,
    bid_increment: 2000.00,
    timer_seconds: 15,
    timer_remaining: 15,
    timer_running: false
  },
  bids: [],
  auction_events: []
};

// Data persistence directory & store file
const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err.message);
  }
}

// Load initial store from persistent file if present, else seed
let memoryStore = null;

function loadStoreFromDisk() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.teams)) {
        // Enforce 10 players max (3 Group A, 7 Group B) on all teams
        parsed.teams = parsed.teams.map(t => ({
          ...t,
          max_players: 10,
          max_group_a: 3,
          max_group_b: 7
        }));
        saveStoreToDisk(parsed);
        console.log(`📁 Loaded persistent database store from ${STORE_PATH} (${parsed.players.length} players)`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`⚠️ Could not parse store.json: ${err.message}. Using initial seed.`);
  }

  const fresh = JSON.parse(JSON.stringify(initialSeed));
  saveStoreToDisk(fresh);
  return fresh;
}

// Atomic synchronous save to prevent corruption
function saveStoreToDisk(storeToSave) {
  try {
    const data = storeToSave || memoryStore;
    if (!data) return;
    const tempPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, STORE_PATH);
  } catch (err) {
    console.error('❌ Error saving database store to disk:', err.message);
  }
}

memoryStore = loadStoreFromDisk();

let pool = null;
let isUsingMySQL = false;

async function initDB() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (DB_HOST && DB_NAME) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER || 'root',
        password: DB_PASSWORD || '',
        database: DB_NAME,
        port: DB_PORT ? parseInt(DB_PORT, 10) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      const conn = await pool.getConnection();
      console.log('✅ Connected to MySQL Database:', DB_NAME);

      // Auto-create/migrate tables if not existing
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`teams\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`team_number\` INT NOT NULL UNIQUE,
          \`name\` VARCHAR(100) NOT NULL,
          \`tagline\` VARCHAR(150) NULL,
          \`owner\` VARCHAR(100) NOT NULL,
          \`total_purse\` DECIMAL(12,2) NOT NULL DEFAULT 400000.00,
          \`purse_remaining\` DECIMAL(12,2) NOT NULL DEFAULT 400000.00,
          \`max_players\` INT NOT NULL DEFAULT 10,
          \`logo_url\` VARCHAR(255) NOT NULL,
          \`primary_color\` VARCHAR(30) NOT NULL,
          \`accent_color\` VARCHAR(30) NOT NULL,
          \`glow_color\` VARCHAR(50) NOT NULL,
          \`bg_gradient\` VARCHAR(100) NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`players\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`player_number\` VARCHAR(40) NOT NULL UNIQUE,
          \`name\` VARCHAR(120) NOT NULL,
          \`age\` INT NOT NULL DEFAULT 22,
          \`country\` VARCHAR(60) NOT NULL DEFAULT 'India',
          \`country_flag\` VARCHAR(20) NOT NULL DEFAULT '🇮🇳',
          \`category\` VARCHAR(40) NOT NULL DEFAULT 'Group A',
          \`group\` VARCHAR(10) NOT NULL DEFAULT 'A',
          \`playing_hand\` VARCHAR(40) NOT NULL DEFAULT 'Right Hand',
          \`world_ranking\` INT NOT NULL DEFAULT 150,
          \`wins\` INT NOT NULL DEFAULT 0,
          \`aces\` INT NOT NULL DEFAULT 0,
          \`matches\` INT NOT NULL DEFAULT 0,
          \`win_percentage\` INT NOT NULL DEFAULT 0,
          \`base_price\` DECIMAL(12,2) NOT NULL DEFAULT 10000.00,
          \`image_url\` LONGTEXT NOT NULL,
          \`status\` VARCHAR(30) NOT NULL DEFAULT 'upcoming',
          \`display_order\` INT NOT NULL DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Ensure image_url is LONGTEXT so large base64 or long image URLs never fail
      try {
        await conn.query(`ALTER TABLE \`players\` MODIFY COLUMN \`image_url\` LONGTEXT NOT NULL`);
      } catch {
        // ignore if already longtext
      }

      // Sync players from MySQL if populated
      const [rows] = await conn.query('SELECT * FROM `players` ORDER BY id ASC');
      if (rows && rows.length > 0) {
        memoryStore.players = rows.map(r => ({
          ...r,
          id: Number(r.id),
          age: Number(r.age),
          base_price: Number(r.base_price),
          display_order: Number(r.display_order || r.id)
        }));
        saveStoreToDisk(memoryStore);
        console.log(`📥 Loaded ${rows.length} players from MySQL database.`);
      } else {
        // Seed MySQL with initial players
        for (const p of memoryStore.players) {
          await conn.query(`
            INSERT INTO \`players\` (id, player_number, name, age, country, country_flag, category, \`group\`, playing_hand, world_ranking, wins, aces, matches, win_percentage, base_price, image_url, status, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE name=VALUES(name), base_price=VALUES(base_price), image_url=VALUES(image_url), category=VALUES(category), \`group\`=VALUES(\`group\`)
          `, [
            p.id, p.player_number, p.name, p.age, p.country, p.country_flag, p.category, p.group || 'A',
            p.playing_hand, p.world_ranking, p.wins, p.aces, p.matches, p.win_percentage,
            p.base_price, p.image_url, p.status, p.display_order
          ]);
        }
        console.log(`🌱 Seeded ${memoryStore.players.length} players to MySQL.`);
      }

      conn.release();
      isUsingMySQL = true;
    } catch (err) {
      console.warn('⚠️ Could not connect to MySQL server (' + err.message + '). Using persistent file-backed database store.');
      isUsingMySQL = false;
    }
  } else {
    console.log('ℹ️ MySQL not configured in environment. Using atomic persistent disk store (backend/data/store.json).');
    isUsingMySQL = false;
  }
}

// Database helper functions for persistent Player CRUD
async function dbSavePlayer(player) {
  // 1. Update in-memory store
  const index = memoryStore.players.findIndex(p => p.id === player.id);
  if (index !== -1) {
    memoryStore.players[index] = { ...memoryStore.players[index], ...player };
  } else {
    memoryStore.players.push(player);
  }

  // 2. Persist to disk
  saveStoreToDisk(memoryStore);

  // 3. Persist to MySQL if active
  if (isUsingMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO \`players\` (id, player_number, name, age, country, country_flag, category, \`group\`, playing_hand, world_ranking, wins, aces, matches, win_percentage, base_price, image_url, status, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name),
          player_number=VALUES(player_number),
          age=VALUES(age),
          country=VALUES(country),
          country_flag=VALUES(country_flag),
          category=VALUES(category),
          \`group\`=VALUES(\`group\`),
          playing_hand=VALUES(playing_hand),
          world_ranking=VALUES(world_ranking),
          wins=VALUES(wins),
          aces=VALUES(aces),
          matches=VALUES(matches),
          win_percentage=VALUES(win_percentage),
          base_price=VALUES(base_price),
          image_url=VALUES(image_url),
          status=VALUES(status),
          display_order=VALUES(display_order)
      `, [
        player.id,
        player.player_number,
        player.name,
        player.age || 22,
        player.country || 'India',
        player.country_flag || '🇮🇳',
        player.category || (player.group === 'B' ? 'Group B' : 'Group A'),
        player.group === 'B' ? 'B' : 'A',
        player.playing_hand || 'Right Hand',
        player.world_ranking || 150,
        player.wins || 0,
        player.aces || 0,
        player.matches || 0,
        player.win_percentage || 0,
        player.base_price || 10000,
        player.image_url !== undefined ? player.image_url : '',
        player.status || 'upcoming',
        player.display_order || player.id
      ]);
    } catch (err) {
      console.error('❌ Error updating player in MySQL:', err.message);
    }
  }

  return player;
}

async function dbDeletePlayer(playerId) {
  const idNum = parseInt(playerId, 10);
  const index = memoryStore.players.findIndex(p => p.id === idNum);
  let removed = null;

  if (index !== -1) {
    removed = memoryStore.players.splice(index, 1)[0];
  }

  // Also clean up any team_players or bids associated with this player
  memoryStore.team_players = memoryStore.team_players.filter(tp => tp.player_id !== idNum);
  memoryStore.bids = memoryStore.bids.filter(b => b.player_id !== idNum);

  if (memoryStore.auction && memoryStore.auction.current_player_id === idNum) {
    memoryStore.auction.current_player_id = null;
    memoryStore.auction.current_bid = 0;
    memoryStore.auction.highest_bidder_team_id = null;
  }

  saveStoreToDisk(memoryStore);

  if (isUsingMySQL && pool) {
    try {
      await pool.query('DELETE FROM `team_players` WHERE player_id = ?', [idNum]);
      await pool.query('DELETE FROM `bids` WHERE player_id = ?', [idNum]);
      await pool.query('DELETE FROM `players` WHERE id = ?', [idNum]);
    } catch (err) {
      console.error('❌ Error deleting player from MySQL:', err.message);
    }
  }

  return removed;
}

initDB();

module.exports = {
  getPool: () => pool,
  isUsingMySQL: () => isUsingMySQL,
  getMemoryStore: () => memoryStore,
  saveStore: () => saveStoreToDisk(memoryStore),
  dbSavePlayer,
  dbDeletePlayer,
  resetMemoryStore: () => {
    memoryStore = JSON.parse(JSON.stringify(initialSeed));
    saveStoreToDisk(memoryStore);
    return memoryStore;
  }
};
