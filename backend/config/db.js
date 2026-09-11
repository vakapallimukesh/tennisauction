const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const DEFAULT_ADMIN_PASSWORD_HASH = bcrypt.hashSync('tennis2026', 10);

// Memory store initialized with exact data matching reference image
const initialSeed = {
  admins: [
    {
      id: 1,
      username: 'admin',
      password_hash: DEFAULT_ADMIN_PASSWORD_HASH,
      full_name: 'Senior Auctioneer',
      email: 'admin@tennisleague.com',
      role: 'super_admin',
      created_at: new Date()
    }
  ],
  auction_events: [],
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
      name: 'The Racquet Warriors',
      tagline: 'Speed, Spin & Power',
      owner: 'Rohan Iyer',
      total_purse: 200000.00,
      purse_remaining: 125000.00,
      max_players: 5,
      logo_url: '/images/teams/team1-lion.svg',
      primary_color: '#22c55e',
      accent_color: '#4ade80',
      glow_color: 'rgba(34, 197, 94, 0.45)',
      bg_gradient: 'from-emerald-950/40 to-slate-950/80'
    },
    {
      id: 2,
      team_number: 2,
      name: 'Ace Storm',
      tagline: 'Precision In Every Serve',
      owner: 'Vikramaditya Roy',
      total_purse: 200000.00,
      purse_remaining: 108000.00,
      max_players: 5,
      logo_url: '/images/teams/team2-eagle.svg',
      primary_color: '#0ea5e9',
      accent_color: '#38bdf8',
      glow_color: 'rgba(14, 165, 233, 0.45)',
      bg_gradient: 'from-sky-950/40 to-slate-950/80'
    },
    {
      id: 3,
      team_number: 3,
      name: 'Thunder Bolts',
      tagline: 'Striking Like Lightning',
      owner: 'Maya Sengupta',
      total_purse: 200000.00,
      purse_remaining: 142000.00,
      max_players: 5,
      logo_url: '/images/teams/team3-crown.svg',
      primary_color: '#a855f7',
      accent_color: '#c084fc',
      glow_color: 'rgba(168, 85, 247, 0.45)',
      bg_gradient: 'from-purple-950/40 to-slate-950/80'
    },
    {
      id: 4,
      team_number: 4,
      name: 'Fire Servers',
      tagline: 'Feel the Burning Heat',
      owner: 'Kabir Malhotra',
      total_purse: 200000.00,
      purse_remaining: 96000.00,
      max_players: 5,
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
      category: 'Singles',
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
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 176,
      wins: 28,
      aces: 64,
      matches: 42,
      win_percentage: 66,
      base_price: 8000.00,
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
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 112,
      wins: 45,
      aces: 115,
      matches: 60,
      win_percentage: 75,
      base_price: 12000.00,
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
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 89,
      wins: 52,
      aces: 94,
      matches: 68,
      win_percentage: 76,
      base_price: 15000.00,
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
      category: 'Singles',
      playing_hand: 'Left Hand',
      world_ranking: 160,
      wins: 38,
      aces: 72,
      matches: 54,
      win_percentage: 70,
      base_price: 18000.00,
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
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 74,
      wins: 58,
      aces: 130,
      matches: 72,
      win_percentage: 80,
      base_price: 20000.00,
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
      category: 'All-Rounder',
      playing_hand: 'Left Hand',
      world_ranking: 134,
      wins: 40,
      aces: 88,
      matches: 59,
      win_percentage: 67,
      base_price: 14000.00,
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
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 98,
      wins: 49,
      aces: 104,
      matches: 65,
      win_percentage: 75,
      base_price: 16000.00,
      image_url: '/images/players/kenji-tanaka.jpg',
      status: 'upcoming',
      display_order: 8
    },
    // Seed Sold Players
    {
      id: 9,
      player_number: 'PLAYER #01',
      name: 'Rohan Iyer (Sr.)',
      age: 26,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 148,
      wins: 48,
      aces: 45,
      matches: 12,
      win_percentage: 75,
      base_price: 15000.00,
      image_url: '/images/players/rohan-iyer.jpg',
      status: 'sold',
      display_order: 9
    },
    {
      id: 10,
      player_number: 'PLAYER #02',
      name: 'Sana Kapoor',
      age: 22,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 132,
      wins: 34,
      aces: 32,
      matches: 10,
      win_percentage: 70,
      base_price: 10000.00,
      image_url: '/images/players/sana-kapoor.jpg',
      status: 'sold',
      display_order: 10
    },
    {
      id: 11,
      player_number: 'PLAYER #03',
      name: 'Arjun Mehta (Sr.)',
      age: 24,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 140,
      wins: 39,
      aces: 40,
      matches: 14,
      win_percentage: 68,
      base_price: 12000.00,
      image_url: '/images/players/arjun-mehta.jpg',
      status: 'sold',
      display_order: 11
    },
    {
      id: 12,
      player_number: 'PLAYER #05',
      name: 'Naveen Reddy',
      age: 24,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Singles',
      playing_hand: 'Left Hand',
      world_ranking: 155,
      wins: 30,
      aces: 60,
      matches: 44,
      win_percentage: 68,
      base_price: 11000.00,
      image_url: '/images/players/devansh-verma.jpg',
      status: 'sold',
      display_order: 12
    },
    {
      id: 13,
      player_number: 'PLAYER #06',
      name: 'Lucas Meyer',
      age: 23,
      country: 'Germany',
      country_flag: '🇩🇪',
      category: 'All-Rounder',
      playing_hand: 'Right Hand',
      world_ranking: 105,
      wins: 46,
      aces: 96,
      matches: 62,
      win_percentage: 74,
      base_price: 16000.00,
      image_url: '/images/players/lucas-meyer.jpg',
      status: 'sold',
      display_order: 13
    },
    {
      id: 14,
      player_number: 'PLAYER #08',
      name: 'Tanvi Joshi',
      age: 21,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Doubles',
      playing_hand: 'Right Hand',
      world_ranking: 130,
      wins: 32,
      aces: 54,
      matches: 45,
      win_percentage: 71,
      base_price: 9000.00,
      image_url: '/images/players/tanvi-joshi.jpg',
      status: 'sold',
      display_order: 14
    },
    {
      id: 15,
      player_number: 'PLAYER #10',
      name: 'Marcus Vance',
      age: 25,
      country: 'USA',
      country_flag: '🇺🇸',
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 95,
      wins: 54,
      aces: 118,
      matches: 70,
      win_percentage: 77,
      base_price: 18000.00,
      image_url: '/images/players/liam-carter.jpg',
      status: 'sold',
      display_order: 15
    },
    {
      id: 16,
      player_number: 'PLAYER #11',
      name: 'Priya Nair',
      age: 23,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 142,
      wins: 33,
      aces: 62,
      matches: 48,
      win_percentage: 68,
      base_price: 12000.00,
      image_url: '/images/players/elena-rostova.jpg',
      status: 'sold',
      display_order: 16
    },
    {
      id: 17,
      player_number: 'PLAYER #14',
      name: 'Zack Taylor',
      age: 24,
      country: 'UK',
      country_flag: '🇬🇧',
      category: 'All-Rounder',
      playing_hand: 'Right Hand',
      world_ranking: 118,
      wins: 41,
      aces: 85,
      matches: 56,
      win_percentage: 73,
      base_price: 15000.00,
      image_url: '/images/players/vikram-desai.jpg',
      status: 'sold',
      display_order: 17
    }
  ],
  team_players: [
    // Team 1: 3 players bought, total 75,000 spent -> remaining 125,000
    { id: 1, team_id: 1, player_id: 9, purchase_price: 28000.00, purchased_at: new Date() },
    { id: 2, team_id: 1, player_id: 10, purchase_price: 25000.00, purchased_at: new Date() },
    { id: 3, team_id: 1, player_id: 11, purchase_price: 22000.00, purchased_at: new Date() },
    // Team 2: 2 players bought, total 92,000 spent -> remaining 108,000
    { id: 4, team_id: 2, player_id: 12, purchase_price: 44000.00, purchased_at: new Date() },
    { id: 5, team_id: 2, player_id: 13, purchase_price: 48000.00, purchased_at: new Date() },
    // Team 3: 2 players bought, total 58,000 spent -> remaining 142,000
    { id: 6, team_id: 3, player_id: 14, purchase_price: 26000.00, purchased_at: new Date() },
    { id: 7, team_id: 3, player_id: 15, purchase_price: 32000.00, purchased_at: new Date() },
    // Team 4: 2 players bought, total 104,000 spent -> remaining 96,000
    { id: 8, team_id: 4, player_id: 16, purchase_price: 50000.00, purchased_at: new Date() },
    { id: 9, team_id: 4, player_id: 17, purchase_price: 54000.00, purchased_at: new Date() }
  ],
  auction: {
    id: 1,
    title: 'Grand Slam Tennis Player Auction 2026',
    status: 'live',
    current_player_id: 1,
    current_bid: 42000.00,
    highest_bidder_team_id: 1,
    bid_increment: 2000.00,
    timer_seconds: 15,
    timer_remaining: 15,
    timer_running: true
  },
  bids: [
    { id: 1, auction_id: 1, player_id: 1, team_id: 2, amount: 34000.00, bid_time: new Date(Date.now() - 40000) },
    { id: 2, auction_id: 1, player_id: 1, team_id: 3, amount: 36000.00, bid_time: new Date(Date.now() - 30000) },
    { id: 3, auction_id: 1, player_id: 1, team_id: 2, amount: 38000.00, bid_time: new Date(Date.now() - 20000) },
    { id: 4, auction_id: 1, player_id: 1, team_id: 4, amount: 40000.00, bid_time: new Date(Date.now() - 10000) },
    { id: 5, auction_id: 1, player_id: 1, team_id: 1, amount: 42000.00, bid_time: new Date() }
  ]
};

// Deep copy for runtime state
let memoryStore = JSON.parse(JSON.stringify(initialSeed));

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
      // Test connection
      const conn = await pool.getConnection();
      console.log('✅ Connected to MySQL Database:', DB_NAME);
      conn.release();
      isUsingMySQL = true;
    } catch (err) {
      console.warn('⚠️  Could not connect to MySQL server (' + err.message + '). Using robust in-memory database store.');
      isUsingMySQL = false;
    }
  } else {
    console.log('ℹ️  No MySQL environment variables defined. Using fast, persistent in-memory database store.');
    isUsingMySQL = false;
  }
}

initDB();

module.exports = {
  getPool: () => pool,
  isUsingMySQL: () => isUsingMySQL,
  getMemoryStore: () => memoryStore,
  resetMemoryStore: () => {
    memoryStore = JSON.parse(JSON.stringify(initialSeed));
    return memoryStore;
  }
};
