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
      logo_bg_color: '#000000',
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
      logo_url: '/images/teams/royal-tigers-logo.png',
      logo_bg_color: '#012202',
      primary_color: '#012202',
      accent_color: '#22c55e',
      glow_color: 'rgba(1, 34, 2, 0.45)',
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
      logo_url: '/images/teams/mighty-dragons-logo.png',
      logo_bg_color: '#072f58',
      primary_color: '#072f58',
      accent_color: '#3b82f6',
      glow_color: 'rgba(7, 47, 88, 0.45)',
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
let pgPool = null;
let isUsingMySQL = false;
let isUsingPostgres = false;

// Asynchronously sync store to PostgreSQL in the background
async function syncStoreToPostgres(storeData) {
  if (!isUsingPostgres || !pgPool) return;
  try {
    const data = storeData || memoryStore;
    if (!data) return;

    // Sync auction state
    if (data.auction) {
      await pgPool.query(`
        INSERT INTO auction_state (id, current_player_id, current_bid, highest_bidder_team_id, bid_increment, timer_seconds, timer_running, status, state_json, updated_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
          current_player_id = EXCLUDED.current_player_id,
          current_bid = EXCLUDED.current_bid,
          highest_bidder_team_id = EXCLUDED.highest_bidder_team_id,
          bid_increment = EXCLUDED.bid_increment,
          timer_seconds = EXCLUDED.timer_seconds,
          timer_running = EXCLUDED.timer_running,
          status = EXCLUDED.status,
          state_json = EXCLUDED.state_json,
          updated_at = NOW();
      `, [
        data.auction.current_player_id || null,
        data.auction.current_bid || 0,
        data.auction.highest_bidder_team_id || null,
        data.auction.bid_increment || 2000,
        data.auction.timer_seconds || 15,
        Boolean(data.auction.timer_running),
        data.auction.status || 'paused',
        JSON.stringify(data.auction)
      ]);
    }
  } catch (err) {
    console.error('❌ Error syncing store to PostgreSQL:', err.message);
  }
}

async function initDB() {
  const { DATABASE_URL, PGHOST, DB_HOST, DB_NAME } = process.env;

  // 1. Check for PostgreSQL (Render.com native or external Postgres)
  if (DATABASE_URL || PGHOST) {
    try {
      const { Pool: PgPool } = require('pg');
      pgPool = new PgPool({
        connectionString: DATABASE_URL,
        ssl: DATABASE_URL && !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1')
          ? { rejectUnauthorized: false }
          : false
      });

      const client = await pgPool.connect();
      console.log('✅ Connected to PostgreSQL Database on Render/External!');

      // Create PostgreSQL Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id INT PRIMARY KEY,
          team_number INT UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          tagline VARCHAR(150),
          owner VARCHAR(100) NOT NULL,
          total_purse NUMERIC(12,2) NOT NULL DEFAULT 500000.00,
          purse_remaining NUMERIC(12,2) NOT NULL DEFAULT 500000.00,
          max_players INT NOT NULL DEFAULT 12,
          max_group_a INT NOT NULL DEFAULT 4,
          max_group_b INT NOT NULL DEFAULT 8,
          logo_url TEXT,
          logo_bg_color VARCHAR(30) DEFAULT '#000000',
          primary_color VARCHAR(30) NOT NULL DEFAULT '#22c55e',
          accent_color VARCHAR(30) NOT NULL DEFAULT '#4ade80',
          glow_color VARCHAR(50) NOT NULL DEFAULT 'rgba(34, 197, 94, 0.45)',
          bg_gradient VARCHAR(100) NOT NULL DEFAULT 'from-emerald-950/40 to-slate-950/80',
          captain JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS players (
          id INT PRIMARY KEY,
          player_number VARCHAR(40) UNIQUE NOT NULL,
          name VARCHAR(120) NOT NULL,
          age INT NOT NULL DEFAULT 22,
          country VARCHAR(60) NOT NULL DEFAULT 'India',
          country_flag VARCHAR(20) NOT NULL DEFAULT '🇮🇳',
          category VARCHAR(40) NOT NULL DEFAULT 'Group A',
          "group" VARCHAR(10) NOT NULL DEFAULT 'A',
          playing_hand VARCHAR(40) NOT NULL DEFAULT 'Right Hand',
          backhand_style VARCHAR(40),
          jersey_name VARCHAR(60),
          jersey_number VARCHAR(30),
          world_ranking INT NOT NULL DEFAULT 150,
          wins INT NOT NULL DEFAULT 0,
          aces INT NOT NULL DEFAULT 0,
          matches INT NOT NULL DEFAULT 0,
          win_percentage INT NOT NULL DEFAULT 0,
          base_price NUMERIC(12,2) NOT NULL DEFAULT 10000.00,
          image_url TEXT,
          status VARCHAR(30) NOT NULL DEFAULT 'upcoming',
          display_order INT NOT NULL DEFAULT 0,
          is_captain BOOLEAN DEFAULT FALSE,
          designation VARCHAR(40),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role VARCHAR(30) NOT NULL,
          team_id INT
        );

        CREATE TABLE IF NOT EXISTS sponsors (
          id SERIAL PRIMARY KEY,
          category VARCHAR(60) NOT NULL,
          name VARCHAR(100) NOT NULL,
          logo_icon VARCHAR(100),
          website VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS team_players (
          id SERIAL PRIMARY KEY,
          team_id INT NOT NULL,
          player_id INT NOT NULL,
          purchase_price NUMERIC(12,2) NOT NULL,
          acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bids (
          id SERIAL PRIMARY KEY,
          auction_id INT,
          player_id INT NOT NULL,
          team_id INT NOT NULL,
          amount NUMERIC(12,2) NOT NULL,
          is_winning BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS auction_state (
          id INT PRIMARY KEY DEFAULT 1,
          current_player_id INT,
          current_bid NUMERIC(12,2) DEFAULT 0,
          highest_bidder_team_id INT,
          bid_increment NUMERIC(12,2) DEFAULT 2000,
          timer_seconds INT DEFAULT 15,
          timer_running BOOLEAN DEFAULT FALSE,
          status VARCHAR(30) DEFAULT 'paused',
          state_json JSONB,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if players table in Postgres already has rows
      const countRes = await client.query('SELECT count(*) FROM players');
      const playerCount = parseInt(countRes.rows[0].count, 10);

      if (playerCount > 0) {
        // Load data from Postgres into memory
        const plRes = await client.query('SELECT * FROM players ORDER BY display_order ASC, id ASC');
        const tmRes = await client.query('SELECT * FROM teams ORDER BY team_number ASC, id ASC');
        const tpRes = await client.query('SELECT * FROM team_players ORDER BY id ASC');
        const bdRes = await client.query('SELECT * FROM bids ORDER BY id ASC');
        const spRes = await client.query('SELECT * FROM sponsors ORDER BY id ASC');
        const usRes = await client.query('SELECT * FROM users ORDER BY id ASC');
        const auRes = await client.query('SELECT * FROM auction_state WHERE id = 1');

        memoryStore.players = plRes.rows.map(r => ({
          ...r,
          id: Number(r.id),
          age: Number(r.age),
          base_price: Number(r.base_price),
          display_order: Number(r.display_order || r.id)
        }));

        memoryStore.teams = tmRes.rows.map(r => ({
          ...r,
          id: Number(r.id),
          team_number: Number(r.team_number),
          total_purse: Number(r.total_purse),
          purse_remaining: Number(r.purse_remaining),
          max_players: Number(r.max_players || 12),
          max_group_a: Number(r.max_group_a || 4),
          max_group_b: Number(r.max_group_b || 8)
        }));

        if (tpRes.rows.length > 0) {
          memoryStore.team_players = tpRes.rows.map(r => ({
            ...r,
            id: Number(r.id),
            team_id: Number(r.team_id),
            player_id: Number(r.player_id),
            purchase_price: Number(r.purchase_price)
          }));
        }

        if (bdRes.rows.length > 0) {
          memoryStore.bids = bdRes.rows.map(r => ({
            ...r,
            id: Number(r.id),
            player_id: Number(r.player_id),
            team_id: Number(r.team_id),
            amount: Number(r.amount)
          }));
        }

        if (auRes.rows.length > 0 && auRes.rows[0].state_json) {
          memoryStore.auction = auRes.rows[0].state_json;
        }

        saveStoreToDisk(memoryStore);
        console.log(`📥 Hydrated ${memoryStore.players.length} players and ${memoryStore.teams.length} teams from PostgreSQL database.`);
      } else {
        // Seed PostgreSQL with current JSON store (Zero data loss!)
        console.log('🌱 Empty PostgreSQL database detected. Seeding from current store.json...');

        for (const t of memoryStore.teams) {
          await client.query(`
            INSERT INTO teams (id, team_number, name, tagline, owner, total_purse, purse_remaining, max_players, max_group_a, max_group_b, logo_url, logo_bg_color, primary_color, accent_color, glow_color, bg_gradient, captain)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE SET
              name=EXCLUDED.name, total_purse=EXCLUDED.total_purse, purse_remaining=EXCLUDED.purse_remaining, logo_url=EXCLUDED.logo_url, logo_bg_color=EXCLUDED.logo_bg_color;
          `, [
            t.id, t.team_number || t.id, t.name, t.tagline || '', t.owner || 'Owner',
            t.total_purse || 500000, t.purse_remaining || 500000, t.max_players || 12,
            t.max_group_a || 4, t.max_group_b || 8, t.logo_url || '', t.logo_bg_color || '#000000',
            t.primary_color || '#22c55e', t.accent_color || '#4ade80', t.glow_color || 'rgba(34, 197, 94, 0.45)',
            t.bg_gradient || 'from-emerald-950/40 to-slate-950/80', JSON.stringify(t.captain || {})
          ]);
        }

        for (const p of memoryStore.players) {
          await client.query(`
            INSERT INTO players (id, player_number, name, age, country, country_flag, category, "group", playing_hand, backhand_style, jersey_name, jersey_number, world_ranking, wins, aces, matches, win_percentage, base_price, image_url, status, display_order, is_captain, designation)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            ON CONFLICT (id) DO UPDATE SET
              name=EXCLUDED.name, base_price=EXCLUDED.base_price, image_url=EXCLUDED.image_url, category=EXCLUDED.category, "group"=EXCLUDED."group";
          `, [
            p.id, p.player_number, p.name, p.age || 22, p.country || 'India', p.country_flag || '🇮🇳',
            p.category || 'Group A', p.group || 'A', p.playing_hand || 'Right Hand', p.backhand_style || '',
            p.jersey_name || '', p.jersey_number || '', p.world_ranking || 150, p.wins || 0,
            p.aces || 0, p.matches || 0, p.win_percentage || 0, p.base_price || 10000,
            p.image_url || '', p.status || 'upcoming', p.display_order || p.id,
            Boolean(p.is_captain), p.designation || ''
          ]);
        }

        if (memoryStore.users) {
          for (const u of memoryStore.users) {
            await client.query(`
              INSERT INTO users (id, username, password_hash, full_name, role, team_id)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (username) DO NOTHING;
            `, [u.id, u.username, u.password_hash, u.full_name, u.role, u.team_id]);
          }
        }

        if (memoryStore.sponsors) {
          for (const s of memoryStore.sponsors) {
            await client.query(`
              INSERT INTO sponsors (id, category, name, logo_icon, website)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (id) DO NOTHING;
            `, [s.id, s.category, s.name, s.logo_icon, s.website]);
          }
        }

        console.log(`✅ Successfully seeded PostgreSQL database with ${memoryStore.players.length} players & ${memoryStore.teams.length} teams from store.json!`);
      }

      client.release();
      isUsingPostgres = true;
    } catch (err) {
      console.warn('⚠️ Could not connect to PostgreSQL database (' + err.message + '). Falling back to persistent disk store.');
      isUsingPostgres = false;
    }
  }

  // 2. Optional MySQL fallback if configured
  if (!isUsingPostgres && DB_HOST && DB_NAME) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: DB_NAME,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      const conn = await pool.getConnection();
      console.log('✅ Connected to MySQL Database:', DB_NAME);
      conn.release();
      isUsingMySQL = true;
    } catch (err) {
      console.warn('⚠️ Could not connect to MySQL server (' + err.message + '). Using persistent file-backed database store.');
      isUsingMySQL = false;
    }
  }

  if (!isUsingPostgres && !isUsingMySQL) {
    console.log('ℹ️ Operating in High-Speed Persistent File-Backed Database Mode (backend/data/store.json).');
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

  // 3. Persist to PostgreSQL if active
  if (isUsingPostgres && pgPool) {
    try {
      await pgPool.query(`
        INSERT INTO players (id, player_number, name, age, country, country_flag, category, "group", playing_hand, backhand_style, jersey_name, jersey_number, world_ranking, wins, aces, matches, win_percentage, base_price, image_url, status, display_order, is_captain, designation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, player_number=EXCLUDED.player_number, age=EXCLUDED.age,
          country=EXCLUDED.country, country_flag=EXCLUDED.country_flag, category=EXCLUDED.category,
          "group"=EXCLUDED."group", playing_hand=EXCLUDED.playing_hand, backhand_style=EXCLUDED.backhand_style,
          jersey_name=EXCLUDED.jersey_name, jersey_number=EXCLUDED.jersey_number, world_ranking=EXCLUDED.world_ranking,
          wins=EXCLUDED.wins, aces=EXCLUDED.aces, matches=EXCLUDED.matches, win_percentage=EXCLUDED.win_percentage,
          base_price=EXCLUDED.base_price, image_url=EXCLUDED.image_url, status=EXCLUDED.status,
          display_order=EXCLUDED.display_order, is_captain=EXCLUDED.is_captain, designation=EXCLUDED.designation,
          updated_at=NOW();
      `, [
        player.id, player.player_number, player.name, player.age || 22, player.country || 'India', player.country_flag || '🇮🇳',
        player.category || (player.group === 'B' ? 'Group B' : 'Group A'), player.group === 'B' ? 'B' : 'A',
        player.playing_hand || 'Right Hand', player.backhand_style || '', player.jersey_name || '', player.jersey_number || '',
        player.world_ranking || 150, player.wins || 0, player.aces || 0, player.matches || 0, player.win_percentage || 0,
        player.base_price || 10000, player.image_url !== undefined ? player.image_url : '', player.status || 'upcoming',
        player.display_order || player.id, Boolean(player.is_captain), player.designation || ''
      ]);
    } catch (err) {
      console.error('❌ Error updating player in PostgreSQL:', err.message);
    }
  }

  // 4. Persist to MySQL if active
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

  // Persist to PostgreSQL if active
  if (isUsingPostgres && pgPool) {
    try {
      await pgPool.query(`
        INSERT INTO teams (id, team_number, name, tagline, owner, total_purse, purse_remaining, max_players, max_group_a, max_group_b, logo_url, logo_bg_color, primary_color, accent_color, glow_color, bg_gradient, captain)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, tagline=EXCLUDED.tagline, owner=EXCLUDED.owner, total_purse=EXCLUDED.total_purse,
          purse_remaining=EXCLUDED.purse_remaining, max_players=EXCLUDED.max_players,
          max_group_a=EXCLUDED.max_group_a, max_group_b=EXCLUDED.max_group_b,
          logo_url=EXCLUDED.logo_url, logo_bg_color=EXCLUDED.logo_bg_color,
          primary_color=EXCLUDED.primary_color, accent_color=EXCLUDED.accent_color,
          glow_color=EXCLUDED.glow_color, bg_gradient=EXCLUDED.bg_gradient, captain=EXCLUDED.captain,
          updated_at=NOW();
      `, [
        idNum, team.team_number || idNum, team.name, team.tagline || '', team.owner || 'Owner',
        team.total_purse || 500000.00, team.purse_remaining !== undefined ? team.purse_remaining : (team.total_purse || 500000.00),
        team.max_players || 12, team.max_group_a || 4, team.max_group_b || 8, team.logo_url || '',
        team.logo_bg_color || '#000000', team.primary_color || '#22c55e', team.accent_color || '#4ade80',
        team.glow_color || 'rgba(34, 197, 94, 0.45)', team.bg_gradient || 'from-emerald-950/40 to-slate-950/80',
        JSON.stringify(team.captain || {})
      ]);
    } catch (err) {
      console.error('❌ Error updating team in PostgreSQL:', err.message);
    }
  }

  // Persist to MySQL if active
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

  // PostgreSQL deletion
  if (isUsingPostgres && pgPool) {
    try {
      await pgPool.query('DELETE FROM team_players WHERE player_id = $1', [idNum]);
      await pgPool.query('DELETE FROM bids WHERE player_id = $1', [idNum]);
      await pgPool.query('DELETE FROM players WHERE id = $1', [idNum]);
    } catch (err) {
      console.error('❌ Error deleting player from PostgreSQL:', err.message);
    }
  }

  // MySQL deletion
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
  getPgPool: () => pgPool,
  isUsingMySQL: () => isUsingMySQL,
  isUsingPostgres: () => isUsingPostgres,
  getMemoryStore: () => memoryStore,
  saveStore: () => {
    saveStoreToDisk(memoryStore);
    syncStoreToPostgres(memoryStore);
  },
  dbSavePlayer,
  dbSaveTeam,
  dbDeletePlayer,
  resetMemoryStore: async () => {
    memoryStore = JSON.parse(JSON.stringify(initialSeed));
    saveStoreToDisk(memoryStore);

    if (isUsingPostgres && pgPool) {
      try {
        await pgPool.query('DELETE FROM team_players');
        await pgPool.query('DELETE FROM bids');
        await pgPool.query('UPDATE players SET status = \'upcoming\'');
        syncStoreToPostgres(memoryStore);
      } catch (err) {
        console.error('❌ Error resetting PostgreSQL store:', err.message);
      }
    }

    return memoryStore;
  }
};
