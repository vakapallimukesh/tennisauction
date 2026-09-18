import React, { useState, useEffect, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function DigitalAuctionDisplay({ onNavigate }) {
  const {
    auction,
    currentPlayer,
    teams,
    upcomingPlayers,
    soldPlayers,
    recentBids,
    timeLeft,
    timerRunning,
    soldCelebration,
    unsoldNotice,
    playerIntro,
    isSocketConnected,
    sponsors
  } = useAuction();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format points helpers
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0 pts';
    return Number(val).toLocaleString('en-IN') + ' pts';
  };

  const formatLakhs = (val) => {
    if (val === undefined || val === null) return '0 pts';
    return Number(val).toLocaleString('en-IN') + ' pts';
  };

  const formatLakhsShort = (val) => {
    if (val === undefined || val === null) return '0 pts';
    return Number(val).toLocaleString('en-IN') + ' pts';
  };

  // Full comprehensive active player resolution
  const activePlayer = useMemo(() => {
    const base = currentPlayer || {
      id: 1,
      player_number: 'PLAYER #07',
      name: 'Arjun Mehta',
      age: 22,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group A',
      playing_hand: 'Right Hand',
      world_ranking: 14,
      wins: 32,
      aces: 87,
      matches: 47,
      win_percentage: 68,
      base_price: 10000,
      image_url: '/images/players/arjun-mehta.jpg'
    };

    return {
      ...base,
      image_url: base.image_url || '/images/players/arjun-mehta.jpg'
    };
  }, [currentPlayer]);

  // Complete All 4 Teams Data
  const displayTeams = useMemo(() => {
    const baseTeams = [
      {
        id: 1, team_number: 1, name: 'Team A',
        short_name: 'TEAM A', owner: 'Rohan Iyer',
        total_purse: 1000000, purse_remaining: 1000000, spent: 0,
        max_players: 8, players_bought: 0, players: []
      },
      {
        id: 2, team_number: 2, name: 'Team B',
        short_name: 'TEAM B', owner: 'Vikramaditya Roy',
        total_purse: 1000000, purse_remaining: 1000000, spent: 0,
        max_players: 8, players_bought: 0, players: []
      },
      {
        id: 3, team_number: 3, name: 'Team C',
        short_name: 'TEAM C', owner: 'Maya Sengupta',
        total_purse: 1000000, purse_remaining: 1000000, spent: 0,
        max_players: 8, players_bought: 0, players: []
      },
      {
        id: 4, team_number: 4, name: 'Team D',
        short_name: 'TEAM D', owner: 'Kabir Malhotra',
        total_purse: 1000000, purse_remaining: 1000000, spent: 0,
        max_players: 8, players_bought: 0, players: []
      }
    ];

    if (!teams || teams.length === 0) return baseTeams;

    return baseTeams.map(bt => {
      const live = teams.find(t => t.id === bt.id);
      if (!live) return bt;
      const totalPurse = live.total_purse !== undefined ? live.total_purse : bt.total_purse;
      const purseLeft = live.purse_remaining !== undefined ? live.purse_remaining : totalPurse;
      const spent = totalPurse - purseLeft;
      const rosterCount = live.players_bought !== undefined ? live.players_bought : (live.roster?.length || 0);
      return {
        ...bt,
        ...live,
        name: live.name || bt.name,
        short_name: bt.short_name,
        tagline: live.tagline || bt.tagline,
        total_purse: totalPurse,
        purse_remaining: purseLeft,
        spent: spent,
        players_bought: rosterCount,
        max_players: live.max_players || bt.max_players,
        players: live.players || live.roster || bt.players
      };
    });
  }, [teams]);

  // Leading franchise resolution
  const highestBidderId = auction?.highest_bidder_team_id;
  const highestTeam = highestBidderId
    ? displayTeams.find(t => t.id === highestBidderId)
    : null;

  const currentBid = auction?.current_bid || activePlayer.base_price || 10000;
  const bidIncrement = auction?.bid_increment || 2000;

  // Team badge colors
  const teamBadgeColors = [
    { bg: 'bg-blue-100', text: 'text-blue-700', label: 'TA', border: 'border-blue-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', label: 'TB', border: 'border-amber-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', label: 'TC', border: 'border-purple-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'TD', border: 'border-emerald-200' }
  ];

  // Determine sold player count for LOT number
  const lotNumber = String(
    (soldPlayers?.length || 0) + (activePlayer?.display_order || activePlayer?.id || 1)
  ).padStart(3, '0');

  return (
    <div
      className="bg-[#cfd8dc] text-slate-900 antialiased flex flex-col justify-between min-h-screen"
      style={{
        fontFamily: "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif",
        height: '100vh',
        maxHeight: '1080px'
      }}
    >
      {/* ===== NEW PLAYER INTRO OVERLAY (10 seconds) ===== */}
      {playerIntro && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', backgroundColor: 'rgba(15, 23, 42, 0.55)' }}>
          <div className="flex flex-col items-center text-center">
            {/* Player Photo — slides from right to center */}
            <div
              className="w-64 h-64 xl:w-72 xl:h-72 rounded-full border-[5px] border-white/90 shadow-2xl overflow-hidden mb-8 bg-slate-700"
              style={{
                animation: 'slideFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                boxShadow: '0 0 80px rgba(255,255,255,0.15), 0 25px 50px rgba(0,0,0,0.4)'
              }}
            >
              {playerIntro.image_url ? (
                <img
                  src={playerIntro.image_url}
                  alt={playerIntro.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-600">
                  <svg className="w-28 h-28 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            {/* NOW ON STAGE label */}
            <div className="flex items-center gap-3 mb-4" style={{ animation: 'fadeUpIn 0.6s ease-out 0.5s both' }}>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-base font-black tracking-[0.35em] uppercase text-emerald-400 drop-shadow-lg">NOW ON STAGE</span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            {/* Player Name */}
            <h1
              className="text-6xl xl:text-8xl font-black text-white uppercase tracking-tight mb-4 font-display"
              style={{ animation: 'fadeUpIn 0.7s ease-out 0.7s both', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            >
              {playerIntro.name || 'PLAYER'}
            </h1>
            {/* Category Badge */}
            <div className="flex items-center gap-4 mt-1" style={{ animation: 'fadeUpIn 0.6s ease-out 0.95s both' }}>
              <span className="px-8 py-2.5 rounded-full bg-white/10 border-2 border-white/25 text-white text-xl font-bold uppercase tracking-widest backdrop-blur-sm shadow-lg">
                {playerIntro.category || 'Group A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== SOLD CELEBRATION OVERLAY ===== */}
      {soldCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', backgroundColor: 'rgba(6, 78, 59, 0.55)' }}>
          <div className="flex flex-col items-center text-center">
            {/* Player Photo — slides from right */}
            <div
              className="w-56 h-56 xl:w-64 xl:h-64 rounded-full border-[5px] border-emerald-300/90 shadow-2xl overflow-hidden mb-6 bg-slate-700"
              style={{
                animation: 'slideFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                boxShadow: '0 0 80px rgba(34, 197, 94, 0.4), 0 25px 50px rgba(0,0,0,0.4)'
              }}
            >
              {soldCelebration.player_image ? (
                <img
                  src={soldCelebration.player_image}
                  alt={soldCelebration.player_name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-900">
                  <span className="text-7xl">🎾</span>
                </div>
              )}
            </div>
            {/* SOLD Badge */}
            <div
              className="px-10 py-2.5 rounded-full bg-emerald-500 shadow-lg mb-4"
              style={{ animation: 'fadeUpIn 0.5s ease-out 0.5s both' }}
            >
              <h1 className="text-5xl xl:text-7xl font-black text-white uppercase tracking-wider font-display" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>SOLD!</h1>
            </div>
            {/* Player Name */}
            <p
              className="text-3xl xl:text-5xl font-black text-white mb-4 tracking-tight"
              style={{ animation: 'fadeUpIn 0.6s ease-out 0.7s both', textShadow: '0 3px 20px rgba(0,0,0,0.4)' }}
            >
              {soldCelebration.player_name || 'Player'}
            </p>
            {/* Team Name */}
            <p
              className="text-2xl xl:text-3xl text-emerald-200 font-bold mb-3"
              style={{ animation: 'fadeUpIn 0.5s ease-out 0.9s both' }}
            >
              Sold to <strong className="text-white font-black">{soldCelebration.team_name || 'Team'}</strong>
            </p>
            {/* Amount */}
            <div
              className="px-8 py-3 rounded-xl bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg"
              style={{ animation: 'fadeUpIn 0.6s ease-out 1.1s both' }}
            >
              <span className="text-5xl xl:text-6xl font-black text-white font-display" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.3)' }}>{formatCurrency(soldCelebration.amount)}</span>
            </div>
            <span
              className="text-base text-emerald-300 font-bold mt-2"
              style={{ animation: 'fadeUpIn 0.4s ease-out 1.3s both' }}
            >({formatCurrency(soldCelebration.amount)})</span>
          </div>
        </div>
      )}

      {/* ===== UNSOLD NOTICE OVERLAY ===== */}
      {unsoldNotice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', backgroundColor: 'rgba(127, 29, 29, 0.45)' }}>
          <div className="flex flex-col items-center text-center">
            {/* Player Photo — slides from right with red tint */}
            <div
              className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-full border-[5px] border-red-400/70 shadow-2xl overflow-hidden mb-6"
              style={{
                animation: 'slideFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                boxShadow: '0 0 70px rgba(239, 68, 68, 0.35), 0 25px 50px rgba(0,0,0,0.4)'
              }}
            >
              {unsoldNotice.player_image ? (
                <img
                  src={unsoldNotice.player_image}
                  alt={unsoldNotice.player_name}
                  className="w-full h-full object-cover object-top opacity-70"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <svg className="w-24 h-24 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {/* Red X overlay on photo */}
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/30">
                <span className="text-8xl font-black text-red-400 drop-shadow-lg opacity-80">✕</span>
              </div>
            </div>
            {/* UNSOLD label */}
            <h1
              className="text-5xl xl:text-7xl font-black text-red-400 uppercase tracking-wider mb-4 font-display"
              style={{ animation: 'fadeUpIn 0.6s ease-out 0.5s both', textShadow: '0 4px 25px rgba(239, 68, 68, 0.4)' }}
            >UNSOLD</h1>
            {/* Player Name */}
            <p
              className="text-3xl xl:text-4xl font-black text-white/90 mb-3"
              style={{ animation: 'fadeUpIn 0.6s ease-out 0.75s both', textShadow: '0 3px 20px rgba(0,0,0,0.4)' }}
            >
              {unsoldNotice.player_name || 'Player'}
            </p>
            <p
              className="text-xl text-red-300/80 font-bold"
              style={{ animation: 'fadeUpIn 0.5s ease-out 0.95s both' }}
            >No buyer this round</p>
          </div>
        </div>
      )}

      {/* ===== TOP BAR ===== */}
      <header className="w-full bg-[#dbe2e6] border-b-2 border-slate-700/80 py-2.5 px-6 shadow-sm shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          {/* Left: Live Status & Stadium Arena */}
          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-block w-3 h-3 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono tracking-wider">
              LIVE STADIUM ARENA
            </span>
          </div>

          {/* Middle: Big Prominent League Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-wider text-slate-900 font-display">
              Bhimavaram Tennis League
            </h1>
          </div>

          {/* Right: Fullscreen & 3-Bar Menu */}
          <div className="text-right flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="text-slate-500 hover:text-slate-800 transition p-1.5 rounded hover:bg-slate-300"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('/admin');
                else window.location.href = '/admin';
              }}
              className="text-slate-600 hover:text-slate-900 transition p-1.5 rounded hover:bg-slate-300"
              title="Menu"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN AUCTION STAGE ===== */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-slate-100 border-x-2 border-slate-700">

        {/* ===== LEFT: 4 TEAM COLUMNS (8 cols) ===== */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-700 border-r-2 border-slate-700 bg-[#e2e8f0]">
          {displayTeams.map((team, idx) => {
            const isLeading = highestTeam?.id === team.id;
            const totalPurse = team.total_purse || 1000000;
            const remaining = team.purse_remaining || 0;
            const spent = Math.max(0, totalPurse - remaining);
            const squadCount = team.players_bought || team.players?.length || 0;
            const maxSquad = team.max_players || 8;
            const badge = teamBadgeColors[idx] || teamBadgeColors[0];
            const teamPlayers = team.players || [];
            const groupAPlayers = teamPlayers.filter(p => {
              const cat = (p.category || '').toLowerCase().trim();
              return !cat.includes('group b') && !cat.includes('gruop b');
            });
            const groupBPlayers = teamPlayers.filter(p => {
              const cat = (p.category || '').toLowerCase().trim();
              return cat.includes('group b') || cat.includes('gruop b');
            });

            return (
              <article
                key={team.id}
                className={`flex flex-col h-full p-4 relative ${isLeading
                  ? 'bg-emerald-50/70 border-2 border-emerald-600'
                  : 'bg-[#f8fafc]'
                  }`}
              >
                {/* Team Header & Amount Box */}
                <div className={`pb-3 text-center bg-white rounded-lg p-3 shadow-sm border ${isLeading
                    ? 'border-emerald-300 border-b-2 border-b-emerald-500 mt-1'
                    : 'border-slate-300 border-b-2 border-b-slate-700'
                  }`}>
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs mb-1 ${isLeading ? 'bg-emerald-200 text-emerald-900' : `${badge.bg} ${badge.text}`
                      }`}
                  >
                    {badge.label}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{team.short_name}</h2>
                  <div className={`mt-2 pt-2 ${isLeading ? 'border-t border-emerald-100' : 'border-t border-slate-200'}`}>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">points:</span>
                    <span className="text-xl xl:text-2xl font-black text-slate-900">{formatCurrency(remaining)}</span>
                    <div className="flex justify-center items-center text-[10px] text-slate-500 mt-1 font-semibold px-1">
                      <span>Squad: {squadCount}/{maxSquad}</span>
                    </div>
                  </div>
                </div>

                {/* Confirmed Roster with Group A & Group B Separation */}
                <div className="flex-1 flex flex-col justify-between mt-2.5 min-h-0">
                  <div className="flex-1 overflow-y-auto pr-0.5 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-300">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${isLeading ? 'text-emerald-900' : 'text-slate-700'}`}>
                        CONFIRMED ROSTER
                      </p>
                      <span className="text-[9px] font-bold text-slate-500">
                        {teamPlayers.length}/{maxSquad}
                      </span>
                    </div>

                    {/* GROUP A SECTION */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          <span className="text-[10px] font-black text-blue-950 uppercase tracking-wider font-display">GROUP A</span>
                        </div>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-200/80 text-blue-800">
                          {groupAPlayers.length}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {groupAPlayers.length > 0 ? (
                          groupAPlayers.map((p, pIdx) => (
                            <div
                              key={p.id || `ga-${pIdx}`}
                              className={`border rounded-lg p-1.5 flex items-center justify-between shadow-xs ${isLeading
                                ? 'border-emerald-300 bg-white'
                                : 'border-slate-300 bg-white'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={p.image_url || '/images/players/rohan-iyer.jpg'}
                                  alt={p.name || p.player_name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                                />
                                <div className="min-w-0">
                                  <div className="font-black text-slate-950 truncate text-[13px] md:text-sm leading-snug">
                                    {(p.name || p.player_name || '').split(' ').map((w, i) => i === 0 ? w[0] + '.' : w).join(' ')}
                                  </div>
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-bold uppercase">
                                    {p.category || 'Group A'}
                                  </span>
                                </div>
                              </div>
                              <span className="font-black text-slate-950 text-xs md:text-[13px] shrink-0 font-mono">
                                {formatLakhsShort(p.purchase_price || p.base_price)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-1.5 text-slate-400 text-[10px] italic bg-white/60 rounded border border-dashed border-slate-300">
                            No Group A acquired
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DRAW LINE BETWEEN GROUP A AND GROUP B */}
                    <div className="my-2 border-t-2 border-dashed border-slate-400"></div>

                    {/* GROUP B SECTION */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider font-display">GROUP B</span>
                        </div>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-800">
                          {groupBPlayers.length}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {groupBPlayers.length > 0 ? (
                          groupBPlayers.map((p, pIdx) => (
                            <div
                              key={p.id || `gb-${pIdx}`}
                              className={`border rounded-lg p-1.5 flex items-center justify-between shadow-xs ${isLeading
                                ? 'border-emerald-300 bg-white'
                                : 'border-slate-300 bg-white'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={p.image_url || '/images/players/rohan-iyer.jpg'}
                                  alt={p.name || p.player_name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                                />
                                <div className="min-w-0">
                                  <div className="font-black text-slate-950 truncate text-[13px] md:text-sm leading-snug">
                                    {(p.name || p.player_name || '').split(' ').map((w, i) => i === 0 ? w[0] + '.' : w).join(' ')}
                                  </div>
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                                    {p.category || 'Group B'}
                                  </span>
                                </div>
                              </div>
                              <span className="font-black text-slate-950 text-xs md:text-[13px] shrink-0 font-mono">
                                {formatLakhsShort(p.purchase_price || p.base_price)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-1.5 text-slate-400 text-[10px] italic bg-white/60 rounded border border-dashed border-slate-300">
                            No Group B acquired
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Footer Status - only shown when leading bidder */}
                  {isLeading && (
                    <div className="mt-2 pt-2 border-t border-emerald-300 shrink-0">
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md"
                          style={{ animation: 'pulseBid 2s infinite ease-in-out' }}
                          title="Holding Current Bid"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-900 mt-1 tracking-wider">
                          HOLDING {formatLakhs(currentBid)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* ===== RIGHT PANEL: Player Detail + Bidding (4 cols) ===== */}
        <section className="lg:col-span-4 flex flex-col p-4 xl:p-5 bg-white space-y-3 min-h-0 overflow-hidden font-display">
          {/* 1. TOP: Large Rectangular Player Photo — flexible height */}
          <div className="border-2 border-slate-700 rounded-lg bg-slate-200 overflow-hidden relative shadow-sm flex-1 min-h-0">
            {activePlayer.image_url ? (
              <img
                src={activePlayer.image_url}
                alt={activePlayer.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-300 via-slate-200 to-slate-300">
                <svg className="w-24 h-24 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] font-bold tracking-wide">
              ATP RANK #{activePlayer.world_ranking || '-'}
            </div>
          </div>

          {/* 2. Player Name Header — unboxed, spacious, and prominent */}
          <div className="text-center py-2 px-1 shrink-0">
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-950 tracking-tight uppercase font-display leading-tight">
              {activePlayer.name || 'AWAITING PLAYER'}
            </h2>
          </div>

          {/* 3. MIDDLE STRIP: [Base Price] & [Category] */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {/* Left: Base Price */}
            <div className="border-2 border-slate-700 rounded-lg p-2.5 bg-slate-50 text-center shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-0.5">BASE PRICE:</span>
              <span className="text-lg xl:text-xl font-black text-slate-900 font-display">{formatCurrency(activePlayer.base_price)}</span>
            </div>
            {/* Right: Category */}
            <div className="border-2 border-slate-700 rounded-lg p-2.5 bg-slate-50 text-center shadow-xs flex flex-col justify-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-0.5">CATEGORY:</span>
              <span className="text-lg xl:text-xl font-black text-slate-900 font-display uppercase">{activePlayer.category || 'Group A'}</span>
            </div>
          </div>

          {/* 4. BOTTOM: Bidding Container */}
          <div className="border-2 border-slate-700 rounded-lg p-4 bg-[#dbe2e6] shadow-md flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between border-b-2 border-slate-700/60 pb-1.5 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-800 font-display">BIDDING</span>
              <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE AUCTION
              </span>
            </div>
            {/* Current Highest Bid */}
            <div className="text-center py-2 bg-white rounded-lg border-2 border-slate-700 shadow-sm mb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">CURRENT HIGHEST BID:</span>
              <div className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight font-display">
                {formatCurrency(currentBid)}
              </div>
            </div>
            {/* Team Holding Bid */}
            <div className="flex items-center justify-between bg-white border-2 border-slate-700 rounded-lg px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-slate-500">TEAM:</span>
                <span className="text-sm font-black text-slate-900">
                  {highestTeam ? highestTeam.short_name : 'NO BIDS YET'}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${highestTeam
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-300 text-slate-600'
                }`}>
                {highestTeam ? 'LEADING' : 'WAITING'}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ===== BOTTOM SPONSORS BAR ===== */}
      <footer className="w-full bg-[#dbe2e6] border-t-2 border-slate-700/80 py-2.5 px-6 shadow-inner shrink-0">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-widest font-black uppercase text-slate-700 font-display">SPONSORS</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-800 font-bold uppercase tracking-wider text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
              <span className="font-extrabold tracking-normal text-slate-900">BNP PARIBAS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-full"></span>
              <span className="font-black text-slate-900">LACOSTE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-full"></span>
              <span className="font-black italic text-slate-900 tracking-tight">YONEX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <span className="font-extrabold text-slate-900">DUNLOP</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
              <span className="font-black tracking-widest text-slate-900">INFOSYS</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 font-bold text-center md:text-right uppercase tracking-wider">
          </div>
        </div>
      </footer>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes pulseBid {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideFromRight {
          0% { opacity: 0; transform: translateX(100vw) scale(0.6); }
          60% { opacity: 1; transform: translateX(-20px) scale(1.02); }
          80% { transform: translateX(8px) scale(0.99); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeUpIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpFadeIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>
    </div>
  );
}
