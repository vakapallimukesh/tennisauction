import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import {
  Trophy,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogOut,
  Shield,
  Sparkles,
  Flame,
  Zap,
  Radio,
  ArrowLeft
} from 'lucide-react';

export default function TeamDashboard({ teamId: routeTeamId, onNavigate }) {
  const {
    auction,
    currentPlayer,
    teams,
    recentBids,
    timeLeft,
    timerRunning,
    placeBid,
    currentUser,
    isAdmin,
    logout,
    isSocketConnected
  } = useAuction();

  const [biddingLoading, setBiddingLoading] = useState(false);
  const [bidError, setBidError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [activeTab, setActiveTab] = useState('auction'); // 'auction' | 'squad'

  const effectiveTeamId = parseInt(routeTeamId || currentUser?.team_id || 1, 10);

  // Find this team from live data
  const myTeam = useMemo(() => {
    return (teams || []).find(t => t.id === effectiveTeamId) || {
      id: effectiveTeamId,
      name: `Team ${effectiveTeamId}`,
      total_purse: 100000,
      purse_remaining: 100000,
      players_bought: 0,
      max_players: 5,
      roster: [],
      primary_color: '#22c55e',
      glow_color: 'rgba(34, 197, 94, 0.4)'
    };
  }, [teams, effectiveTeamId]);

  // Status checks
  const isAuctionLive = auction?.status === 'live';
  const currentBid = auction?.current_bid || currentPlayer?.base_price || 10000;
  const bidIncrement = auction?.bid_increment || 2000;
  const highestBidderId = auction?.highest_bidder_team_id;
  const isHighestBidder = highestBidderId === effectiveTeamId;

  // Have we placed a bid on this current player before?
  const myRecentBidsOnPlayer = useMemo(() => {
    return (recentBids || []).filter(b => b.team_id === effectiveTeamId);
  }, [recentBids, effectiveTeamId]);

  const wasOutbid = !isHighestBidder && highestBidderId !== null;

  // Squad and purse constraints
  const squadFull = (myTeam.players_bought || 0) >= (myTeam.max_players || 5);
  const remainingPurse = myTeam.purse_remaining !== undefined ? myTeam.purse_remaining : 100000;
  const nextMinBid = currentBid + bidIncrement;

  // Handle Bid Execution
  const handleBid = async (customIncrement = null, exactAmount = null) => {
    if (isHighestBidder) {
      setBidError('Your team is already the highest bidder! You cannot bid against yourself.');
      return;
    }
    if (squadFull) {
      setBidError(`Your squad is full (${myTeam.max_players}/${myTeam.max_players} players).`);
      return;
    }

    let targetBid;
    if (exactAmount) {
      targetBid = exactAmount;
    } else if (customIncrement) {
      targetBid = currentBid + customIncrement;
    } else {
      targetBid = currentBid + bidIncrement;
    }

    if (targetBid > remainingPurse) {
      setBidError(`Insufficient purse! Needed ₹${targetBid.toLocaleString('en-IN')}, available ₹${remainingPurse.toLocaleString('en-IN')}.`);
      return;
    }

    setBiddingLoading(true);
    setBidError('');
    try {
      await placeBid({
        team_id: effectiveTeamId,
        amount: targetBid,
        increment: customIncrement || bidIncrement
      });
      setSuccessToast(`Bid of ₹${targetBid.toLocaleString('en-IN')} successfully placed!`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      setBidError(err.message || 'Bid failed');
    } finally {
      setBiddingLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    if (onNavigate) onNavigate('/login');
    else window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#060b19] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3.5 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        {/* Left: Team Branding & Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('/admin/squads') : (window.location.href = '/admin/squads')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Back to Admin & Squads"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {myTeam.logo_url ? (
            <img
              src={myTeam.logo_url}
              alt={myTeam.name}
              className="w-10 h-10 rounded-xl object-cover border-2 shadow-lg"
              style={{ borderColor: myTeam.primary_color || '#22c55e' }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 text-sm shadow-md"
              style={{ backgroundColor: myTeam.primary_color || '#22c55e' }}
            >
              T{effectiveTeamId}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-display tracking-wide uppercase text-white">
                {myTeam.name}
              </h1>
              <span
                className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${myTeam.primary_color || '#22c55e'}20`,
                  borderColor: myTeam.primary_color || '#22c55e',
                  color: myTeam.primary_color || '#22c55e'
                }}
              >
                TEAM {effectiveTeamId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                {isSocketConnected ? 'Live Real-Time Sync' : 'Reconnecting...'}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">
                Squad: {myTeam.players_bought || 0} / {myTeam.max_players || 5}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Purse & Switch/Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden xs:block">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Remaining Purse
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
              ₹{remainingPurse.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('auction')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'auction'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Auction Block
            </button>
            <button
              onClick={() => setActiveTab('squad')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'squad'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>My Squad</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {myTeam.players_bought || 0}
              </span>
            </button>
          </div>

          <button
            onClick={handleLogoutClick}
            title="Logout / Switch Account"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">

        {/* Reconnect Banner if disconnected */}
        {!isSocketConnected && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Connection to server interrupted. Reconnecting automatically...</span>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Toast */}
        {bidError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-shake">
            <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{bidError}</span>
          </div>
        )}

        {activeTab === 'auction' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT: Live Auction Card (7 cols) */}
            <div className="lg:col-span-7 space-y-4">

              {/* STATUS BANNER */}
              <div className="rounded-2xl overflow-hidden border border-white/15 backdrop-blur-xl shadow-xl">
                {isHighestBidder ? (
                  <div className="bg-emerald-500/25 border-b border-emerald-500/40 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-black text-sm uppercase tracking-wider">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <span>🟢 YOU ARE THE HIGHEST BIDDER!</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      ₹{currentBid.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : wasOutbid ? (
                  <div className="bg-rose-500/25 border-b border-rose-500/40 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-rose-400 font-black text-sm uppercase tracking-wider">
                      <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping" />
                      <span>🔴 OUTBID! PLACE A HIGHER BID</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Leading: {auction?.highest_bidder_team?.name || `Team ${highestBidderId}`}
                    </span>
                  </div>
                ) : (
                  <div className="bg-sky-500/20 border-b border-sky-500/30 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                      <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                      <span>LIVE AUCTION IN PROGRESS</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Base: ₹{(currentPlayer?.base_price || 10000).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Player Profile Display */}
                {currentPlayer ? (
                  <div className="p-5 bg-slate-950/60 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                    {/* Player Image */}
                    <div className="relative w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-white/20 flex-shrink-0 bg-slate-900 shadow-2xl">
                      <img
                        src={currentPlayer.image_url || '/images/default-player.jpg'}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[10px] font-black text-amber-400 font-mono">
                        #{currentPlayer.player_number || '01'}
                      </div>
                      <div className="absolute bottom-2 inset-x-2 px-2 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-center border border-white/10">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          World Rank
                        </span>
                        <span className="text-xs font-black text-white font-mono">
                          #{currentPlayer.world_ranking || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Player Info & Stats */}
                    <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                      <div>
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider mb-1">
                          {currentPlayer.category || 'Group A'}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight uppercase">
                          {currentPlayer.name}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {currentPlayer.country || 'India'} • {currentPlayer.play_style || 'Right Handed Aggressive'}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Matches</span>
                          <span className="text-sm font-bold text-white font-mono">{currentPlayer.matches || 48}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Win Rate</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">{currentPlayer.win_percentage || 74}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Aces</span>
                          <span className="text-sm font-bold text-sky-400 font-mono">{currentPlayer.aces || 320}</span>
                        </div>
                      </div>

                      {/* Current Bid in Card */}
                      <div className="pt-2 flex items-center justify-between border-t border-white/10">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                            Current Highest Bid
                          </span>
                          <span className="text-2xl font-black font-mono text-emerald-400">
                            ₹{currentBid.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    <p className="text-sm font-bold">No active player on the auction block.</p>
                    <p className="text-xs text-slate-500 mt-1">Waiting for the auctioneer to cue the next round...</p>
                  </div>
                )}
              </div>

              {/* DYNAMIC BID BUTTONS CONTAINER */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-white font-display">
                      Place Instant Bid for {myTeam.name}
                    </h3>
                  </div>
                  {isHighestBidder && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Self-Bidding Blocked
                    </span>
                  )}
                </div>

                {/* Primary Huge Bid Button */}
                <button
                  type="button"
                  disabled={biddingLoading || isHighestBidder || squadFull || nextMinBid > remainingPurse || !isAuctionLive}
                  onClick={() => handleBid(null, null)}
                  className={`w-full py-4 px-6 rounded-2xl font-black font-display text-lg tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-3 shadow-xl ${isHighestBidder
                      ? 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'
                      : squadFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : nextMinBid > remainingPurse
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                >
                  {biddingLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : isHighestBidder ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>YOU ARE HIGHEST BIDDER</span>
                    </>
                  ) : squadFull ? (
                    <span>SQUAD IS FULL (5/5)</span>
                  ) : nextMinBid > remainingPurse ? (
                    <span>PURSE EXCEEDED</span>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-slate-950" />
                      <span>BID ₹{nextMinBid.toLocaleString('en-IN')} (+₹{bidIncrement.toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>

                {/* Quick Step Bids: +2k, +5k, +10k */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={biddingLoading || isHighestBidder || squadFull || (currentBid + 2000) > remainingPurse || !isAuctionLive}
                    onClick={() => handleBid(2000)}
                    className="py-3 px-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/50 text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-[10px] text-slate-400">+₹2,000 Step</span>
                    <span className="font-mono text-emerald-400 font-extrabold">
                      ₹{(currentBid + 2000).toLocaleString('en-IN')}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={biddingLoading || isHighestBidder || squadFull || (currentBid + 5000) > remainingPurse || !isAuctionLive}
                    onClick={() => handleBid(5000)}
                    className="py-3 px-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/50 text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-[10px] text-slate-400">+₹5,000 Step</span>
                    <span className="font-mono text-cyan-400 font-extrabold">
                      ₹{(currentBid + 5000).toLocaleString('en-IN')}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={biddingLoading || isHighestBidder || squadFull || (currentBid + 10000) > remainingPurse || !isAuctionLive}
                    onClick={() => handleBid(10000)}
                    className="py-3 px-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-[10px] text-amber-400 font-extrabold">Power +₹10,000</span>
                    <span className="font-mono text-amber-300 font-extrabold">
                      ₹{(currentBid + 10000).toLocaleString('en-IN')}
                    </span>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-slate-400">
                    Bids sync across all 6 clients with 0s latency via authoritative WebSocket engine.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Feed & Team Overview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">

              {/* Team Purse Breakdown Widget */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {myTeam.name} Financial Health
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Purse Utilization</span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹{(myTeam.total_spent || 0).toLocaleString('en-IN')} / ₹{(myTeam.total_purse || 100000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, ((myTeam.total_spent || 0) / (myTeam.total_purse || 100000)) * 100)}%`,
                        backgroundColor: myTeam.primary_color || '#22c55e'
                      }}
                    />
                  </div>
                </div>

                {/* Squad dots */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Squad Slots (Max 5)</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const isFilled = slot <= (myTeam.players_bought || 0);
                      return (
                        <div
                          key={slot}
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black font-mono border ${isFilled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800 text-slate-500 border-white/10'
                            }`}
                        >
                          {slot}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LIVE BIDS FEED ON THIS PLAYER */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Live Bidding Stream
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Current Round</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(recentBids || []).length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No bids recorded yet. Be the first to place a bid!
                    </div>
                  ) : (
                    recentBids.slice(0, 8).map((bid, idx) => {
                      const isMine = bid.team_id === effectiveTeamId;
                      return (
                        <div
                          key={bid.id || idx}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${idx === 0
                              ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20'
                              : isMine
                                ? 'bg-white/5 border-white/20'
                                : 'bg-slate-900/40 border-white/5'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: bid.primary_color || '#38bdf8' }}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isMine ? 'text-emerald-300' : 'text-slate-200'}`}>
                                  {bid.team_name}
                                </span>
                                {isMine && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {bid.bid_time ? new Date(bid.bid_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-xs font-black text-white">
                              ₹{(bid.amount || 0).toLocaleString('en-IN')}
                            </span>
                            {idx === 0 && (
                              <span className="block text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                                Leading
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* SQUAD TAB */
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white font-display">
                    {myTeam.name} Roster
                  </h2>
                  <p className="text-xs text-slate-400">
                    {myTeam.players_bought || 0} of {myTeam.max_players || 5} players acquired
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Spent</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    ₹{(myTeam.total_spent || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {(!myTeam.roster || myTeam.roster.length === 0) ? (
                <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-xl">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">No players acquired yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Use the Auction Block to bid on upcoming tennis athletes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTeam.roster.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <img
                        src={p.image_url || '/images/default-player.jpg'}
                        alt={p.player_name}
                        className="w-16 h-20 rounded-lg object-cover bg-slate-900 border border-white/10"
                      />
                      <div className="flex-1">
                        <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                          {p.category || 'Group A'}
                        </span>
                        <h4 className="text-sm font-black text-white">{p.player_name}</h4>
                        <p className="text-xs text-slate-400 font-mono">Rank #{p.world_ranking || '-'}</p>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                          ₹{(p.purchase_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="px-6 py-3.5 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl text-center text-xs text-slate-500 flex items-center justify-between">
        <span>Logged in as {myTeam.name} (Team {effectiveTeamId})</span>
        <button
          onClick={() => onNavigate ? onNavigate('/login') : (window.location.href = '/login')}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Switch Team Account
        </button>
      </footer>

    </div>
  );
}
