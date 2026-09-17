const db = require('../config/db');
const {
  broadcastAuctionState,
  emitEvent,
  startServerTimer,
  pauseServerTimer,
  resetServerTimer,
  adjustServerTimer,
  getFullAuctionSnapshot
} = require('../socket/auctionSocket');

// Get current live auction state
exports.getAuctionState = async (req, res) => {
  try {
    const snapshot = getFullAuctionSnapshot();
    res.json({
      success: true,
      data: snapshot
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Place a new bid
exports.placeBid = async (req, res) => {
  try {
    const { team_id, amount, increment } = req.body;
    const store = db.getMemoryStore();
    const auction = store.auction;

    if (auction.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Auction is currently paused or inactive. Please start or resume the auction before bidding.'
      });
    }

    if (!auction.current_player_id) {
      return res.status(400).json({
        success: false,
        message: 'No player is currently on the auction block.'
      });
    }

    // Find team
    const team = store.teams.find(t => t.id === parseInt(team_id, 10));
    if (!team) {
      return res.status(404).json({ success: false, message: 'Selected franchise does not exist.' });
    }

    // Verify token permissions (team can only bid for themselves; admin can bid for any team)
    if (req.user && req.user.role !== 'admin' && req.user.team_id !== team.id) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You are logged in as ${req.user.username} and cannot place bids for ${team.name}.`
      });
    }

    // Check Self-Bidding Rule
    if (auction.highest_bidder_team_id === team.id) {
      return res.status(400).json({
        success: false,
        message: 'Your team is already the highest bidder! You cannot bid against yourself.'
      });
    }

    // Check squad size limit (e.g. 5)
    const teamPlayers = store.team_players.filter(tp => tp.team_id === team.id);
    if (teamPlayers.length >= team.max_players) {
      return res.status(400).json({
        success: false,
        message: `${team.name} has already reached the maximum squad limit (${team.max_players} players).`
      });
    }

    // Calculate bid amount
    let bidAmount;
    if (amount) {
      bidAmount = parseFloat(amount);
    } else {
      const inc = increment ? parseFloat(increment) : (auction.bid_increment || 2000);
      bidAmount = auction.current_bid + inc;
    }

    // Validation: Bid must exceed current bid
    if (bidAmount <= auction.current_bid) {
      return res.status(400).json({
        success: false,
        message: `Bid of ₹${bidAmount.toLocaleString('en-IN')} must be higher than the current bid of ₹${auction.current_bid.toLocaleString('en-IN')}.`
      });
    }

    // Calculate current purse remaining
    const totalSpent = teamPlayers.reduce((sum, tp) => sum + (parseFloat(tp.purchase_price) || 0), 0);
    const purseRemaining = (parseFloat(team.total_purse) || 100000) - totalSpent;

    if (bidAmount > purseRemaining) {
      return res.status(400).json({
        success: false,
        message: `Insufficient purse! ${team.name} has only ₹${purseRemaining.toLocaleString('en-IN')} remaining, but the bid is ₹${bidAmount.toLocaleString('en-IN')}.`
      });
    }

    // Update auction state
    auction.current_bid = bidAmount;
    auction.highest_bidder_team_id = team.id;
    auction.timer_remaining = auction.timer_seconds || 15;

    // Record bid in history
    const bidRecord = {
      id: store.bids.length + 1,
      auction_id: auction.id,
      player_id: auction.current_player_id,
      team_id: team.id,
      amount: bidAmount,
      bid_time: new Date()
    };
    store.bids.push(bidRecord);

    // Record auction event
    store.auction_events.push({
      id: store.auction_events.length + 1,
      event_type: 'bid_placed',
      auction_id: auction.id,
      player_id: auction.current_player_id,
      team_id: team.id,
      payload: { bidAmount, teamName: team.name },
      created_at: new Date()
    });

    // Ensure server timer runs
    startServerTimer();

    // Broadcast real-time event & full snapshot
    emitEvent('bid_placed', {
      player_id: auction.current_player_id,
      current_bid: bidAmount,
      highest_bidder_team_id: team.id,
      highest_bidder_team_name: team.name,
      highest_bidder_team_logo: team.logo_url,
      primary_color: team.primary_color,
      timer_remaining: auction.timer_remaining,
      bid: bidRecord
    });

    broadcastAuctionState();

    res.json({
      success: true,
      message: `Bid of ₹${bidAmount.toLocaleString('en-IN')} placed by ${team.name}`,
      data: {
        current_bid: auction.current_bid,
        highest_bidder_team_id: team.id,
        highest_bidder_name: team.name,
        timer_remaining: auction.timer_remaining,
        bid: bidRecord
      }
    });
  } catch (err) {
    console.error('placeBid error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Undo last bid
exports.undoLastBid = async (req, res) => {
  try {
    const store = db.getMemoryStore();
    const auction = store.auction;

    if (!auction.current_player_id) {
      return res.status(400).json({ success: false, message: 'No active player in auction' });
    }

    const playerBids = store.bids.filter(b => b.player_id === auction.current_player_id);
    if (playerBids.length === 0) {
      return res.status(400).json({ success: false, message: 'No bids to undo for the current player' });
    }

    // Remove the latest bid
    const lastBidIndex = store.bids.length - 1;
    const undoneBid = store.bids.splice(lastBidIndex, 1)[0];

    // Re-evaluate previous bid for this player
    const remainingPlayerBids = store.bids.filter(b => b.player_id === auction.current_player_id);
    const currentPlayer = store.players.find(p => p.id === auction.current_player_id);

    if (remainingPlayerBids.length > 0) {
      const prevBid = remainingPlayerBids[remainingPlayerBids.length - 1];
      auction.current_bid = prevBid.amount;
      auction.highest_bidder_team_id = prevBid.team_id;
    } else {
      auction.current_bid = currentPlayer ? currentPlayer.base_price : 10000;
      auction.highest_bidder_team_id = null;
    }

    auction.timer_remaining = auction.timer_seconds || 15;

    emitEvent('bid_undone', {
      undone_bid: undoneBid,
      current_bid: auction.current_bid,
      highest_bidder_team_id: auction.highest_bidder_team_id,
      timer_remaining: auction.timer_remaining
    });

    broadcastAuctionState();

    res.json({
      success: true,
      message: `Undone last bid of ₹${undoneBid.amount.toLocaleString('en-IN')}`,
      data: {
        current_bid: auction.current_bid,
        highest_bidder_team_id: auction.highest_bidder_team_id,
        undone_bid: undoneBid
      }
    });
  } catch (err) {
    console.error('undoLastBid error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Finalize sale: Mark player as SOLD
exports.markSold = async (req, res) => {
  try {
    const { winning_team_id, final_price } = req.body;
    const store = db.getMemoryStore();
    const auction = store.auction;

    if (!auction.current_player_id) {
      return res.status(400).json({ success: false, message: 'No active player in auction to mark as SOLD.' });
    }

    const teamId = winning_team_id ? parseInt(winning_team_id, 10) : auction.highest_bidder_team_id;
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'No team has placed a bid on this player yet. To pass on this player, click "MARK UNSOLD".'
      });
    }

    const team = store.teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Winning franchise not found' });
    }

    const player = store.players.find(p => p.id === auction.current_player_id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const price = final_price ? parseFloat(final_price) : auction.current_bid;

    // Check squad limit
    const currentBought = store.team_players.filter(tp => tp.team_id === team.id);
    if (currentBought.length >= team.max_players) {
      return res.status(400).json({
        success: false,
        message: `${team.name} has already acquired the maximum squad size of ${team.max_players} players.`
      });
    }

    // Stop timer
    pauseServerTimer();
    auction.timer_running = false;

    // Deduct purse from winning team
    team.purse_remaining = Math.max(0, (parseFloat(team.purse_remaining) || 0) - price);

    // Record in team_players
    store.team_players.push({
      id: store.team_players.length + 1,
      team_id: team.id,
      player_id: player.id,
      purchase_price: price,
      purchased_at: new Date()
    });

    // Mark player sold
    player.status = 'sold';
    player.sold_price = price;
    player.sold_to_team_id = team.id;

    // Event log
    store.auction_events.push({
      id: store.auction_events.length + 1,
      event_type: 'player_sold',
      auction_id: auction.id,
      player_id: player.id,
      team_id: team.id,
      payload: { price, playerName: player.name, teamName: team.name },
      created_at: new Date()
    });

    // Broadcast dramatic SOLD event for Digital Display
    emitEvent('player_sold', {
      player: {
        ...player,
        sold_price: price,
        sold_to_team_id: team.id
      },
      winning_team: {
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        primary_color: team.primary_color,
        glow_color: team.glow_color
      },
      final_price: price,
      sold_at: new Date().toISOString()
    });

    broadcastAuctionState();

    res.json({
      success: true,
      message: `🔨 SOLD! ${player.name} sold to ${team.name} for ₹${price.toLocaleString('en-IN')}`,
      data: {
        sold_player: player,
        winning_team: team,
        purchase_price: price
      }
    });
  } catch (err) {
    console.error('markSold error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mark player as UNSOLD
exports.markUnsold = async (req, res) => {
  try {
    const store = db.getMemoryStore();
    const auction = store.auction;

    if (!auction.current_player_id) {
      return res.status(400).json({ success: false, message: 'No active player in auction to mark as UNSOLD.' });
    }

    const player = store.players.find(p => p.id === auction.current_player_id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    pauseServerTimer();
    auction.timer_running = false;
    player.status = 'unsold';

    store.auction_events.push({
      id: store.auction_events.length + 1,
      event_type: 'player_unsold',
      auction_id: auction.id,
      player_id: player.id,
      payload: { playerName: player.name },
      created_at: new Date()
    });

    emitEvent('player_unsold', {
      player,
      timestamp: new Date().toISOString()
    });

    broadcastAuctionState();

    res.json({
      success: true,
      message: `${player.name} marked as UNSOLD`,
      data: { player }
    });
  } catch (err) {
    console.error('markUnsold error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cue Next Upcoming Player
exports.nextPlayer = async (req, res) => {
  try {
    const store = db.getMemoryStore();
    const auction = store.auction;

    const upcomingPlayers = store.players.filter(p => p.status === 'upcoming');
    if (upcomingPlayers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No more upcoming players in the draft pool!'
      });
    }

    const nextP = upcomingPlayers[0];
    nextP.status = 'live';
    nextP.base_price = 10000.00;

    auction.current_player_id = nextP.id;
    auction.current_bid = 10000.00;
    auction.highest_bidder_team_id = null;
    auction.bid_increment = 2000.00;
    auction.timer_remaining = auction.timer_seconds || 15;
    auction.status = 'live';

    startServerTimer();

    emitEvent('player_selected', {
      player: nextP,
      current_bid: 10000.00
    });

    broadcastAuctionState();

    res.json({
      success: true,
      message: `Next player ${nextP.name} is now LIVE on the auction block.`,
      data: { player: nextP }
    });
  } catch (err) {
    console.error('nextPlayer error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Set specific player as Live
exports.setLivePlayer = async (req, res) => {
  try {
    const { player_id } = req.body;
    const store = db.getMemoryStore();
    const auction = store.auction;

    const player = store.players.find(p => p.id === parseInt(player_id, 10));
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // If there was a previous live player not sold/unsold, return them to upcoming
    if (auction.current_player_id && auction.current_player_id !== player.id) {
      const prev = store.players.find(p => p.id === auction.current_player_id);
      if (prev && prev.status === 'live') {
        prev.status = 'upcoming';
      }
    }

    player.status = 'live';
    player.base_price = 10000.00;
    auction.current_player_id = player.id;
    auction.current_bid = 10000.00;
    auction.highest_bidder_team_id = null;
    auction.bid_increment = 2000.00;
    auction.timer_remaining = auction.timer_seconds || 15;
    auction.status = 'live';

    startServerTimer();

    emitEvent('player_selected', {
      player,
      current_bid: 10000.00
    });

    broadcastAuctionState();

    res.json({
      success: true,
      message: `${player.name} is now LIVE on the auction block`,
      data: { player }
    });
  } catch (err) {
    console.error('setLivePlayer error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Auction Control (start, pause, resume, end, reset, timer actions)
exports.controlAuction = async (req, res) => {
  try {
    const { action, timer_seconds, bid_increment } = req.body;
    const store = db.getMemoryStore();
    const auction = store.auction;

    switch (action) {
      case 'start':
        auction.status = 'live';
        startServerTimer();
        emitEvent('auction_started', { status: 'live' });
        break;

      case 'pause':
        auction.status = 'paused';
        pauseServerTimer();
        emitEvent('auction_paused', { status: 'paused' });
        break;

      case 'resume':
        auction.status = 'live';
        startServerTimer();
        emitEvent('auction_resumed', { status: 'live' });
        break;

      case 'end':
        auction.status = 'completed';
        pauseServerTimer();
        emitEvent('auction_ended', { status: 'completed' });
        break;

      case 'timer_start':
        startServerTimer();
        break;

      case 'timer_pause':
        pauseServerTimer();
        break;

      case 'timer_reset':
        resetServerTimer(timer_seconds || auction.timer_seconds || 15);
        break;

      case 'timer_add_5':
        adjustServerTimer(5);
        break;

      case 'timer_sub_5':
        adjustServerTimer(-5);
        break;

      case 'reset_all':
        db.resetMemoryStore();
        resetServerTimer(15);
        break;

      default:
        break;
    }

    if (bid_increment) {
      auction.bid_increment = parseFloat(bid_increment);
    }
    if (timer_seconds) {
      auction.timer_seconds = parseInt(timer_seconds, 10);
    }

    broadcastAuctionState();

    res.json({
      success: true,
      message: `Auction action '${action}' executed successfully.`,
      data: store.auction
    });
  } catch (err) {
    console.error('controlAuction error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Tick timer manual endpoint
exports.tickTimer = async (req, res) => {
  try {
    const { seconds } = req.body;
    const store = db.getMemoryStore();
    if (seconds !== undefined) {
      store.auction.timer_remaining = Math.max(0, parseInt(seconds, 10));
    }
    res.json({ success: true, timer_remaining: store.auction.timer_remaining });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
