const { Server } = require('socket.io');
const db = require('../config/db');

let io = null;
let timerInterval = null;

// Helper to calculate full auction state snapshot
function getFullAuctionSnapshot() {
  const store = db.getMemoryStore();
  const auction = store.auction || {};

  // Resolve current player
  const currentPlayer = store.players.find(p => p.id === auction.current_player_id) || null;

  // Calculate teams with purse remaining and squad roster
  const teams = (store.teams || []).map(t => {
    const bought = (store.team_players || []).filter(tp => tp.team_id === t.id);
    const totalSpent = bought.reduce((sum, item) => sum + (parseFloat(item.purchase_price) || 0), 0);
    const playersBoughtList = bought.map(b => {
      const p = store.players.find(pl => pl.id === b.player_id);
      return {
        ...b,
        player_name: p ? p.name : 'Unknown Player',
        player_number: p ? p.player_number : '',
        category: p ? p.category : '',
        world_ranking: p ? p.world_ranking : 0,
        image_url: p ? p.image_url : null,
        matches: p ? p.matches : 0,
        win_percentage: p ? p.win_percentage : 0,
        aces: p ? p.aces : 0
      };
    });

    return {
      ...t,
      players_bought: bought.length,
      total_spent: totalSpent,
      purse_remaining: Math.max(0, (parseFloat(t.total_purse) || 200000) - totalSpent),
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
    .slice(-15)
    .reverse()
    .map(b => {
      const team = teams.find(t => t.id === b.team_id);
      return {
        ...b,
        team_name: team ? team.name : 'Unknown Team',
        team_logo: team ? team.logo_url : null,
        primary_color: team ? team.primary_color : '#22c55e'
      };
    });

  const upcomingPlayers = (store.players || []).filter(p => p.status === 'upcoming');
  const soldPlayers = (store.players || []).filter(p => p.status === 'sold');
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

  emitEvent('timer_started', {
    timer_remaining: auction.timer_remaining,
    timer_seconds: auction.timer_seconds,
    timer_running: true
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

  emitEvent('timer_paused', {
    timer_remaining: auction.timer_remaining,
    timer_running: false
  });
  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: false,
    timer_seconds: auction.timer_seconds
  });
}

function resetServerTimer(seconds = null) {
  const store = db.getMemoryStore();
  const auction = store.auction;
  if (!auction) return;

  const targetSec = seconds !== null ? parseInt(seconds, 10) : (auction.timer_seconds || 15);
  auction.timer_remaining = targetSec;
  auction.timer_seconds = targetSec;

  emitEvent('timer_reset', {
    timer_remaining: auction.timer_remaining,
    timer_seconds: auction.timer_seconds,
    timer_running: auction.timer_running
  });
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

  const newTime = Math.max(0, (auction.timer_remaining || 0) + deltaSeconds);
  auction.timer_remaining = newTime;

  emitEvent('timer_updated', {
    timer_remaining: auction.timer_remaining,
    timer_running: auction.timer_running,
    timer_seconds: auction.timer_seconds
  });
}

function broadcastAuctionState() {
  if (!io) return;
  const snapshot = getFullAuctionSnapshot();
  io.emit('auction_state', snapshot);
  io.emit('digital_display_updated', snapshot);
}

function emitEvent(eventName, data) {
  if (!io) return;
  io.emit(eventName, data);
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

    // Join default auction room
    socket.join('auction_room');

    // Immediately send full snapshot to newly connected client
    socket.emit('auction_state', getFullAuctionSnapshot());

    // Send current timer status
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
  resetServerTimer,
  adjustServerTimer
};
