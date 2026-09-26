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
    { id: 2, username: 'team1', password_hash: team1Hash, full_name: '7 Aces Head Coach', role: 'team', team_id: 1 },
    { id: 3, username: 'team2', password_hash: team2Hash, full_name: 'Royal Tigers Manager', role: 'team', team_id: 2 },
    { id: 4, username: 'team3', password_hash: team3Hash, full_name: 'Mighty Dragons Owner', role: 'team', team_id: 3 },
    { id: 5, username: 'team4', password_hash: team4Hash, full_name: 'Golden Eagles Captain', role: 'team', team_id: 4 }
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
      name: '7 Aces',
      owner: 'Kabir Malhotra',
      total_purse: 500000.00,
      purse_remaining: 500000.00,
      max_players: 12,
      max_group_a: 4,
      max_group_b: 8,
      logo_url: '/images/teams/7aces-logo.png',
      logo_bg_color: '#FFFFFF',
      primary_color: '#374151',
      accent_color: '#4b5563',
      glow_color: 'rgba(55, 65, 81, 0.45)',
      bg_gradient: 'from-gray-950/40 to-slate-950/80',
      captain: {
        id: 5,
        name: 'Janaki Rama Raju Mantena',
        
      _number: 'CAPTAIN #01',
        age: 35,
        country: 'India',
        country_flag: '🇮🇳',
        category: 'Group A',
        group: 'A',
        is_captain: true,
        designation: 'CAPTAIN',
        playing_hand: 'Right Hand',
        backhand_style: 'Single handed',
        jersey_name: 'Janaki',
        jersey_number: '',
        base_price: 10000,
        image_url: 'https://drive.google.com/thumbnail?id=1LoefRM0tqpo5V_vhrbfWYFCj8Mq3Eapg&sz=w400'
      }
    },
    {
      id: 2,
      team_number: 2,
      name: 'Royal Tigers',
      owner: 'Vikramaditya Roy',
      total_purse: 500000.00,
      purse_remaining: 500000.00,
      max_players: 12,
      max_group_a: 4,
      max_group_b: 8,
      logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzlPpsatteW3k07dJDMBs5epKPAFny0ZiYdq-LtsL2H65BvfKsGLAdek30S4p63lTedtEc66sqQUNDY2zsf5g_FAG8Cne45q39e7eIvGaR5X90S1oUc2G8m88PioKEfwrq1q7198GKRElA8YFulNGf5Q9yiSRPOBF4yG4180hCy_Lam6VV9WPAlHdAQApiJu9E1-amSiUVdy3FkXBNRcJxVvNs-yMDshhNQA5RcwujLqsTrLUwBhs2-CMAz8HDPmLDcg',
      logo_bg_color: '#002800',
      primary_color: '#16a34a',
      accent_color: '#22c55e',
      glow_color: 'rgba(22, 163, 74, 0.45)',
      bg_gradient: 'from-emerald-950/40 to-slate-950/80',
      captain: {
        id: 3,
        name: 'Goutham Chakravarthy Vegesna',
        player_number: 'CAPTAIN #02',
        age: 47,
        country: 'India',
        country_flag: '🇮🇳',
        category: 'Group A',
        group: 'A',
        is_captain: true,
        designation: 'CAPTAIN',
        playing_hand: 'Right Hand',
        backhand_style: 'Two handed',
        jersey_name: 'Goutham',
        jersey_number: '9',
        base_price: 10000,
        image_url: 'https://drive.google.com/thumbnail?id=1rZXOFJj09vOmFI2u9558EQD_z2hBZ3g-&sz=w400'
      }
    },
    {
      id: 3,
      team_number: 3,
      name: 'Mighty Dragons',
      owner: 'Maya Sengupta',
      total_purse: 500000.00,
      purse_remaining: 500000.00,
      max_players: 12,
      max_group_a: 4,
      max_group_b: 8,
      logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4itoiytm74zFszspckrs3m2_7VmkcUg3AJ4jJZaKtWzMfSxDfwB9q-GEoD0oUXrA4UfipYKjtXnmooJPr7L_Ae69YTm-FUc97hxg9otx0WPcVis-Fn5tBhB21fdBTycoiMdwsFQfkqHoG5UFNymMau-5xgOj61A_KawQnGw37fYe4k9BwHeBuACpi1lMwotohhc9JDPAp3HUqLnF7VYA5VZ6w6k4ELLeA1HWrs6th-w0cnN_1vfG-vC8vs6g6T8--Pg',
      logo_bg_color: '#123456',
      primary_color: '#2563eb',
      accent_color: '#3b82f6',
      glow_color: 'rgba(37, 99, 235, 0.45)',
      bg_gradient: 'from-blue-950/40 to-slate-950/80',
      captain: {
        id: 6,
        name: 'K Ravi Kumar',
        player_number: 'CAPTAIN #03',
        age: 42,
        country: 'India',
        country_flag: '🇮🇳',
        category: 'Group A',
        group: 'A',
        is_captain: true,
        designation: 'CAPTAIN',
        playing_hand: 'Right Hand',
        backhand_style: 'Two handed',
        jersey_name: 'Ravi',
        jersey_number: '',
        base_price: 10000,
        image_url: 'https://drive.google.com/thumbnail?id=1ydIkbubZwsyMy46PTLakkazj7eCAaBd3&sz=w400'
      }
    },
    {
      id: 4,
      team_number: 4,
      name: 'Golden Eagles',
      owner: 'Rohan Iyer',
      total_purse: 500000.00,
      purse_remaining: 500000.00,
      max_players: 12,
      max_group_a: 4,
      max_group_b: 8,
      logo_url: '/images/teams/golden-eagles-logo.png',
      logo_bg_color: '#eb0201',
      primary_color: '#eb0201',
      accent_color: '#ef4444',
      glow_color: 'rgba(235, 2, 1, 0.45)',
      bg_gradient: 'from-red-950/40 to-slate-950/80',
      captain: {
        id: 1,
        name: 'Anunag Varma',
        player_number: 'CAPTAIN #04',
        age: 27,
        country: 'India',
        country_flag: '🇮🇳',
        category: 'Group A',
        group: 'A',
        is_captain: true,
        designation: 'CAPTAIN',
        playing_hand: 'Right Hand',
        backhand_style: 'Two handed',
        jersey_name: 'ANU',
        jersey_number: '18',
        base_price: 10000,
        image_url: 'https://drive.google.com/thumbnail?id=1dleY-nWWJvjD69UJTx-i85w6LccrRKp7&sz=w400'
      }
    }
  ],
  players: [
    // ===== GROUP A PLAYERS =====
    {
      id: 1, player_number: 'PLAYER #01', name: 'Dr Kiran',
      age: 39, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Kiran', jersey_number: '6',
      base_price: 10000.00,
      image_url: '/images/players2/Dr%20kiran.png',
      status: 'live', display_order: 1
    },
    {
      id: 2, player_number: 'PLAYER #02', name: 'I Prakash',
      age: 42, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Prakash', jersey_number: '77',
      base_price: 10000.00,
      image_url: '/images/players2/I%20Prakash.png',
      status: 'upcoming', display_order: 2
    },
    {
      id: 3, player_number: 'PLAYER #03', name: 'K Satyanarayana Raju',
      age: 39, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'K S N Raju', jersey_number: '39',
      base_price: 10000.00,
      image_url: '/images/players2/K%20Satyanarayana%20raju.png',
      status: 'upcoming', display_order: 3
    },
    {
      id: 4, player_number: 'PLAYER #04', name: 'Mantena Atchyuth varma',
      age: 25, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Atchyuth', jersey_number: '63',
      base_price: 10000.00,
      image_url: '/images/players2/Mantena%20Atchyuth%20varma.png',
      status: 'upcoming', display_order: 4
    },
    {
      id: 5, player_number: 'PLAYER #05', name: 'M Vamsi krishna',
      age: 44, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Vamsi krishna', jersey_number: '7',
      base_price: 10000.00,
      image_url: '/images/players2/M%20Vamsi%20krishna.png',
      status: 'upcoming', display_order: 5
    },
    {
      id: 6, player_number: 'PLAYER #06', name: 'M V Siva Kumar Raju',
      age: 53, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'Siva', jersey_number: '11',
      base_price: 10000.00,
      image_url: '/images/players2/M%20V%20Shiva%20Kumar%20raju.png',
      status: 'upcoming', display_order: 6
    },
    {
      id: 7, player_number: 'PLAYER #07', name: 'P Muralidhar',
      age: 40, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'Murali', jersey_number: '7',
      base_price: 10000.00,
      image_url: '/images/players2/P%20Murali.png',
      status: 'upcoming', display_order: 7
    },
    {
      id: 8, player_number: 'PLAYER #08', name: 'P Subash',
      age: 47, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'Subash', jersey_number: '9',
      base_price: 10000.00,
      image_url: '/images/players2/P%20Subash.png',
      status: 'upcoming', display_order: 8
    },
    {
      id: 9, player_number: 'PLAYER #09', name: 'Rama Krishna vadlamudi',
      age: 46, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'VRK', jersey_number: '9',
      base_price: 10000.00,
      image_url: '/images/players2/Rama%20Krishna%20vadlamudi.png',
      status: 'upcoming', display_order: 9
    },
    {
      id: 10, player_number: 'PLAYER #10', name: 'Royal K',
      age: 28, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'Royal', jersey_number: '57',
      base_price: 10000.00,
      image_url: '/images/players2/Royal%20K.png',
      status: 'upcoming', display_order: 10
    },
    {
      id: 11, player_number: 'PLAYER #11', name: 'Sajeev sahay T',
      age: 35, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'Sajeev', jersey_number: '7',
      base_price: 10000.00,
      image_url: '/images/players2/Sajeev%20sahay%20T.png',
      status: 'upcoming', display_order: 11
    },
    {
      id: 12, player_number: 'PLAYER #12', name: 'Uday Varma',
      age: 41, country: 'India', country_flag: '🇮🇳',
      category: 'Group A', group: 'A', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Uday', jersey_number: '5',
      base_price: 10000.00,
      image_url: '/images/players2/Uday%20Varma.png',
      status: 'upcoming', display_order: 12
    },
    // ===== GROUP B PLAYERS =====
    {
      id: 13, player_number: 'PLAYER #13', name: 'Abhishek varma Kothapalli',
      age: 30, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Abhishek', jersey_number: '18',
      base_price: 10000.00,
      image_url: '/images/players2/Abhishek.png',
      status: 'upcoming', display_order: 13
    },
    {
      id: 14, player_number: 'PLAYER #14', name: 'Appala raju',
      age: 52, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Appala raju', jersey_number: '9',
      base_price: 10000.00,
      image_url: '/images/players2/Appala%20raju.png',
      status: 'upcoming', display_order: 14
    },
    {
      id: 15, player_number: 'PLAYER #15', name: 'CH Bangar raju',
      age: 30, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'CH Bangar raju', jersey_number: '1',
      base_price: 10000.00,
      image_url: '/images/players2/Bangar%20raju.png',
      status: 'upcoming', display_order: 15
    },
    {
      id: 16, player_number: 'PLAYER #16', name: 'BH Gajapathi Raju',
      age: 50, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'GP', jersey_number: '63',
      base_price: 10000.00,
      image_url: '/images/players2/Gajapathi.png',
      status: 'upcoming', display_order: 16
    },
    {
      id: 17, player_number: 'PLAYER #17', name: 'Bh. Karthikeya Varma',
      age: 30, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Karthik', jersey_number: '12',
      base_price: 10000.00,
      image_url: '/images/players2/Karthikeya.png',
      status: 'upcoming', display_order: 17
    },
    {
      id: 18, player_number: 'PLAYER #18', name: 'Chandra Sekhar K',
      age: 39, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'CHANDU', jersey_number: '6',
      base_price: 10000.00,
      image_url: '/images/players2/Chandra%20sekhar.png',
      status: 'upcoming', display_order: 18
    },
    {
      id: 19, player_number: 'PLAYER #19', name: 'V Bangar raju',
      age: 54, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'V Bangar raju', jersey_number: '11',
      base_price: 10000.00,
      image_url: '/images/players2/Bangar%20raju.png',
      status: 'upcoming', display_order: 19
    },
    {
      id: 20, player_number: 'PLAYER #20', name: 'Datta varma',
      age: 23, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'Datta', jersey_number: '12',
      base_price: 10000.00,
      image_url: '/images/players2/Datta%20varma.png',
      status: 'upcoming', display_order: 20
    },
    {
      id: 21, player_number: 'PLAYER #21', name: 'Dr G V PAVAN KUMAR',
      age: 44, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Not specified', jersey_name: '', jersey_number: '99',
      base_price: 10000.00,
      image_url: '/images/players2/Pavan.png',
      status: 'upcoming', display_order: 21
    },
    {
      id: 22, player_number: 'PLAYER #22', name: 'Dr Shravan',
      age: 31, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Shravan', jersey_number: '3',
      base_price: 10000.00,
      image_url: '/images/players2/Dr%20Shravan.png',
      status: 'upcoming', display_order: 22
    },
    {
      id: 23, player_number: 'PLAYER #23', name: 'Dr Suresh Mudunuri',
      age: 45, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Not specified', jersey_name: '', jersey_number: '10',
      base_price: 10000.00,
      image_url: '/images/players2/Dr%20Suresh%20Mudunuri.png',
      status: 'upcoming', display_order: 23
    },
    {
      id: 26, player_number: 'PLAYER #26', name: 'G Subhash',
      age: 40, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'G Subhash', jersey_number: '86',
      base_price: 10000.00,
      image_url: '/images/players2/G%20Subhash.png',
      status: 'upcoming', display_order: 26
    },
    {
      id: 27, player_number: 'PLAYER #27', name: 'G V Kiran Kumar raju',
      age: 30, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Singh handed', jersey_name: '', jersey_number: '',
      base_price: 10000.00,
      image_url: '/images/players2/G%20V%20Kiran%20Kumar%20Raju.png',
      status: 'upcoming', display_order: 27
    },
    {
      id: 24, player_number: 'PLAYER #24', name: 'G.Gopala krishnam Raju',
      age: 48, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Gopi', jersey_number: '7',
      base_price: 10000.00,
      image_url: '/images/players2/G.Gopala%20krishnam%20Raju.png',
      status: 'upcoming', display_order: 24
    },
    {
      id: 25, player_number: 'PLAYER #25', name: 'Grandhi Suresh',
      age: 55, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Suresh Grandhi', jersey_number: '72',
      base_price: 10000.00,
      image_url: '/images/players2/Grandhi%20Suresh.png',
      status: 'upcoming', display_order: 25
    },
    {
      id: 28, player_number: 'PLAYER #28', name: 'Jagapati',
      age: 53, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: '10', jersey_number: 'Jaggu',
      base_price: 10000.00,
      image_url: '/images/players2/Jagapathi.png',
      status: 'upcoming', display_order: 28
    },
    {
      id: 31, player_number: 'PLAYER #31', name: 'K Srinivasaraju',
      age: 61, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Srinu', jersey_number: '99',
      base_price: 10000.00,
      image_url: '/images/players2/K%20Srinavasraju.png',
      status: 'upcoming', display_order: 31
    },
    {
      id: 29, player_number: 'PLAYER #29', name: 'Kalidindi Srinivasavarma',
      age: 56, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'Blue', jersey_number: '457',
      base_price: 10000.00,
      image_url: '/images/players2/Kalidindi%20Srinivasavarma.png',
      status: 'upcoming', display_order: 29
    },
    {
      id: 30, player_number: 'PLAYER #30', name: 'Kopparthi ravi babu',
      age: 50, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'Ravi', jersey_number: 'O9',
      base_price: 10000.00,
      image_url: '/images/players2/Kopparthi%20ravi%20babu.png',
      status: 'upcoming', display_order: 30
    },
    {
      id: 32, player_number: 'PLAYER #32', name: 'M Rajbabu',
      age: 47, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Rajbabu', jersey_number: '1',
      base_price: 10000.00,
      image_url: '/images/players2/M%20Rajbabu.png',
      status: 'upcoming', display_order: 32
    },
    {
      id: 33, player_number: 'PLAYER #33', name: 'M Viswanadha Raju',
      age: 51, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Vissu', jersey_number: '62',
      base_price: 10000.00,
      image_url: '/images/players2/M%20Viswanadha%20Raju.png',
      status: 'upcoming', display_order: 33
    },
    {
      id: 34, player_number: 'PLAYER #34', name: 'Naga Firoz Babu',
      age: 51, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Firoz', jersey_number: '6',
      base_price: 10000.00,
      image_url: '/images/players2/Naga%20Firoz%20Babu.png',
      status: 'upcoming', display_order: 34
    },
    {
      id: 35, player_number: 'PLAYER #35', name: 'Neerajh Varma',
      age: 23, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'Neerajh', jersey_number: '9',
      base_price: 10000.00,
      image_url: '/images/players2/Neerajh%20Varma.png',
      status: 'upcoming', display_order: 35
    },
    {
      id: 36, player_number: 'PLAYER #36', name: 'Nehanth varma',
      age: 23, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Double handed', jersey_name: 'Nehanth', jersey_number: '12',
      base_price: 10000.00,
      image_url: '/images/players2/Nehanth%20varma.png',
      status: 'upcoming', display_order: 36
    },
    {
      id: 37, player_number: 'PLAYER #37', name: 'P Subbaraju',
      age: 41, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'RF', jersey_number: '444',
      base_price: 10000.00,
      image_url: '/images/players2/P%20Subbaraju.png',
      status: 'upcoming', display_order: 37
    },
    {
      id: 38, player_number: 'PLAYER #38', name: 'Ramu',
      age: 53, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'Ramu', jersey_number: '24',
      base_price: 10000.00,
      image_url: '/images/players2/Ramu.png',
      status: 'upcoming', display_order: 38
    },
    {
      id: 39, player_number: 'PLAYER #39', name: 'Ranjith Varma',
      age: 38, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Single handed', jersey_name: 'RV', jersey_number: '69 or 6',
      base_price: 10000.00,
      image_url: '/images/players2/Ranjith%20Varma.png',
      status: 'upcoming', display_order: 39
    },
    {
      id: 40, player_number: 'PLAYER #40', name: 'Ravi Varma',
      age: 28, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Not specified', jersey_name: '', jersey_number: '7',
      base_price: 10000.00,
      image_url: '/images/players2/Ravi%20Varma.png',
      status: 'upcoming', display_order: 40
    },
    {
      id: 41, player_number: 'PLAYER #41', name: 'Rudraraju sahul varma',
      age: 25, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'SAHUL', jersey_number: '15',
      base_price: 10000.00,
      image_url: '/images/players2/Rudraraju%20sahul%20varma.png',
      status: 'upcoming', display_order: 41
    },
    {
      id: 42, player_number: 'PLAYER #42', name: 'Srikanth Penmetsa',
      age: 44, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'One handed', jersey_name: 'Srikanth', jersey_number: '1',
      base_price: 10000.00,
      image_url: '/images/players2/Srikanth%20Penmetsa%20-%20Uniform.png',
      status: 'upcoming', display_order: 42
    },
    {
      id: 43, player_number: 'PLAYER #43', name: 'TATAVARTY RAJU',
      age: 56, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'TATAVARTY RAJU', jersey_number: '9',
      base_price: 10000.00,
      image_url: '/images/players2/TATAVARTY%20RAJU.png',
      status: 'upcoming', display_order: 43
    },
    {
      id: 44, player_number: 'PLAYER #44', name: 'Vijay kumar Raju',
      age: 46, country: 'India', country_flag: '🇮🇳',
      category: 'Group B', group: 'B', playing_hand: 'Right hand',
      backhand_style: 'Two handed', jersey_name: 'VIJAY', jersey_number: '1',
      base_price: 10000.00,
      image_url: '/images/players2/Vijay%20kumar%20Raju.png',
      status: 'upcoming', display_order: 44
    }
  ],
  team_players: [],
  auction: {
    id: 1,
    title: 'Grand Circuit Tennis Player Auction 2026',
    status: 'live',
    current_player_id: 1,
    current_bid: 0.00,
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
  const seedTeams = initialSeed.teams || [];
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.teams)) {
        // Enforce 10 players max (3 Group A, 7 Group B) and fixed captain on all teams
        parsed.teams = parsed.teams.map(t => {
          const fallbackCaptain = seedTeams.find(st => st.id === t.id)?.captain || {
            id: 100 + t.id,
            name: `Captain ${t.name}`,
            player_number: `CAPTAIN #0${t.id}`,
            age: 28,
            country: 'India',
            country_flag: '🇮🇳',
            category: 'Group A',
            group: 'A',
            is_captain: true,
            designation: 'CAPTAIN',
            playing_hand: 'Right Hand',
            world_ranking: 50,
            wins: 45,
            aces: 120,
            matches: 65,
            win_percentage: 75,
            image_url: '/images/players/arjun-mehta.jpg'
          };

          const captain = (t.captain && t.captain.name) ? {
            ...fallbackCaptain,
            ...t.captain,
            category: 'Group A',
            group: 'A',
            is_captain: true,
            designation: 'CAPTAIN'
          } : fallbackCaptain;

          return {
            ...t,
            max_players: 12,
            max_group_a: 4,
            max_group_b: 8,
            captain
          };
        });
        saveStoreToDisk(parsed);
        console.log(`📁 Loaded persistent database store from ${STORE_PATH} (${parsed.players.length} players, ${parsed.teams.length} teams with captains)`);
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
          \`total_purse\` DECIMAL(12,2) NOT NULL DEFAULT 500000.00,
          \`purse_remaining\` DECIMAL(12,2) NOT NULL DEFAULT 500000.00,
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

      // Ensure image_url and logo_url are LONGTEXT so large base64 or long image URLs never fail
      try {
        await conn.query(`ALTER TABLE \`players\` MODIFY COLUMN \`image_url\` LONGTEXT NOT NULL`);
        await conn.query(`ALTER TABLE \`teams\` MODIFY COLUMN \`logo_url\` LONGTEXT NOT NULL`);
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

async function dbSaveTeam(team) {
  const idNum = parseInt(team.id, 10);
  const index = memoryStore.teams.findIndex(t => t.id === idNum);
  if (index !== -1) {
    memoryStore.teams[index] = { ...memoryStore.teams[index], ...team, id: idNum };
  } else {
    memoryStore.teams.push({ ...team, id: idNum });
  }

  saveStoreToDisk(memoryStore);

  if (isUsingMySQL && pool) {
    try {
      await pool.query(`
        INSERT INTO \`teams\` (id, team_number, name, tagline, owner, total_purse, purse_remaining, max_players, logo_url, primary_color, accent_color, glow_color, bg_gradient)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name),
          tagline=VALUES(tagline),
          owner=VALUES(owner),
          total_purse=VALUES(total_purse),
          purse_remaining=VALUES(purse_remaining),
          max_players=VALUES(max_players),
          logo_url=VALUES(logo_url),
          primary_color=VALUES(primary_color),
          accent_color=VALUES(accent_color),
          glow_color=VALUES(glow_color),
          bg_gradient=VALUES(bg_gradient)
      `, [
        idNum,
        team.team_number || idNum,
        team.name,
        team.tagline || '',
        team.owner || 'Owner',
        team.total_purse || 500000.00,
        team.purse_remaining !== undefined ? team.purse_remaining : (team.total_purse || 500000.00),
        team.max_players || 12,
        team.logo_url || '',
        team.primary_color || '#22c55e',
        team.accent_color || '#4ade80',
        team.glow_color || 'rgba(34, 197, 94, 0.45)',
        team.bg_gradient || 'from-emerald-950/40 to-slate-950/80'
      ]);
    } catch (err) {
      console.error('❌ Error updating team in MySQL:', err.message);
    }
  }

  return memoryStore.teams[index !== -1 ? index : memoryStore.teams.length - 1];
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
  dbSaveTeam,
  dbDeletePlayer,
  resetMemoryStore: () => {
    memoryStore = JSON.parse(JSON.stringify(initialSeed));
    saveStoreToDisk(memoryStore);
    return memoryStore;
  }
};
