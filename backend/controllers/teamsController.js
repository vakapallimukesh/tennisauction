const db = require('../config/db');

// Get all teams with calculated stats
exports.getTeams = async (req, res) => {
  try {
    const store = db.getMemoryStore();

    const teams = store.teams.map(team => {
      const teamPlayers = store.team_players.filter(tp => tp.team_id === team.id);
      let groupACount = 0;
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
      const maxGroupA = team.max_group_a || 3;
      const maxGroupB = team.max_group_b || 7;

      return {
        ...team,
        max_players: maxPlayers,
        max_group_a: maxGroupA,
        max_group_b: maxGroupB,
        players_bought: teamPlayers.length,
        group_a_count: groupACount,
        group_b_count: groupBCount,
        is_squad_full: teamPlayers.length >= maxPlayers
      };
    });

    res.json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single team with full roster and purchased players
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const team = store.teams.find(t => t.id === parseInt(id, 10));

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const teamPlayerRecords = store.team_players.filter(tp => tp.team_id === team.id);

    let groupACount = 0;
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

    const maxPlayers = team.max_players || 10;
    const maxGroupA = team.max_group_a || 3;
    const maxGroupB = team.max_group_b || 7;

    res.json({
      success: true,
      data: {
        ...team,
        max_players: maxPlayers,
        max_group_a: maxGroupA,
        max_group_b: maxGroupB,
        players_bought: purchasedPlayers.length,
        group_a_count: groupACount,
        group_b_count: groupBCount,
        is_squad_full: purchasedPlayers.length >= maxPlayers,
        purchased_players: purchasedPlayers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update team (e.g. adjust purse or owner)
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getMemoryStore();
    const index = store.teams.findIndex(t => t.id === parseInt(id, 10));

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    store.teams[index] = {
      ...store.teams[index],
      ...req.body,
      id: parseInt(id, 10)
    };

    db.saveStore();

    res.json({ success: true, message: 'Team updated successfully', data: store.teams[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
