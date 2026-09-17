import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function AdminControlPanel({ onNavigate, onNavigateToPlayers, onOpenDisplay }) {
  const {
    auction,
    currentPlayer,
    teams,
    timeLeft,
    timerRunning,
    recentBids,
    upcomingPlayers,
    soldPlayers,
    unsoldPlayers,
    selectLivePlayer,
    placeBid,
    markSold,
    markUnsold,
    controlAuction,
    isSocketConnected,
    currentUser,
    logout
  } = useAuction();

  // Local state
  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [selectedIncrement, setSelectedIncrement] = useState(2000);
  const [customBidInput, setCustomBidInput] = useState('');
  const [isSelectPlayerModalOpen, setIsSelectPlayerModalOpen] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState(null); // { type: 'success' | 'error', text }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm, actionText, actionColor }
  const [isMuted, setIsMuted] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Audio effects refs
  const audioContextRef = useRef(null);

  const playTone = useCallback((freq = 600, duration = 0.15, type = 'sine') => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (!audioContextRef.current) return;
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
      gain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + duration);
    } catch {
      // Ignore audio policy restrictions
    }
  }, [isMuted]);

  // Fallback teams if data is loading
  const activeTeams = teams && teams.length === 4 ? teams : [
    { id: 1, team_number: 1, name: 'Ace Storm', total_purse: 100000, purse_remaining: 78000, players_bought: 2, max_players: 5, primary_color: '#0ea5e9' },
    { id: 2, team_number: 2, name: 'Thunder Bolts', total_purse: 100000, purse_remaining: 62000, players_bought: 3, max_players: 5, primary_color: '#a855f7' },
    { id: 3, team_number: 3, name: 'Fire Servers', total_purse: 100000, purse_remaining: 88000, players_bought: 1, max_players: 5, primary_color: '#f97316' },
    { id: 4, team_number: 4, name: 'The Racquet Warriors', total_purse: 100000, purse_remaining: 100000, players_bought: 0, max_players: 5, primary_color: '#22c55e' }
  ];

  // Highest bidder
  const highestTeam = auction?.highest_bidder_team_id
    ? activeTeams.find(t => t.id === auction.highest_bidder_team_id)
    : (activeTeams[1] || null);

  const currentBid = auction?.current_bid || currentPlayer?.base_price || 14000;
  const currentLeaderName = highestTeam ? highestTeam.name : 'Thunder Bolts';

  // Calculate next recommended bid
  const minRecommendedBid = currentBid + selectedIncrement;
  const confirmedNextBidAmount = customBidInput !== ''
    ? parseFloat(String(customBidInput).replace(/,/g, '')) || minRecommendedBid
    : minRecommendedBid;

  const selectedTeam = activeTeams.find(t => t.id === selectedTeamId) || activeTeams[0];
  const teamPurseRemaining = selectedTeam?.purse_remaining ?? 100000;
  const teamPurseAfter = Math.max(0, teamPurseRemaining - confirmedNextBidAmount);

  // Total player pool count
  const totalPoolCount = (upcomingPlayers?.length || 0) + (soldPlayers?.length || 0) + (unsoldPlayers?.length || 0) + (currentPlayer ? 1 : 0) || 124;

  // Filter eligible players for selection (exclude sold players)
  const eligiblePlayers = (upcomingPlayers || []).filter(p => {
    if (p.status === 'sold') return false;
    if (!playerSearchQuery.trim()) return true;
    const q = playerSearchQuery.toLowerCase().trim();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.country && p.country.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.world_ranking && String(p.world_ranking).includes(q)) ||
      (p.player_number && String(p.player_number).toLowerCase().includes(q))
    );
  });

  // Format currency
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 PTS';
    const num = Number(val);
    if (isNaN(num)) return '0 PTS';
    return num.toLocaleString() + ' PTS';
  };

  const formatShortK = (val) => {
    if (!val && val !== 0) return '0k';
    const num = Number(val);
    if (num >= 100000) return `${Math.round(num / 1000)}k`;
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return `${num}`;
  };

  const showNotice = (text, type = 'success') => {
    setActionNotice({ text, type });
    if (type === 'success') {
      playTone(880, 0.1, 'triangle');
    } else {
      playTone(300, 0.2, 'sawtooth');
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Synchronize team selection on auction leader change
  useEffect(() => {
    if (auction?.highest_bidder_team_id) {
      // Find the other team for quick next counter bid suggestion
      const otherTeam = activeTeams.find(t => t.id !== auction.highest_bidder_team_id);
      if (otherTeam && selectedTeamId === auction.highest_bidder_team_id) {
        setSelectedTeamId(otherTeam.id);
      }
    }
  }, [auction?.highest_bidder_team_id]);

  // Master Action Handlers
  const handleToggleTimer = async () => {
    try {
      if (timerRunning) {
        await controlAuction('pause');
        showNotice('Gavel timer paused.');
      } else {
        await controlAuction('resume');
        showNotice('Gavel timer resumed.');
      }
    } catch (err) {
      showNotice(err.message || 'Failed to toggle timer', 'error');
    }
  };

  const handleResetTimer = async (e) => {
    if (e) e.stopPropagation();
    try {
      await controlAuction('reset_timer');
      showNotice('Gavel timer reset.');
      playTone(520, 0.12);
    } catch (err) {
      showNotice(err.message || 'Failed to reset timer', 'error');
    }
  };

  const handleMarkSold = () => {
    const targetTeam = highestTeam || activeTeams[0];
    setConfirmDialog({
      title: 'CONFIRM HAMMER FALL (SOLD)',
      message: `Sell ${currentPlayer?.name || 'Arjun Mehta'} to ${targetTeam.name} for ${formatCurrency(currentBid)}? This will deduct the franchise purse and broadcast the celebration.`,
      actionText: `MARK SOLD (${targetTeam.name.toUpperCase()})`,
      actionColor: 'bg-emerald-600 hover:bg-emerald-500 text-slate-950',
      onConfirm: async () => {
        try {
          await markSold(targetTeam.id, currentBid);
          showNotice(`SOLD! ${currentPlayer?.name || 'Athlete'} sold to ${targetTeam.name}!`);
          playTone(950, 0.3, 'square');
        } catch (err) {
          showNotice(err.message || 'Sale failed', 'error');
        }
      }
    });
  };

  const handleMarkUnsold = () => {
    setConfirmDialog({
      title: 'MARK ATHLETE AS UNSOLD',
      message: `Pass on ${currentPlayer?.name || 'this athlete'}? They will be moved to the unsold pool for future re-auction.`,
      actionText: 'CONFIRM UNSOLD',
      actionColor: 'bg-red-600 hover:bg-red-500 text-white',
      onConfirm: async () => {
        try {
          await markUnsold();
          showNotice(`${currentPlayer?.name || 'Athlete'} marked as UNSOLD`);
        } catch (err) {
          showNotice(err.message || 'Failed to pass athlete', 'error');
        }
      }
    });
  };

  // Select Player from Modal -> becomes CURRENT LOT
  const handleSelectPlayer = async (player) => {
    try {
      setIsSelectPlayerModalOpen(false);
      setPlayerSearchQuery('');
      setCustomBidInput('');
      await selectLivePlayer(player.id);
      showNotice(`${player.name} is now the CURRENT LOT on the auction block.`);
      playTone(700, 0.15);
    } catch (err) {
      showNotice(err.message || 'Failed to select player', 'error');
    }
  };

  // Submit Bid for selected team with amount
  const handleSubmitBid = async (teamIdToBid = selectedTeamId, amountToBid = confirmedNextBidAmount) => {
    const parsedAmount = parseFloat(String(amountToBid).replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showNotice('Please specify a valid numeric bid amount.', 'error');
      return;
    }
    const targetTeam = activeTeams.find(t => t.id === teamIdToBid) || activeTeams[0];
    if (parsedAmount > (targetTeam.purse_remaining || 100000)) {
      showNotice(`${targetTeam.name} has insufficient purse balance!`, 'error');
      return;
    }

    try {
      await placeBid({
        team_id: teamIdToBid,
        amount: parsedAmount,
        increment: selectedIncrement
      });
      showNotice(`Bid of ${formatCurrency(parsedAmount)} registered for ${targetTeam.name}`);
      setCustomBidInput('');
      playTone(800, 0.1, 'sine');
    } catch (err) {
      showNotice(err.message || 'Bid submission failed', 'error');
    }
  };

  // Keyboard Hotkey Listener (1-4 for team select/bid, Enter to submit, Space for gavel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept hotkeys when actively typing in input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmitBid();
        }
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        setSelectedTeamId(1);
        playTone(600, 0.05);
      } else if (e.key === '2') {
        e.preventDefault();
        setSelectedTeamId(2);
        playTone(600, 0.05);
      } else if (e.key === '3') {
        e.preventDefault();
        setSelectedTeamId(3);
        playTone(600, 0.05);
      } else if (e.key === '4') {
        e.preventDefault();
        setSelectedTeamId(4);
        playTone(600, 0.05);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitBid();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleToggleTimer();
      } else if (e.key === 'Escape') {
        setConfirmDialog(null);
        setIsSelectPlayerModalOpen(false);
        setPlayerSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTeamId, confirmedNextBidAmount, timerRunning, isMuted, playTone]);

  // Format timer
  const formattedTimer = `00:${timeLeft < 10 ? '0' : ''}${Math.max(0, timeLeft)}`;

  // Default display bids list if recentBids is empty
  const displayRecentBids = recentBids && recentBids.length > 0 ? recentBids : [
    { id: 'b1', bid_time: new Date().toISOString(), team_name: 'Thunder Bolts', player_name: currentPlayer?.name || 'Arjun Mehta', amount: 14000, team_id: 2, isLive: true },
    { id: 'b2', bid_time: new Date(Date.now() - 27000).toISOString(), team_name: 'Ace Storm', player_name: currentPlayer?.name || 'Arjun Mehta', amount: 12000, team_id: 1 },
    { id: 'b3', bid_time: new Date(Date.now() - 44000).toISOString(), team_name: 'Thunder Bolts', player_name: currentPlayer?.name || 'Arjun Mehta', amount: 10000, team_id: 2 }
  ];

  return (
    <div className="bg-[#0a0d14] text-slate-100 min-h-screen flex flex-col font-sans select-none antialiased">
      {/* Action Notice Floating Alert */}
      {actionNotice && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 border text-xs font-bold transition-all animate-bounce ${
            actionNotice.type === 'error'
              ? 'bg-red-950/90 text-red-300 border-red-500/50'
              : 'bg-emerald-950/90 text-brand-neon border-emerald-500/50'
          }`}
        >
          <span>{actionNotice.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* BEGIN: TopBar */}
      <header className="h-14 border-b border-brand-border bg-[#0f141f] px-4 flex items-center justify-between z-30 shrink-0" data-purpose="top-navigation-bar">
        {/* Brand Identity & Session Mode */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate && onNavigate('/admin')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-brand-neon font-black text-lg shadow-inner">
              🎾
            </div>
            <div>
              <span className="font-black text-sm tracking-wider uppercase text-white">TENNIS AUCTION</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-brand-neon border border-emerald-500/30 uppercase tracking-wide">
                Live Desk
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-brand-border"></div>

          {/* Role Selector Dropdown Simulator */}
          <div className="relative">
            <div
              onClick={() => setShowRoleMenu(prev => !prev)}
              className="flex items-center bg-[#182133] hover:bg-[#1d273c] border border-brand-border px-3 py-1.5 rounded-md cursor-pointer transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_#34d399]"></span>
              <span className="text-xs text-slate-400 font-medium">ROLE:</span>
              <span className="ml-1.5 text-xs font-semibold text-emerald-300">Master Admin Control</span>
              <svg className="w-3.5 h-3.5 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>

            {showRoleMenu && (
              <div className="absolute top-full mt-1 left-0 w-48 bg-[#111722] border border-brand-border rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { setShowRoleMenu(false); onNavigate && onNavigate('/admin'); }}
                  className="w-full text-left px-3 py-2 text-emerald-300 font-semibold hover:bg-slate-800"
                >
                  Master Admin Control
                </button>
                <button
                  onClick={() => { setShowRoleMenu(false); onNavigate && onNavigate('/team/1'); }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Team 1 (Ace Storm)
                </button>
                <button
                  onClick={() => { setShowRoleMenu(false); onNavigate && onNavigate('/team/2'); }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Team 2 (Thunder Bolts)
                </button>
                <button
                  onClick={() => { setShowRoleMenu(false); onNavigate && onNavigate('/display'); }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Digital TV LED Display
                </button>
              </div>
            )}
          </div>

          {/* Quick Timer Desk Widget */}
          <div
            onClick={handleToggleTimer}
            className={`flex items-center space-x-2 bg-[#141b29] border border-brand-border/80 px-3 py-1 rounded-md cursor-pointer hover:border-amber-400/50 transition ${
              timerRunning ? 'ring-1 ring-amber-400/30' : ''
            }`}
            title="Click to Pause/Resume Countdown"
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Gavel Timer:</span>
            <span className={`font-mono text-sm font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} id="desk-timer">
              {formattedTimer}
            </span>
            <button
              onClick={handleResetTimer}
              className="text-slate-400 hover:text-white text-xs px-1 hover:bg-slate-700/50 rounded"
              title="Reset Timer"
            >
              ↺
            </button>
          </div>
        </div>

        {/* Live Network, Broadcast Status & User Profile */}
        <div className="flex items-center space-x-4">
          {/* Sync Status with TV Display */}
          <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-300">
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-brand-neon live-pulse' : 'bg-red-500'}`}></span>
            <span>BIG SCREEN: {isSocketConnected ? 'CONNECTED (0.12s)' : 'RECONNECTING...'}</span>
          </div>

          {/* Latency Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-brand-surface border border-brand-border px-2.5 py-1 rounded">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Latency: <strong className="text-slate-200">11ms</strong></span>
          </div>

          {/* Volume Alert Toggle */}
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`w-8 h-8 rounded bg-brand-surface border border-brand-border flex items-center justify-center hover:bg-slate-800 transition ${
              isMuted ? 'text-slate-500' : 'text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Gavel Audio' : 'Mute Gavel Audio'}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            )}
          </button>

          {/* Admin Avatar */}
          <div
            onClick={() => {
              if (window.confirm('Sign out from Admin Control Panel?')) {
                logout();
                if (onNavigate) onNavigate('/login');
              }
            }}
            className="flex items-center space-x-2 pl-2 border-l border-brand-border cursor-pointer"
            title={`Logged in as ${currentUser?.full_name || 'Tournament Director'} (Click to Logout)`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d131f] rounded-full flex items-center justify-center text-[11px] font-bold text-slate-200">
                AM
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* END: TopBar */}

      {/* BEGIN: AppLayout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* BEGIN: LeftSidebar Navigation */}
        <aside className="w-56 bg-[#0c1017] border-r border-brand-border flex flex-col justify-between shrink-0 select-none" data-purpose="sidebar-navigation">
          <nav className="p-3 space-y-1">
            {/* Live Bidding (Active item) */}
            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-brand-neon font-medium text-xs shadow-sm transition"
              href="#"
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/admin'); }}
            >
              <svg className="w-4 h-4 text-brand-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="tracking-wide font-semibold">Live Bidding Desk</span>
            </a>

            {/* Player Pool */}
            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 font-medium text-xs transition"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateToPlayers) onNavigateToPlayers();
                else if (onNavigate) onNavigate('/admin/players');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Player Pool ({totalPoolCount})</span>
            </a>

            {/* Team Squads */}
            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 font-medium text-xs transition"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/team/1');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Team Rosters</span>
            </a>

            {/* TV Broadcast View Link */}
            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 font-medium text-xs transition"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenDisplay) onOpenDisplay();
                else window.open('/display', '_blank');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="flex-1">TV Display Window</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↗</span>
            </a>

            {/* Switch Role */}
            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 font-medium text-xs transition"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/login');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Switch Terminal</span>
            </a>
          </nav>

          {/* Bottom System Status in Sidebar */}
          <div className="p-3 border-t border-brand-border space-y-2 bg-[#0a0d13]">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>SYS.v2.4.0</span>
              <span className="flex items-center text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-neon mr-1"></span> ONLINE
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              Press keys <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">1</kbd>-<kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">4</kbd> for rapid team bid
            </div>
          </div>
        </aside>
        {/* END: LeftSidebar Navigation */}

        {/* BEGIN: MainContent Area */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 gap-4" data-purpose="desk-operator-interface">
          {/* TOP SECTION: Two Columns (Hero Current Player & 4 Teams Panel) */}
          <div className="grid grid-cols-12 gap-4 shrink-0">
            {/* Current Player on Auction Block (Col 1-7) */}
            <section className="col-span-12 xl:col-span-7 bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden" data-purpose="player-auction-card">
              {/* Subtle Glow Backdrop */}
              <div className="absolute -right-16 -top-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                {/* Top Status Indicator Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-brand-border/70 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-brand-neon border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider rounded">
                      LOT #{currentPlayer?.player_number ? String(currentPlayer.player_number).replace(/[^0-9]/g, '') || '27' : '27'} ON AUCTION BLOCK
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      CATEGORY: {(currentPlayer?.category || 'A+ MARQUEE').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400">Current Leader:</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-bold uppercase tracking-wide flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 animate-ping"></span>
                      {currentLeaderName}
                    </span>
                  </div>
                </div>

                {/* Main Player Info & Stats Block */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Player Photo & Badge Container */}
                  <div
                    onClick={() => {
                      setIsSelectPlayerModalOpen(true);
                      setPlayerSearchQuery('');
                    }}
                    className="col-span-5 relative rounded-lg overflow-hidden border border-brand-border bg-slate-900 group aspect-[4/3] max-h-52 cursor-pointer"
                    title="Click to Select/Cue Athlete"
                  >
                    <img
                      alt={currentPlayer?.name || 'Athlete on Auction'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                      src={currentPlayer?.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHUR6e5MGJWiP53V8dMt4q3wmnRXjU3jddMZOWVTJBTldJMqNS-pX9uuX3_64VUikbqEmhFrsAICnZaE-6DST7RYJgBnc3WTDeQJpFXRJJ80q1m-9SzmJmWHFKqgNm1Xi2BYbhU_pdPCYdkblmjVRmPxkYawRRfLVsogh7Ns1y8g1CVAMJwYWHMwienVq2jKXXIRWS5XuWqO0DaFuRd2HsgM_XSXva2aZzrfKPVXQzBTRGvvldG5s'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-300 uppercase bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                        SEED #{currentPlayer?.world_ranking ? String(currentPlayer.world_ranking).padStart(2, '0') : '148'}
                      </span>
                      <h2 className="text-lg font-black text-white leading-tight mt-0.5 tracking-wide">
                        {currentPlayer?.name || 'Arjun Mehta'}
                      </h2>
                      <div className="flex items-center text-[11px] text-slate-300 mt-0.5 space-x-1">
                        <span>{currentPlayer?.country_flag || '🇮🇳'} {currentPlayer?.country || 'India'}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{currentPlayer?.category || 'Singles Pro'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Current Financial Status */}
                  <div className="col-span-7 flex flex-col justify-between space-y-3">
                    {/* Performance KPI Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-brand-card border border-brand-border rounded-lg p-2">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">ATP Rank</span>
                        <span className="text-base font-black text-white font-mono">
                          #{currentPlayer?.world_ranking || '148'}
                        </span>
                      </div>
                      <div className="bg-brand-card border border-brand-border rounded-lg p-2">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Win Rate</span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {currentPlayer?.win_percentage || 68}%
                        </span>
                      </div>
                      <div className="bg-brand-card border border-brand-border rounded-lg p-2">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Aces Season</span>
                        <span className="text-base font-black text-cyan-400 font-mono">
                          {currentPlayer?.aces || 87}
                        </span>
                      </div>
                    </div>

                    {/* Current Price & Bid Step Matrix */}
                    <div className="bg-[#141c2c] border border-brand-border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 uppercase tracking-wide">Base Value</span>
                        <span className="font-mono text-slate-300 font-bold">
                          {formatCurrency(currentPlayer?.base_price || 10000)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-brand-border/60">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                            CURRENT HIGHEST BID
                          </span>
                          <span className="text-2xl font-black font-mono text-brand-neon tracking-tight drop-shadow-[0_0_8px_rgba(0,230,118,0.3)]">
                            {Number(currentBid).toLocaleString()} <span className="text-xs font-sans text-slate-300">PTS</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-slate-400 font-medium block">Bid Increment</span>
                          <span className="text-sm font-bold font-mono text-cyan-300">+{Number(selectedIncrement).toLocaleString()} PTS</span>
                        </div>
                      </div>
                    </div>

                    {/* Play Attributes Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {currentPlayer?.playing_hand || 'Right Handed'}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        Hard Court Spec
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        Clutch Tiebreaks
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operator Gavel Action Control Strip (UNDO BID removed, NEXT opens Player Selection) */}
              <div className="pt-4 border-t border-brand-border/80 mt-3 flex items-center justify-between gap-3" data-purpose="operator-gavel-actions">
                {/* Mark Sold Button */}
                <button
                  onClick={handleMarkSold}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
                  title="Sell player to current leader"
                >
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                  <span>MARK SOLD ({currentLeaderName.toUpperCase()})</span>
                </button>

                {/* Mark Unsold Button */}
                <button
                  onClick={handleMarkUnsold}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 hover:text-red-300 active:scale-[0.98] transition cursor-pointer"
                  title="Mark player unsold and move to pool"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>UNSOLD</span>
                </button>

                {/* Next Player Button -> Opens Player Selection Interface */}
                <button
                  onClick={() => {
                    setIsSelectPlayerModalOpen(true);
                    setPlayerSearchQuery('');
                  }}
                  className="bg-brand-card hover:bg-[#202b40] text-slate-200 border border-brand-border font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 transition cursor-pointer"
                  title="Select next player from player pool"
                >
                  <span>NEXT PLAYER</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </section>

            {/* Four Teams Live Desk Grid (Col 8-12) */}
            <section className="col-span-12 xl:col-span-5 flex flex-col justify-between space-y-2.5" data-purpose="four-teams-desk">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center">
                  <span className="w-2 h-2 rounded bg-cyan-400 mr-2"></span> FRANCHISE TEAMS (PADDLE DESK)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Click team or press <strong className="text-emerald-400">1-4</strong> to bid
                </span>
              </div>

              {/* Map through the 4 teams */}
              {activeTeams.map((team, idx) => {
                const teamNum = idx + 1;
                const isLeading = highestTeam ? highestTeam.id === team.id : (teamNum === 2);
                const isSelected = selectedTeamId === team.id;
                const totalPurse = team.total_purse || 100000;
                const remaining = team.purse_remaining !== undefined ? team.purse_remaining : (teamNum === 1 ? 78000 : teamNum === 2 ? 62000 : teamNum === 3 ? 88000 : 100000);
                const spent = Math.max(0, totalPurse - remaining);
                const squadCount = team.players_bought !== undefined ? team.players_bought : (teamNum === 1 ? 2 : teamNum === 2 ? 3 : teamNum === 3 ? 1 : 0);

                const teamColorStyles = {
                  1: { border: 'hover:border-cyan-500/60', badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40', btn: 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 border-blue-500/40' },
                  2: { border: 'hover:border-purple-500/60', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', btn: 'bg-purple-600 hover:bg-purple-500 text-white' },
                  3: { border: 'hover:border-amber-500/60', badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', btn: 'bg-amber-600/30 hover:bg-amber-600 text-amber-200 border-amber-500/40' },
                  4: { border: 'hover:border-emerald-500/60', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', btn: 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 border-emerald-500/40' }
                }[teamNum] || { border: 'hover:border-slate-500', badgeBg: 'bg-slate-700 text-slate-300', btn: 'bg-slate-700 text-white' };

                if (isLeading) {
                  return (
                    <div
                      key={team.id || idx}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`bg-brand-surface border-2 border-brand-neon paddle-active rounded-lg p-2.5 cursor-pointer transition flex items-center justify-between group relative shadow-lg shadow-emerald-950/30 ${
                        isSelected ? 'ring-1 ring-emerald-400' : ''
                      }`}
                      data-purpose={`team-card-${teamNum}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-md ${teamColorStyles.badgeBg} font-mono font-bold flex items-center justify-center border text-xs`}>
                          [{teamNum}]
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-purple-200">{team.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40 font-semibold">
                              LEAD BIDDER
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              Squad: {squadCount}/5
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center space-x-2 mt-0.5 font-mono">
                            <span>Bid: {formatCurrency(currentBid)}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">Purse: {formatCurrency(remaining)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Paddle Up Indicator (Active) */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-brand-neon font-black uppercase tracking-wider flex items-center border border-emerald-500/40">
                          ✋ PADDLE UP
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeamId(team.id);
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded bg-purple-600 hover:bg-purple-500 text-white shadow transition"
                        >
                          Leading
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={team.id || idx}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`bg-brand-surface border rounded-lg p-2.5 cursor-pointer transition flex items-center justify-between group relative ${
                      isSelected
                        ? 'border-brand-neon/80 bg-brand-surface/90 shadow-md ring-1 ring-brand-neon/40'
                        : `border-brand-border ${teamColorStyles.border}`
                    }`}
                    data-purpose={`team-card-${teamNum}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-md ${teamColorStyles.badgeBg} font-mono font-bold flex items-center justify-center border text-xs`}>
                        [{teamNum}]
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition">
                            {team.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Squad: {squadCount}/5
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5 font-mono">
                          <span>Spent: {formatCurrency(spent)}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">Purse: {formatCurrency(remaining)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Paddle Status & Quick Action Button */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-500 font-semibold uppercase">
                        {teamNum === 4 ? (
                          <span className="text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">Ready</span>
                        ) : 'Idle'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeamId(team.id);
                          handleSubmitBid(team.id, currentBid + selectedIncrement);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded border transition ${teamColorStyles.btn}`}
                        title={`Raise bid immediately to ${formatCurrency(currentBid + selectedIncrement)} for ${team.name}`}
                      >
                        + Raise
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* BOTTOM SECTION: Rapid Bid Entry & Big Screen Broadcast / Live Audit Log */}
          <div className="grid grid-cols-12 gap-4 flex-1 items-stretch">
            {/* Live Bid Audit Log & Big Screen Live Preview (Col 1-7) */}
            <div className="col-span-12 xl:col-span-7 flex flex-col gap-4">
              {/* Audit Log Component */}
              <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 flex flex-col flex-1" data-purpose="bid-audit-log">
                <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Real-Time Audit &amp; Bid Feed
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 live-pulse"></span> AUTO-SYNCING
                    </span>
                  </div>
                </div>

                {/* Table of recent bids */}
                <div className="overflow-x-auto mt-2 flex-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-brand-border/60 uppercase font-mono text-[10px]">
                        <th className="py-1.5 px-2">Time</th>
                        <th className="py-1.5 px-2">Team</th>
                        <th className="py-1.5 px-2">Player</th>
                        <th className="py-1.5 px-2">Bid Amount</th>
                        <th className="py-1.5 px-2 text-right">Display Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40 font-mono text-[11px]">
                      {displayRecentBids.map((bid, index) => {
                        const isLatest = index === 0;
                        const timeStr = bid.bid_time
                          ? new Date(bid.bid_time).toTimeString().split(' ')[0]
                          : '09:16:42';

                        const teamName = bid.team_name || (bid.team_id ? activeTeams.find(t => t.id === bid.team_id)?.name : 'Franchise Team');
                        const isThunder = String(teamName).includes('Thunder');
                        const isAce = String(teamName).includes('Ace');

                        return (
                          <tr
                            key={bid.id || index}
                            className={`transition ${isLatest ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-slate-800/30'}`}
                          >
                            <td className="py-2 px-2 text-slate-400">{timeStr}</td>
                            <td className={`py-2 px-2 font-bold ${isThunder ? 'text-purple-400' : isAce ? 'text-blue-400' : 'text-emerald-400'}`}>
                              {teamName}
                            </td>
                            <td className="py-2 px-2 text-slate-200">
                              {bid.player_name || currentPlayer?.name || 'Arjun Mehta'}
                            </td>
                            <td className={`py-2 px-2 font-black ${isLatest ? 'text-brand-neon' : 'font-bold text-slate-300'}`}>
                              {formatCurrency(bid.amount)}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {isLatest ? (
                                <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span> LIVE ON TV
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  Archived
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Undo Status / Footer Note */}
                <div className="pt-2 border-t border-brand-border/60 text-[10px] text-slate-500 flex justify-between">
                  <span>Bids are cryptographically timestamped</span>
                  <span className="text-slate-400">Session ID: <span className="font-mono text-cyan-400">#AUC-2026-TNN-04</span></span>
                </div>
              </div>

              {/* Live TV Broadcast Mini-Preview Card */}
              <div className="bg-brand-surface border border-brand-border rounded-xl p-3 flex items-center justify-between" data-purpose="tv-display-mini-preview">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 rounded bg-black border border-cyan-500/50 flex flex-col items-center justify-center text-[9px] font-mono text-cyan-300 shadow">
                    <span>TV OUT</span>
                    <span className="text-[8px] text-emerald-400">1080p</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Audience Big Screen Preview</span>
                    <span className="text-[11px] text-slate-400">
                      Showing: {currentPlayer?.name || 'Arjun Mehta'} • Current Bid {formatCurrency(currentBid)} ({currentLeaderName})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onOpenDisplay) onOpenDisplay();
                    else window.open('/display', '_blank');
                  }}
                  className="text-xs bg-brand-card hover:bg-slate-800 border border-brand-border px-3 py-1.5 rounded-lg text-slate-300 flex items-center space-x-1 transition cursor-pointer"
                >
                  <span>Open Full Projector View</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            {/* Rapid Bid Entry Desk & Gavel Action (Col 8-12) */}
            <div className="col-span-12 xl:col-span-5 bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col justify-between" data-purpose="admin-override-bid-entry">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-brand-border mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-sm mr-2"></span> RAPID BID ENTRY &amp; SYNC CONSOLE
                  </h3>
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                    DESK HOTKEY ACTIVE
                  </span>
                </div>

                {/* Select Team Target */}
                <div className="space-y-1.5 mb-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Team</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeTeams.map((t, idx) => {
                      const num = idx + 1;
                      const isTarget = selectedTeamId === t.id;
                      const purseStr = formatShortK(t.purse_remaining);

                      if (isTarget) {
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTeamId(t.id)}
                            className="py-2 px-2.5 bg-purple-500/20 border-2 border-purple-400 rounded text-left flex items-center justify-between text-xs transition cursor-pointer"
                          >
                            <span className="font-black text-purple-200">{num}. {t.name}</span>
                            <span className="text-[10px] text-purple-300 font-mono">{purseStr}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTeamId(t.id)}
                          className="py-2 px-2.5 bg-brand-card border border-brand-border hover:border-slate-500 rounded text-left flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <span className="font-bold text-slate-200">{num}. {t.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{purseStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Bid Increments */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Quick Increments</span>
                    <span className="text-[10px] font-normal text-slate-500">Auto adds to current {Number(currentBid).toLocaleString()} PTS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1000, 2000, 5000, 10000].map((inc) => {
                      const isIncActive = selectedIncrement === inc;
                      return (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => {
                            setSelectedIncrement(inc);
                            setCustomBidInput('');
                          }}
                          className={`py-2 bg-brand-card hover:bg-slate-700/60 border rounded font-mono font-bold text-xs transition cursor-pointer ${
                            isIncActive
                              ? 'border-brand-neon text-brand-neon hover:border-emerald-400 ring-1 ring-emerald-500/30'
                              : 'border-brand-border text-cyan-300 hover:border-cyan-400'
                          }`}
                        >
                          +{inc.toLocaleString()} {inc === 2000 ? '★' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bid Input Field with Gavel Step */}
                <div className="space-y-1 mb-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Confirmed Next Bid Amount (PTS)
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-[#0d121c] border-2 border-brand-border focus:border-brand-neon rounded-lg py-2 px-3 text-lg font-mono font-black text-brand-neon tracking-wide focus:outline-none focus:ring-0"
                      type="text"
                      value={customBidInput !== '' ? customBidInput : confirmedNextBidAmount.toLocaleString()}
                      onChange={(e) => setCustomBidInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmitBid();
                        }
                      }}
                      placeholder={confirmedNextBidAmount.toLocaleString()}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold font-mono">
                      PTS
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 px-1 pt-0.5 font-mono">
                    <span>Min Recommended: <strong className="text-slate-200">{formatCurrency(minRecommendedBid)}</strong></span>
                    <span>Team Purse After: <strong className="text-emerald-400">{formatCurrency(teamPurseAfter)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Mega Action: Submit & Sync to Live Screen */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSubmitBid()}
                  className="w-full bg-brand-neon hover:bg-brand-neonHover text-slate-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition duration-150 cursor-pointer"
                  data-purpose="submit-bid-button"
                >
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                  <span>SUBMIT &amp; SYNC TO TV SCREEN (ENTER)</span>
                </button>
                {/* Desk Safe Guard Notice */}
                <p className="text-[10px] text-center text-slate-500">
                  Instant sync broadcasting to live stream. Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[9px]">Space</kbd> for Gavel Count 1-2-3.
                </p>
              </div>
            </div>
          </div>
        </main>
        {/* END: MainContent Area */}
      </div>
      {/* END: AppLayout Body */}

      {/* Confirmation Modal Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111722] border border-brand-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black tracking-wide text-white uppercase">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  cb();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-colors shadow-lg ${confirmDialog.actionColor || 'bg-brand-neon text-black'}`}
              >
                {confirmDialog.actionText || 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Next Player Modal Interface */}
      {isSelectPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111722] border border-brand-border rounded-2xl p-5 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-neon live-pulse"></span>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  SELECT NEXT PLAYER
                </h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {eligiblePlayers.length} Available
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSelectPlayerModalOpen(false);
                  setPlayerSearchQuery('');
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative mb-3">
              <input
                type="text"
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                placeholder="Search player by name, rank, country, category..."
                className="w-full bg-[#0d121c] border border-brand-border focus:border-brand-neon rounded-lg py-2.5 pl-9 pr-8 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 transition"
                autoFocus
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              {playerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPlayerSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Player List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {eligiblePlayers.length > 0 ? (
                eligiblePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 rounded-xl bg-[#161e2e] flex items-center justify-between border border-brand-border hover:border-brand-neon/60 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.image_url}
                        alt={player.name}
                        className="w-11 h-11 rounded-lg object-cover border border-brand-border bg-slate-900 group-hover:scale-105 transition"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            #{player.world_ranking ? String(player.world_ranking).padStart(2, '0') : (player.player_number || '01')}
                          </span>
                          <span className="font-bold text-white text-sm group-hover:text-brand-neon transition">
                            {player.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{player.country_flag || '🌐'} {player.country || 'International'}</span>
                          <span> · </span>
                          <span className="text-slate-300">{player.category || 'Singles'}</span>
                          <span> · </span>
                          <span className="text-emerald-300 font-semibold">Base {formatCurrency(player.base_price)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPlayer(player)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black transition-all text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      SELECT
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {playerSearchQuery ? `No players found matching "${playerSearchQuery}"` : 'No available upcoming players in the pool.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
