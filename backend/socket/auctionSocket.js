const { Server } = require('socket.io');
const db = require('../config/db');

let io = null;
let timerInterval = null;

// Calculate full auction state snapshot
function getFullAuctionSnapshot() {
  const store = db.getMemoryStore();
  const auction = store.auction || {};

  // Resolve current player (only if currently on auction block and live)
  const currentPlayer = (auction.current_player_id && store.players.find(p => p.id === auction.current_player_id && p.status === 'live')) || null;

  // Calculate teams with purse remaining and squad roster
  const teams = (store.teams || []).map(t => {
    const bought = (store.team_players || []).filter(tp => tp.team_id === t.id);
    const totalSpent = bought.reduce((sum, item) => sum + (parseFloat(item.purchase_price) || 0), 0);
    const playersBoughtList = bought.map(b => {
      const p = store.players.find(pl => pl.id === b.player_id);
      return {
        ...b,
        name: p ? p.name : 'Unknown Player',
        player_name: p ? p.name : 'Unknown Player',
        player_number: p ? p.player_number : '',
        category: p ? (p.category || 'Group A') : 'Group A',
        world_ranking: p ? p.world_ranking : 0,
        image_url: p ? p.image_url : null,
        matches: p ? p.matches : 0,
        win_percentage: p ? p.win_percentage : 0,
        aces: p ? p.aces : 0
      };
    });

    const remaining = Math.max(0, (parseFloat(t.total_purse) || 100000) - totalSpent);

    return {
      ...t,
      players_bought: bought.length,
      total_spent: totalSpent,
      purse_remaining: remaining,
      roster: playersBoughtList
    };
  });

  // Highest bidder team
  const highestTeam = auction.highest_bidder_team_id
    ? teams.find(t => t.id === auction.highest_bidder_team_id)
    : null;

  // Recent bids for current player
  const recentBids = (store.bids || [])
    .filter(b => b.player_id === auction.current_player_id)
    .slice(-20)
    .reverse()
    .map(b => {
      const team = teams.find(t => t.id === b.team_id);
      return {
        ...b,
        team_name: team ? team.name : `Team ${b.team_id}`,
        team_logo: team ? team.logo_url : null,
        primary_color: team ? team.primary_color : '#22c55e'
      };
    });

  const upcomingPlayers = (store.players || []).filter(p => p.status === 'upcoming');
  const soldPlayers = (store.players || []).filter(p => p.status === 'sold').map(p => {
    const soldRecord = (store.team_players || []).find(tp => tp.player_id === p.id);
    const team = soldRecord ? teams.find(t => t.id === soldRecord.team_id) : (p.sold_to_team_id ? teams.find(t => t.id === p.sold_to_team_id) : null);
    const price = soldRecord ? soldRecord.purchase_price : (p.sold_price || p.purchase_price || p.base_price);
    return {
      ...p,
      sold_price: price,
      purchase_price: price,
      sold_to_team: team ? {
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        primary_color: team.primary_color
      } : null
    };
  });
  const unsoldPlayers = (store.players || []).filter(p => p.status === 'unsold');

  return {
    auction: {
      ...auction,
      current_player: currentPlayer,
      highest_bidder_team: highestTeam
    },
    current_player: currentPlayer,
    highest_bidder_team: highestTeam,
    recent_bids: recentBids,
    teams,
    upcoming_players: upcomingPlayers,
    sold_players: soldPlayers,
    unsold_players: unsoldPlayers,
    sponsors: store.sponsors || [],
    timestamp: new Date().toISOString()
  };
}

function broadcastAuctionState() {
  if (!io) return;
  const snapshot = getFullAuctionSnapshot();
  io.emit('auction_state_updated', snapshot);
  io.emit('auction_state', snapshot);
  io.emit('digital_display_updated', snapshot);
}

function emitEvent(eventName, data) {
  if (!io) return;
  io.emit(eventName, data);
}

// Authoritative Server Timer
function startServerTimer() {
  const store = db.getMemoryStore();
  const auction = store.auction;
  if (!auction) return;

  auction.timer_running = true;
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!auction.timer_running) {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }

    if (auction.timer_remaining > 0) {
      auction.timer_remaining -= 1;
      emitEvent('timer_updated', {
        timer_remaining: auction.timer_remaining,
        timer_running: auction.timer_running,
        timer_seconds: auction.timer_seconds,
        status: auction.status,
        current_bid: auction.current_bid,
        highest_bidder_team_id: auction.highest_bidder_team_id
      });
    }

    if (auction.timer_remaining <= 0) {
      auction.timer_remaining = 0;
      auction.timer_running = false;
      clearInterval(timerInterval);
      timerInterval = null;

      emitEvent('timer_expired', {
        player_id: auction.current_player_id,
        current_bid: auction.current_bid,
        highest_bidder_team_id: auction.highest_bidder_team_id
      });

      broadcastAuctionState();
    }
  }, 1000);

  emitEvent('auction_started', {
    timer_remaining: auction.timer_remaining,
    timer_seconds: auction.timer_seconds,
    timer_running: true
  });
  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: true,
    timer_seconds: auction.timer_seconds
  });
}

function pauseServerTimer() {
  const store = db.getMemoryStore();
  const auction = store.auction;
  if (!auction) return;

  auction.timer_running = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  emitEvent('auction_paused', {
    timer_remaining: auction.timer_remaining,
    timer_running: false
  });
  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: false,
    timer_seconds: auction.timer_seconds
  });
}

function resumeServerTimer() {
  const store = db.getMemoryStore();
  const auction = store.auction;
  if (!auction) return;

  auction.timer_running = true;
  startServerTimer();

  emitEvent('auction_resumed', {
    timer_remaining: auction.timer_remaining,
    timer_running: true
  });
}

function resetServerTimer(seconds = null) {
  const store = db.getMemoryStore();
  const auction = store.auction;
  if (!auction) return;

  const targetSec = seconds !== null ? parseInt(seconds, 10) : (auction.timer_seconds || 15);
  auction.timer_remaining = targetSec;
  auction.timer_seconds = targetSec;

  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: auction.timer_running,
    timer_seconds: auction.timer_seconds
  });
}

function adjustServerTimer(deltaSeconds) {
  const store = db.getMemoryStore();
  const auction = store.auction;
  if (!auction) return;

  auction.timer_remaining = Math.max(0, (auction.timer_remaining || 0) + deltaSeconds);

  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: auction.timer_running,
    timer_seconds: auction.timer_seconds
  });
}

// Bidding Engine (Core Logic with Self-Bidding Prevention)
function submitBid({ team_id, amount, increment }) {
  const store = db.getMemoryStore();
  const auction = store.auction;

  if (auction.status !== 'live') {
    throw new Error('Auction is not currently LIVE.');
  }

  if (!auction.current_player_id) {
    throw new Error('No player is currently on the auction stage.');
  }

  const team = store.teams.find(t => t.id === parseInt(team_id, 10));
  if (!team) {
    throw new Error('Invalid team identification.');
  }

  // Check Self-Bidding Rule
  if (auction.highest_bidder_team_id === team.id) {
    throw new Error('Your team is already the highest bidder! You cannot bid against yourself.');
  }

  // Check squad limit (max 5)
  const boughtCount = store.team_players.filter(tp => tp.team_id === team.id).length;
  if (boughtCount >= team.max_players) {
    throw new Error(`${team.name} has already filled all ${team.max_players} squad positions.`);
  }

  // Check if bidding has already started for this player
  const isBiddingStarted = Boolean(auction.highest_bidder_team_id);
  const currentPlayer = store.players.find(p => p.id === auction.current_player_id);
  const playerBasePrice = parseFloat(currentPlayer?.base_price || 10000);

  let bidAmount;

  if (!isBiddingStarted) {
    // 1. FIRST START ACTION: Allow starting at exact base price (or higher if specified)
    if (amount) {
      bidAmount = parseFloat(amount);
    } else {
      bidAmount = playerBasePrice;
    }

    // Validation for START BID: Must be at least the base price
    if (bidAmount < playerBasePrice) {
      throw new Error(`Opening bid of ₹${bidAmount.toLocaleString('en-IN')} cannot be lower than the base price of ₹${playerBasePrice.toLocaleString('en-IN')}.`);
    }
  } else {
    // 2. SUBSEQUENT RAISE ACTIONS: Must be strictly greater than current bid
    if (amount) {
      bidAmount = parseFloat(amount);
    } else {
      const inc = increment ? parseFloat(increment) : (auction.bid_increment || 2000);
      bidAmount = auction.current_bid + inc;
    }

    // Validation for RAISE BID: Must be strictly higher than current_bid
    if (bidAmount <= auction.current_bid) {
      throw new Error(`Bid of ₹${bidAmount.toLocaleString('en-IN')} must be higher than the current bid of ₹${auction.current_bid.toLocaleString('en-IN')}.`);
    }
  }

  // Calculate actual purse remaining
  const totalSpent = store.team_players
    .filter(tp => tp.team_id === team.id)
    .reduce((sum, item) => sum + parseFloat(item.purchase_price), 0);
  const remainingPurse = Math.max(0, parseFloat(team.total_purse) - totalSpent);

  if (bidAmount > remainingPurse) {
    throw new Error(`Insufficient purse! ${team.name} has ₹${remainingPurse.toLocaleString('en-IN')} remaining, but bid is ₹${bidAmount.toLocaleString('en-IN')}.`);
  }

  // Update auction state
  auction.current_bid = bidAmount;
  auction.highest_bidder_team_id = team.id;
  auction.timer_remaining = auction.timer_seconds || 15; // Reset countdown timer to 15s on new bid
  auction.timer_running = true;

  // Restart timer if it was paused
  startServerTimer();

  // Record bid
  const newBid = {
    id: store.bids.length + 1,
    auction_id: auction.id,
    player_id: auction.current_player_id,
    team_id: team.id,
    amount: bidAmount,
    bid_time: new Date()
  };
  store.bids.push(newBid);

  // Broadcast events across all clients in real time
  const bidPayload = {
    current_bid: auction.current_bid,
    highest_bidder_team_id: team.id,
    highest_bidder_name: team.name,
    timer_remaining: auction.timer_remaining,
    bid: {
      ...newBid,
      team_name: team.name,
      team_logo: team.logo_url,
      primary_color: team.primary_color
    }
  };

  emitEvent('bid_placed', bidPayload);
  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: true,
    timer_seconds: auction.timer_seconds,
    current_bid: auction.current_bid,
    highest_bidder_team_id: team.id
  });

  broadcastAuctionState();

  return bidPayload;
}

// Mark Player Sold
function markPlayerSold(winning_team_id = null, final_price = null) {
  const store = db.getMemoryStore();
  const auction = store.auction;

  if (!auction.current_player_id) {
    throw new Error('No active player to mark as sold.');
  }

  const teamId = winning_team_id ? parseInt(winning_team_id, 10) : auction.highest_bidder_team_id;
  if (!teamId) {
    throw new Error('No winning bidder identified for this round.');
  }

  const team = store.teams.find(t => t.id === teamId);
  if (!team) throw new Error('Winning team not found.');

  const player = store.players.find(p => p.id === auction.current_player_id);
  if (!player) throw new Error('Player not found.');

  const price = final_price ? parseFloat(final_price) : auction.current_bid;

  // Deduct purse and assign player
  team.purse_remaining = Math.max(0, team.purse_remaining - price);

  store.team_players.push({
    id: store.team_players.length + 1,
    team_id: team.id,
    player_id: player.id,
    purchase_price: price,
    purchased_at: new Date()
  });

  player.status = 'sold';
  auction.timer_running = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Prepare celebration data
  const celebrationData = {
    player: { ...player },
    team: { ...team },
    amount: price,
    timestamp: new Date().toISOString()
  };

  emitEvent('player_sold', celebrationData);

  // Auto select next upcoming player if available
  const nextP = store.players.find(p => p.status === 'upcoming');
  if (nextP) {
    nextP.status = 'live';
    auction.current_player_id = nextP.id;
    auction.current_bid = nextP.base_price;
    auction.highest_bidder_team_id = null;
    auction.timer_remaining = 15;
    auction.status = 'live';

    emitEvent('player_selected', { player: nextP });
  } else {
    auction.current_player_id = null;
    auction.status = 'completed';
    emitEvent('auction_ended', {});
  }

  broadcastAuctionState();

  return celebrationData;
}

// Mark Player Unsold
function markPlayerUnsold() {
  const store = db.getMemoryStore();
  const auction = store.auction;

  if (!auction.current_player_id) {
    throw new Error('No active player to pass.');
  }

  const player = store.players.find(p => p.id === auction.current_player_id);
  if (player) {
    player.status = 'unsold';
  }

  auction.timer_running = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const unsoldData = {
    player: { ...player },
    timestamp: new Date().toISOString()
  };

  emitEvent('player_unsold', unsoldData);

  const nextP = store.players.find(p => p.status === 'upcoming');
  if (nextP) {
    nextP.status = 'live';
    auction.current_player_id = nextP.id;
    auction.current_bid = nextP.base_price;
    auction.highest_bidder_team_id = null;
    auction.timer_remaining = 15;
    auction.status = 'live';

    emitEvent('player_selected', { player: nextP });
  } else {
    auction.current_player_id = null;
    auction.status = 'completed';
    emitEvent('auction_ended', {});
  }

  broadcastAuctionState();

  return unsoldData;
}

// Select Next Player
function selectNextPlayer(playerId = null) {
  const store = db.getMemoryStore();
  const auction = store.auction;

  let target = null;
  if (playerId) {
    target = store.players.find(p => p.id === parseInt(playerId, 10));
  } else {
    target = store.players.find(p => p.status === 'upcoming');
  }

  if (!target) {
    throw new Error('No upcoming player available.');
  }

  // Revert previous live if not sold
  if (auction.current_player_id && auction.current_player_id !== target.id) {
    const prev = store.players.find(p => p.id === auction.current_player_id);
    if (prev && prev.status === 'live') {
      prev.status = 'upcoming';
    }
  }

  target.status = 'live';
  target.base_price = 10000.00;
  auction.current_player_id = target.id;
  auction.current_bid = 10000.00;
  auction.highest_bidder_team_id = null;
  auction.bid_increment = 2000.00;
  auction.timer_remaining = auction.timer_seconds || 15;
  auction.status = 'live';

  emitEvent('player_selected', { player: target, current_bid: 10000.00 });
  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: auction.timer_running,
    timer_seconds: auction.timer_seconds,
    current_bid: 10000.00,
    highest_bidder_team_id: null
  });

  broadcastAuctionState();

  return target;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Immediately send full snapshot and timer
    socket.emit('auction_state_updated', getFullAuctionSnapshot());
    socket.emit('auction_state', getFullAuctionSnapshot());

    const store = db.getMemoryStore();
    const auction = store.auction || {};
    socket.emit('timer_updated', {
      timer_remaining: auction.timer_remaining,
      timer_running: auction.timer_running,
      timer_seconds: auction.timer_seconds,
      status: auction.status,
      current_bid: auction.current_bid,
      highest_bidder_team_id: auction.highest_bidder_team_id
    });

    // Client requests state refresh
    socket.on('request_state_refresh', () => {
      socket.emit('auction_state_updated', getFullAuctionSnapshot());
    });

    // Handle Bid directly over Socket
    socket.on('submit_bid', (data, callback) => {
      try {
        const result = submitBid(data);
        if (typeof callback === 'function') callback({ success: true, data: result });
      } catch (err) {
        socket.emit('bid_rejected', { message: err.message });
        if (typeof callback === 'function') callback({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = {
  initSocket,
  getIO: () => io,
  getFullAuctionSnapshot,
  broadcastAuctionState,
  emitEvent,
  startServerTimer,
  pauseServerTimer,
  resumeServerTimer,
  resetServerTimer,
  adjustServerTimer,
  submitBid,
  markPlayerSold,
  markPlayerUnsold,
  selectNextPlayer
};
