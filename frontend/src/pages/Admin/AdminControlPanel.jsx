import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Minus,
  Undo2,
  Users,
  Shield,
  Radio,
  Tv,
  LogOut,
  AlertTriangle,
  Flame,
  Trophy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function AdminControlPanel({ onNavigateToPlayers, onOpenDisplay }) {
  const {
    auction,
    currentPlayer,
    teams,
    timeLeft,
    timerRunning,
    recentBids,
    isSocketConnected,
    adminUser,
    logout,
    placeBid,
    undoLastBid,
    markSold,
    markUnsold,
    nextPlayer,
    controlAuction
  } = useAuction();

  // Local state for actions and modals
  const [selectedIncrement, setSelectedIncrement] = useState(2000);
  const [activeModalTeam, setActiveModalTeam] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm, danger }

  const highestTeam = auction?.highest_bidder_team_id
    ? teams.find(t => t.id === auction.highest_bidder_team_id)
    : null;

  const currentBid = auction?.current_bid || currentPlayer?.base_price || 10000;
  const nextBidAmount = currentBid + selectedIncrement;
  const isAuctionLive = auction?.status === 'live';

  // Clear messages after 4 seconds
  const notifySuccess = (msg) => {
    setActionSuccess(msg);
    setActionError(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const notifyError = (msg) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 5000);
  };

  // Fast Bid click
  const handleFastBid = async (team) => {
    setActionError(null);

    if (!isAuctionLive) {
      notifyError('Cannot place bid: Auction is currently paused or not started. Click "START AUCTION" first.');
      return;
    }

    if (nextBidAmount > (team.purse_remaining || 0)) {
      notifyError(`Insufficient Purse: ${team.name} only has ₹${team.purse_remaining?.toLocaleString('en-IN')}, but bid is ₹${nextBidAmount.toLocaleString('en-IN')}.`);
      return;
    }

    if ((team.players_bought || 0) >= (team.max_players || 5)) {
      notifyError(`Squad Full: ${team.name} has already reached the limit of ${team.max_players || 5} players.`);
      return;
    }

    try {
      await placeBid({
        team_id: team.id,
        amount: nextBidAmount
      });
      notifySuccess(`Bid of ₹${nextBidAmount.toLocaleString('en-IN')} placed for ${team.name}`);
    } catch (err) {
      notifyError(err.message || 'Failed to place bid');
    }
  };

  // Undo Last Bid
  const handleUndo = async () => {
    try {
      await undoLastBid();
      notifySuccess('Last bid reverted successfully');
    } catch (err) {
      notifyError(err.message || 'Cannot undo bid');
    }
  };

  // Mark SOLD Confirmation
  const confirmMarkSold = () => {
    if (!highestTeam) {
      notifyError('Cannot mark SOLD: No franchise has placed a bid yet.');
      return;
    }
    setConfirmDialog({
      title: 'CONFIRM HAMMER FALL (SOLD)',
      message: `Are you sure you want to sell ${currentPlayer?.name || 'this player'} to ${highestTeam.name} for ₹${currentBid.toLocaleString('en-IN')}? This will deduct the team purse and broadcast the victory animation to the TV display.`,
      danger: true,
      confirmLabel: 'HAMMER DOWN: SOLD!',
      onConfirm: async () => {
        try {
          await markSold(highestTeam.id, currentBid);
          notifySuccess(`SOLD! ${currentPlayer?.name} sold to ${highestTeam.name}`);
        } catch (err) {
          notifyError(err.message);
        }
      }
    });
  };

  // Mark UNSOLD Confirmation
  const confirmMarkUnsold = () => {
    setConfirmDialog({
      title: 'MARK PLAYER AS UNSOLD',
      message: `Pass on ${currentPlayer?.name || 'this player'} without a sale? The player will move into the UNSOLD pool for re-auction.`,
      danger: true,
      confirmLabel: 'CONFIRM UNSOLD',
      onConfirm: async () => {
        try {
          await markUnsold();
          notifySuccess(`${currentPlayer?.name} marked as UNSOLD`);
        } catch (err) {
          notifyError(err.message);
        }
      }
    });
  };

  // Next Player Confirmation
  const handleNextPlayer = async () => {
    try {
      await nextPlayer();
      notifySuccess('Next player successfully called to the auction block.');
    } catch (err) {
      notifyError(err.message);
    }
  };

  // End Auction Confirmation
  const confirmEndAuction = () => {
    setConfirmDialog({
      title: 'END AUCTION LEAGUE SESSION',
      message: 'Are you sure you want to end the entire live auction session? The digital display will show auction concluded.',
      danger: true,
      confirmLabel: 'CONCLUDE AUCTION',
      onConfirm: async () => {
        try {
          await controlAuction('end');
          notifySuccess('Auction session concluded.');
        } catch (err) {
          notifyError(err.message);
        }
      }
    });
  };

  // Reset Auction Confirmation
  const confirmResetAuction = () => {
    setConfirmDialog({
      title: 'RESET ALL AUCTION DATA',
      message: 'Reset demo auction state back to initial seed data? All temporary bids and sales in memory will be restored.',
      danger: true,
      confirmLabel: 'RESET STATE',
      onConfirm: async () => {
        try {
          await controlAuction('reset_all');
          notifySuccess('Auction state reset to initial seed data.');
        } catch (err) {
          notifyError(err.message);
        }
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#060a16] text-slate-100 flex flex-col font-sans select-none">
      
      {/* ---------------------------------------------------- */}
      {/* TOP BAR                                              */}
      {/* ---------------------------------------------------- */}
      <header className="px-6 py-3 bg-slate-950 border-b border-white/10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img 
            src="/images/tennis-ball-glow.svg" 
            alt="Tennis Ball" 
            className="w-9 h-9 animate-tennis-spin"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black font-display tracking-wider text-white uppercase">
                TENNIS AUCTION
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase">
                AUCTION CONTROL PANEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Laptop Command Center • Master Auctioneer Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mr-12">
          {/* Live / Offline Socket Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${
            isSocketConnected 
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
            <span>{isSocketConnected ? 'ONLINE (SOCKET SYNCED)' : 'DISCONNECTED'}</span>
          </div>

          {/* Navigation to Players Management */}
          <button
            onClick={onNavigateToPlayers}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Player Pool</span>
          </button>

          {/* Open Digital Display (TV) in new tab */}
          <button
            onClick={onOpenDisplay}
            className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-bold text-sky-300 flex items-center gap-1.5 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span>Open TV Screen</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Admin User info & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">
                {adminUser?.full_name || 'Lead Auctioneer'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {adminUser?.role || 'Super Admin'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications bar */}
      {actionSuccess && (
        <div className="bg-emerald-600/90 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 transition-all">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-600/90 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 transition-all">
          <AlertTriangle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MAIN ADMIN WORKSPACE                                 */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1720px] w-full mx-auto grid grid-cols-12 gap-6 items-start">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: AUCTION STATUS & PLAYER CONTROL (5 COLS)*/}
        {/* ==================================================== */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          
          {/* 1. LARGE STATUS CARD */}
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  isAuctionLive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300 font-display">
                  AUCTION STATUS
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isAuctionLive 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                {auction?.status?.toUpperCase() || 'WAITING'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Live Player
                </span>
                <span className="text-xl font-black font-display text-white truncate block">
                  {currentPlayer?.name || 'No Player Active'}
                </span>
                <span className="text-xs text-slate-400">
                  {currentPlayer?.player_number} • {currentPlayer?.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Highest Bid
                </span>
                <span className="text-2xl font-black font-display text-emerald-400 font-mono text-glow-emerald">
                  ₹{currentBid.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">
                  Base: ₹{(currentPlayer?.base_price || 10000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Leading Franchise
                </span>
                <span className="text-sm font-black font-display text-sky-400 truncate block">
                  {highestTeam ? highestTeam.name : 'No Bids Yet'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Server Clock
                </span>
                <span className={`text-xl font-black font-display font-mono ${
                  timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* 2. PLAYER CONTROL CARD */}
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 font-display mb-3">
              LIVE ATHLETE CARD & CONTROLS
            </h2>

            {currentPlayer ? (
              <div className="flex gap-4 items-center p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-4">
                <img 
                  src={currentPlayer.image_url} 
                  alt={currentPlayer.name} 
                  className="w-20 h-24 object-cover rounded-xl border border-white/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-display text-white truncate">
                      {currentPlayer.name}
                    </span>
                    <span>{currentPlayer.country_flag}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Rank #{currentPlayer.world_ranking} • Age {currentPlayer.age} • {currentPlayer.playing_hand}
                  </p>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] font-semibold text-slate-400">
                    <span>Matches: <strong className="text-white">{currentPlayer.matches}</strong></span>
                    <span>Wins: <strong className="text-emerald-400">{currentPlayer.wins}</strong></span>
                    <span>Aces: <strong className="text-amber-400">{currentPlayer.aces}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/60 text-center text-slate-400 text-xs mb-4">
                No athlete currently on the auction block. Click "NEXT PLAYER" to cue one.
              </div>
            )}

            {/* Auction Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleNextPlayer}
                className="p-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>NEXT PLAYER</span>
              </button>

              {isAuctionLive ? (
                <button
                  onClick={() => controlAuction('pause')}
                  className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE</span>
                </button>
              ) : (
                <button
                  onClick={() => controlAuction('start')}
                  className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>START AUCTION</span>
                </button>
              )}

              <button
                onClick={() => controlAuction(isAuctionLive ? 'pause' : 'resume')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAuctionLive ? 'PAUSE' : 'RESUME'}</span>
              </button>

              <button
                onClick={confirmMarkSold}
                disabled={!highestTeam}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4" />
                <span>MARK SOLD</span>
              </button>

              <button
                onClick={confirmMarkUnsold}
                className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>MARK UNSOLD</span>
              </button>

              <button
                onClick={confirmEndAuction}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>END AUCTION</span>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Need a fresh start?</span>
              <button
                onClick={confirmResetAuction}
                className="text-slate-400 hover:text-amber-400 font-medium underline underline-offset-2"
              >
                Reset In-Memory Store
              </button>
            </div>
          </div>

          {/* 3. SERVER COUNTDOWN CONTROL */}
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 font-display">
                SYNCHRONIZED COUNTDOWN CONTROL
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono">
                Authoritative Master Timer
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Remaining Time</span>
                <div className={`text-4xl font-black font-display font-mono ${
                  timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => controlAuction('timer_add_5')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+5s</span>
                </button>

                <button
                  onClick={() => controlAuction('timer_sub_5')}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-400" />
                  <span>-5s</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => controlAuction('timer_start')}
                className="py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
              >
                START TIMER
              </button>
              <button
                onClick={() => controlAuction('timer_pause')}
                className="py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
              >
                PAUSE TIMER
              </button>
              <button
                onClick={() => controlAuction('timer_reset')}
                className="py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold"
              >
                RESET (15s)
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: BIDDING CONTROL & TEAM STATUS (7 COLS) */}
        {/* ==================================================== */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          
          {/* 1. FAST BIDDING CONTROL */}
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 font-display">
                  INSTANT TEAM BID ENGINE
                </h2>
                <p className="text-xs text-slate-300">
                  Current: <strong className="text-emerald-400 font-mono">₹{currentBid.toLocaleString('en-IN')}</strong> • Next Bid: <strong className="text-white font-mono">₹{nextBidAmount.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              {/* Increment Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">INC:</span>
                {[2000, 5000, 10000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setSelectedIncrement(inc)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedIncrement === inc 
                        ? 'bg-emerald-500 text-slate-950 shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    +₹{(inc/1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Team Fast Bid Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
              {(teams && teams.length > 0 ? teams : []).map((team) => {
                const canBid = isAuctionLive && 
                  (nextBidAmount <= (team.purse_remaining || 0)) && 
                  ((team.players_bought || 0) < (team.max_players || 5));

                const isHighest = highestTeam && highestTeam.id === team.id;

                return (
                  <div
                    key={team.id}
                    className="p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden"
                    style={{
                      backgroundColor: isHighest ? `${team.primary_color}25` : 'rgba(255, 255, 255, 0.03)',
                      borderColor: isHighest ? team.primary_color : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isHighest ? `0 0 20px ${team.primary_color}35` : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={team.logo_url} 
                          alt={team.name} 
                          className="w-8 h-8 object-contain filter drop-shadow"
                        />
                        <div>
                          <span className="text-xs font-black font-display text-white block truncate">
                            {team.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Purse: ₹{team.purse_remaining?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {team.players_bought || 0}/{team.max_players || 5}
                      </span>
                    </div>

                    <button
                      onClick={() => handleFastBid(team)}
                      disabled={!canBid}
                      className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: team.primary_color,
                        color: '#050914'
                      }}
                    >
                      <span>BID ₹{nextBidAmount.toLocaleString('en-IN')}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* UNDO LAST BID BUTTON & RECENT BID FEED */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Live Bidding Stream
              </span>

              <button
                onClick={handleUndo}
                disabled={!recentBids || recentBids.length === 0}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-30"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>UNDO LAST BID</span>
              </button>
            </div>

            {/* Bid History Table */}
            <div className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-slate-950/60 border border-white/5 divide-y divide-white/5 text-xs">
              {recentBids && recentBids.length > 0 ? (
                recentBids.map((b, idx) => (
                  <div key={b.id || idx} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.primary_color || '#22c55e' }} />
                      <span className="font-bold text-white">{b.team_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 font-mono">₹{b.amount?.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500">
                        {b.bid_time ? new Date(b.bid_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 italic text-xs">
                  No bids recorded yet for this athlete.
                </div>
              )}
            </div>
          </div>

          {/* 2. TEAM MANAGEMENT CARDS (Click to View Roster Modal) */}
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 font-display mb-3">
              FRANCHISE MANAGEMENT (CLICK FOR DETAILED ROSTER)
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {(teams && teams.length > 0 ? teams : []).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveModalTeam(t)}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={t.logo_url} 
                      alt={t.name} 
                      className="w-10 h-10 object-contain shrink-0 filter drop-shadow group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black font-display text-white truncate block">
                        {t.name}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold block">
                        ₹{t.purse_remaining?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Spent: ₹{t.total_spent?.toLocaleString('en-IN') || 0}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-300 font-mono block">
                      {t.players_bought || 0}/{t.max_players || 5}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* TEAM ROSTER MODAL                                         */}
      {/* ========================================================= */}
      {activeModalTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={activeModalTeam.logo_url} alt="" className="w-12 h-12 object-contain" />
                <div>
                  <h3 className="text-xl font-black font-display text-white">{activeModalTeam.name}</h3>
                  <p className="text-xs text-slate-400">{activeModalTeam.tagline} • Owner: {activeModalTeam.owner}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalTeam(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Purse Left</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ₹{activeModalTeam.purse_remaining?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Spent</span>
                <span className="text-base font-black text-white font-mono">
                  ₹{activeModalTeam.total_spent?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Squad Count</span>
                <span className="text-base font-black text-sky-400 font-mono">
                  {activeModalTeam.players_bought || 0} of {activeModalTeam.max_players || 5}
                </span>
              </div>
            </div>

            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Purchased Athletes</h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeModalTeam.roster && activeModalTeam.roster.length > 0 ? (
                activeModalTeam.roster.map((player, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={player.image_url || '/images/players/rohan-iyer.jpg'} 
                        alt="" 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <span className="text-sm font-black text-white block">{player.player_name}</span>
                        <span className="text-[10px] text-slate-400">{player.category} • Rank #{player.world_ranking}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono block">
                        ₹{parseFloat(player.purchase_price)?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500">Drafted</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs italic">
                  No athletes purchased yet in this auction.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONFIRMATION DIALOG MODAL                                 */}
      {/* ========================================================= */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-black font-display text-white uppercase mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={async () => {
                  const onConf = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  if (onConf) await onConf();
                }}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                  confirmDialog.danger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                }`}
              >
                {confirmDialog.confirmLabel || 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
