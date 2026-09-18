const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Pre-hash default passwords for immediate fallback use
const adminHash = bcrypt.hashSync('tennis2026', 10);
const team1Hash = bcrypt.hashSync('team1@auction', 10);
const team2Hash = bcrypt.hashSync('team2@auction', 10);
const team3Hash = bcrypt.hashSync('team3@auction', 10);
const team4Hash = bcrypt.hashSync('team4@auction', 10);

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
      total_purse: 100000.00,
      purse_remaining: 100000.00,
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
      name: 'Team B',
      owner: 'Vikramaditya Roy',
      total_purse: 100000.00,
      purse_remaining: 100000.00,
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
      name: 'Team C',

      owner: 'Maya Sengupta',
      total_purse: 100000.00,
      purse_remaining: 100000.00,
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
      name: 'Team D',

      owner: 'Kabir Malhotra',
      total_purse: 100000.00,
      purse_remaining: 100000.00,
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
    // Remaining Players (all clean and upcoming)
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
      const conn = await pool.getConnection();
      console.log('✅ Connected to MySQL Database:', DB_NAME);
      conn.release();
      isUsingMySQL = true;
    } catch (err) {
      console.warn('⚠️ Could not connect to MySQL server (' + err.message + '). Using in-memory fallback store.');
      isUsingMySQL = false;
    }
  } else {
    console.log('ℹ️ No MySQL environment variables defined. Using fast, resilient in-memory database store.');
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
