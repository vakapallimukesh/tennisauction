const db = require('../config/db');
const { broadcastAuctionState, emitEvent } = require('../socket/auctionSocket');

// Get all players (with optional status filter)
exports.getPlayers = async (req, res) => {
  try {
    const { status } = req.query;
    const store = db.getMemoryStore();
    let players = [...store.players];

    if (status && status !== 'all') {
      players = players.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    // Attach purchase info for sold players
    const enriched = players.map(p => {
      const soldRecord = store.team_players.find(tp => tp.player_id === p.id);
      if (soldRecord) {
        const team = store.teams.find(t => t.id === soldRecord.team_id);
        return {
          ...p,
          purchase_price: soldRecord.purchase_price,
          sold_to_team: team ? {
            id: team.id,
            name: team.name,
            logo_url: team.logo_url,
            primary_color: team.primary_color
          } : null
        };
      }
      return p;
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single player by ID
exports.getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const player = store.players.find(p => p.id === parseInt(id, 10));

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const soldRecord = store.team_players.find(tp => tp.player_id === player.id);
    const team = soldRecord ? store.teams.find(t => t.id === soldRecord.team_id) : null;

    res.json({
      success: true,
      data: {
        ...player,
        purchase_price: soldRecord ? soldRecord.purchase_price : null,
        sold_to_team: team || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create player (Admin)
exports.createPlayer = async (req, res) => {
  try {
    const store = db.getMemoryStore();
    const newId = store.players.length > 0 ? Math.max(...store.players.map(p => p.id)) + 1 : 1;
    const count = store.players.length + 1;
    const playerNumber = req.body.player_number || `PLAYER #${count < 10 ? '0' + count : count}`;

    const newPlayer = {
      id: newId,
      player_number: playerNumber,
      name: req.body.name || 'New Player',
      age: parseInt(req.body.age, 10) || 22,
      country: req.body.country || 'India',
      country_flag: req.body.country_flag || '🇮🇳',
      category: req.body.category || 'Singles',
      playing_hand: req.body.playing_hand || 'Right Hand',
      world_ranking: parseInt(req.body.world_ranking, 10) || 150,
      wins: parseInt(req.body.wins, 10) || 25,
      aces: parseInt(req.body.aces, 10) || 50,
      matches: parseInt(req.body.matches, 10) || 35,
      win_percentage: parseInt(req.body.win_percentage, 10) || 70,
      base_price: parseFloat(req.body.base_price) || 10000,
      image_url: req.body.image_url || '/images/players/rohan-iyer.jpg',
      status: req.body.status || 'upcoming',
      display_order: newId
    };

    store.players.push(newPlayer);

    emitEvent('player_updated', { action: 'create', player: newPlayer });
    broadcastAuctionState();

    res.status(201).json({ success: true, message: 'Player added successfully', data: newPlayer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update player (Admin)
exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const index = store.players.findIndex(p => p.id === parseInt(id, 10));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const updated = {
      ...store.players[index],
      ...req.body,
      id: parseInt(id, 10)
    };

    if (req.body.age !== undefined) updated.age = parseInt(req.body.age, 10);
    if (req.body.world_ranking !== undefined) updated.world_ranking = parseInt(req.body.world_ranking, 10);
    if (req.body.wins !== undefined) updated.wins = parseInt(req.body.wins, 10);
    if (req.body.aces !== undefined) updated.aces = parseInt(req.body.aces, 10);
    if (req.body.matches !== undefined) updated.matches = parseInt(req.body.matches, 10);
    if (req.body.win_percentage !== undefined) updated.win_percentage = parseInt(req.body.win_percentage, 10);
    if (req.body.base_price !== undefined) updated.base_price = parseFloat(req.body.base_price);

    store.players[index] = updated;

    emitEvent('player_updated', { action: 'update', player: updated });
    broadcastAuctionState();

    res.json({ success: true, message: 'Player updated successfully', data: store.players[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete player (Admin)
exports.deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const index = store.players.findIndex(p => p.id === parseInt(id, 10));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const removed = store.players.splice(index, 1)[0];

    emitEvent('player_updated', { action: 'delete', playerId: removed.id });
    broadcastAuctionState();

    res.json({ success: true, message: 'Player deleted', data: removed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
