const db = require('../config/db');
const auctionSocket = require('../socket/auctionSocket');

// Get all teams with calculated stats including fixed captain
exports.getTeams = async (req, res) => {
  try {
    const store = db.getMemoryStore();

    const teams = store.teams.map(team => {
      const teamPlayers = store.team_players.filter(tp => tp.team_id === team.id);
      let groupACount = 1; // 1 for the fixed captain in Group A
      let groupBCount = 0;
      teamPlayers.forEach(tp => {
        const p = store.players.find(pl => pl.id === tp.player_id);
        const cat = p ? (p.category || 'Group A') : 'Group A';
        const isGroupB = (p && p.group === 'B') || cat.toLowerCase().includes('group b');
        if (isGroupB) {
          groupBCount++;
        } else {
          groupACount++;
        }
      });
      const maxPlayers = team.max_players || 10;
      const maxGroupA = team.max_group_a || 4;
      const maxGroupB = team.max_group_b || 8;
      const totalPlayersCount = 1 + teamPlayers.length;

      return {
        ...team,
        max_players: maxPlayers,
        max_group_a: maxGroupA,
        max_group_b: maxGroupB,
        players_bought: totalPlayersCount,
        group_a_count: groupACount,
        group_b_count: groupBCount,
        is_squad_full: totalPlayersCount >= maxPlayers
      };
    });

    res.json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single team with full roster and purchased players (including Captain)
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const team = store.teams.find(t => t.id === parseInt(id, 10));

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const teamPlayerRecords = store.team_players.filter(tp => tp.team_id === team.id);

    let groupACount = 1; // 1 for the fixed captain in Group A
    let groupBCount = 0;
    const purchasedPlayers = teamPlayerRecords.map(tp => {
      const player = store.players.find(p => p.id === tp.player_id);
      if (player) {
        const cat = player.category || 'Group A';
        const isGroupB = player.group === 'B' || cat.toLowerCase().includes('group b');
        if (isGroupB) {
          groupBCount++;
        } else {
          groupACount++;
        }
      }
      return {
        ...player,
        purchase_price: tp.purchase_price,
        purchased_at: tp.purchased_at
      };
    }).filter(p => !!p.name);

    const captain = team.captain || {
      id: 100 + team.id,
      name: `Captain ${team.name}`,
      player_number: `CAPTAIN #0${team.id}`,
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

    const fullRoster = [
      {
        ...captain,
        is_captain: true,
        designation: 'CAPTAIN',
        category: 'Group A',
        group: 'A',
        purchase_price: 0,
        purchased_at: null
      },
      ...purchasedPlayers
    ];

    const maxPlayers = team.max_players || 10;
    const maxGroupA = team.max_group_a || 4;
    const maxGroupB = team.max_group_b || 8;
    const totalPlayersCount = 1 + purchasedPlayers.length;

    res.json({
      success: true,
      data: {
        ...team,
        max_players: maxPlayers,
        max_group_a: maxGroupA,
        max_group_b: maxGroupB,
        captain,
        players_bought: totalPlayersCount,
        group_a_count: groupACount,
        group_b_count: groupBCount,
        is_squad_full: totalPlayersCount >= maxPlayers,
        purchased_players: fullRoster,
        roster: fullRoster
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Captain Details (Name, Photo, Stats)
exports.updateCaptain = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const team = store.teams.find(t => t.id === parseInt(id, 10));

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const currentCaptain = team.captain || {};
    const updatedCaptain = {
      ...currentCaptain,
      ...req.body,
      id: currentCaptain.id || 100 + team.id,
      is_captain: true,
      designation: 'CAPTAIN',
      category: 'Group A',
      group: 'A'
    };

    team.captain = updatedCaptain;
    db.saveStore();

    if (auctionSocket && typeof auctionSocket.broadcastAuctionState === 'function') {
      auctionSocket.broadcastAuctionState();
    }

    res.json({
      success: true,
      message: 'Captain updated successfully',
      data: {
        team_id: team.id,
        captain: updatedCaptain
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update team (e.g. adjust name, logo, short_name, owner, tagline)
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const index = store.teams.findIndex(t => t.id === parseInt(id, 10));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const updatedTeam = {
      ...store.teams[index],
      ...req.body,
      id: parseInt(id, 10)
    };

    if (req.body.name) {
      updatedTeam.name = req.body.name.trim();
      if (!req.body.short_name) {
        updatedTeam.short_name = req.body.name.trim().toUpperCase();
      }
    }
    if (req.body.short_name) {
      updatedTeam.short_name = req.body.short_name.trim().toUpperCase();
    }
    if (req.body.owner) {
      updatedTeam.owner = req.body.owner.trim();
    }
    if (req.body.logo_url !== undefined) {
      updatedTeam.logo_url = typeof req.body.logo_url === 'string' ? req.body.logo_url.trim() : '';
    }

    await db.dbSaveTeam(updatedTeam);

    if (auctionSocket && typeof auctionSocket.broadcastAuctionState === 'function') {
      auctionSocket.broadcastAuctionState();
    }

    res.json({ success: true, message: 'Team updated successfully in database', data: updatedTeam });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
