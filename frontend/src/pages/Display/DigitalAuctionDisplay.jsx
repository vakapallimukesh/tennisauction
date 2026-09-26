import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuction } from '../../context/AuctionContext';
import SpinningCounter from '../../components/SpinningCounter';
import LogoLoop from '../../components/LogoLoop';
import Player3DCube from '../../components/Player3DCube';

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
  const confettiCanvasRef = useRef(null);

  // Trigger light, elegant celebration sparks and fireworks when player is sold
  useEffect(() => {
    if (soldCelebration) {
      const colors = ['#22c55e', '#38bdf8', '#a855f7', '#f97316', '#eab308', '#ffffff'];

      // Function to fire clean confetti on overlay canvas or full document
      const triggerConfetti = (opts) => {
        if (confettiCanvasRef.current) {
          try {
            const customConfetti = confetti.create(confettiCanvasRef.current, {
              resize: true,
              useWorker: true
            });
            customConfetti(opts);
            return;
          } catch (e) {
            // fallback to global
          }
        }
        confetti({ ...opts, zIndex: 999999 });
      };

      // 1. Initial Gentle Sparkle Burst
      triggerConfetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: colors,
        startVelocity: 35,
        scalar: 0.95
      });

      // 2. Light, gentle side sparkle drifts (lower frequency & count)
      const duration = 3.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frameInterval = setInterval(() => {
        const remaining = animationEnd - Date.now();
        if (remaining <= 0) {
          return clearInterval(frameInterval);
        }

        // Gentle left/right floating sparks
        triggerConfetti({
          particleCount: 12,
          angle: 60,
          spread: 45,
          origin: { x: 0.05, y: 0.75 },
          colors: colors,
          shapes: ['circle', 'star'],
          scalar: 0.9
        });

        triggerConfetti({
          particleCount: 12,
          angle: 120,
          spread: 45,
          origin: { x: 0.95, y: 0.75 },
          colors: colors,
          shapes: ['circle', 'star'],
          scalar: 0.9
        });
      }, 480);

      return () => clearInterval(frameInterval);
    }
  }, [soldCelebration]);

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
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  const formatLakhs = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  const formatLakhsShort = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  // Full comprehensive active player resolution
  const activePlayer = useMemo(() => {
    if (currentPlayer) {
      return {
        ...currentPlayer,
        image_url: currentPlayer.image_url || ''
      };
    }

    return {
      id: null,
      player_number: 'PLAYER',
      name: '',
      age: 0,
      country: '',
      country_flag: '',
      category: 'Group A',
      playing_hand: '',
      world_ranking: 0,
      wins: 0,
      aces: 0,
      matches: 0,
      win_percentage: 0,
      base_price: 10000,
      image_url: ''
    };
  }, [currentPlayer]);

  // Complete All 4 Teams Data
  const displayTeams = useMemo(() => {
    const baseTeams = [
      {
        id: 1, team_number: 1, name: '7 Aces',
        short_name: '7 ACES', owner: 'Kabir Malhotra',
        total_purse: 500000, purse_remaining: 500000, spent: 0,
        max_players: 12, max_group_a: 4, max_group_b: 8, players_bought: 0, players: [],
        primary_color: '#374151'
      },
      {
        id: 2, team_number: 2, name: 'Royal Tigers',
        short_name: 'ROYAL TIGERS', owner: 'Vikramaditya Roy',
        total_purse: 500000, purse_remaining: 500000, spent: 0,
        max_players: 12, max_group_a: 4, max_group_b: 8, players_bought: 0, players: [],
        primary_color: '#16a34a'
      },
      {
        id: 3, team_number: 3, name: 'Mighty Dragons',
        short_name: 'MIGHTY DRAGONS', owner: 'Maya Sengupta',
        total_purse: 500000, purse_remaining: 500000, spent: 0,
        max_players: 12, max_group_a: 4, max_group_b: 8, players_bought: 0, players: [],
        primary_color: '#2563eb'
      },
      {
        id: 4, team_number: 4, name: 'Golden Eagles',
        short_name: 'GOLDEN EAGLES', owner: 'Rohan Iyer',
        total_purse: 500000, purse_remaining: 500000, spent: 0,
        max_players: 12, max_group_a: 4, max_group_b: 8, players_bought: 0, players: [],
        primary_color: '#dc2626'
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
        short_name: live.short_name || live.name || bt.short_name,
        logo_url: live.logo_url || bt.logo_url || '',
        tagline: live.tagline || bt.tagline,
        primary_color: live.primary_color || bt.primary_color,
        total_purse: totalPurse,
        purse_remaining: purseLeft,
        spent: spent,
        players_bought: rosterCount,
        max_players: live.max_players || bt.max_players,
        players: live.players || live.roster || bt.players
      };
    });
  }, [teams]);

  // Team boundary colors for live bidding: 7 aces: dark grey, royal tigers: green, mighty dragons: blue, golden eagles: red
  const getTeamBoundaryColor = (team) => {
    const id = team?.id || team?.team_number;
    const name = (team?.name || '').toLowerCase();
    if (id === 1 || name.includes('7 aces') || name.includes('aces')) return '#374151'; // dark grey
    if (id === 2 || name.includes('royal') || name.includes('tiger')) return '#16a34a'; // green
    if (id === 3 || name.includes('dragon')) return '#2563eb'; // blue
    if (id === 4 || name.includes('eagle')) return '#dc2626'; // red
    return team?.primary_color || '#374151';
  };

  // Team logo box background colors:
  // Royal Tigers: #002800, Golden Eagles: #FF2800, 7 Aces: #FFFFFF, Mighty Dragons: #123456
  const getTeamLogoBgColor = (team) => {
    if (team?.logo_bg_color) return team.logo_bg_color;
    const id = team?.id || team?.team_number;
    const name = (team?.name || team?.short_name || '').toLowerCase();
    if (id === 1 || name.includes('7 aces') || name.includes('aces')) return '#FFFFFF';
    if (id === 2 || name.includes('royal') || name.includes('tiger')) return '#002800';
    if (id === 3 || name.includes('mighty') || name.includes('dragon')) return '#123456';
    if (id === 4 || name.includes('golden') || name.includes('eagle')) return '#FF2800';
    return '#000000';
  };

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

  // Sponsor logos for bottom scrolling bar (Devee Group, PV Enterprises, Bhimavaram Digitals)
  const sponsorLogos = useMemo(() => {
    const deveeLogoItem = {
      node: (
        <div className="h-10 flex items-center justify-center px-2">
          <img
            src="/images/sponsors/devee-group.png"
            alt="Devee Group"
            className="h-9 w-auto max-h-9 object-contain select-none transition-transform hover:scale-105 drop-shadow-xs"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ),
      title: "Devee Group"
    };

    const pvLogoItem = {
      node: (
        <div className="h-10 flex items-center justify-center px-2">
          <img
            src="/images/sponsors/pv-enterprises.png"
            alt="PV Enterprises"
            className="h-9 w-auto max-h-9 object-contain select-none transition-transform hover:scale-105 drop-shadow-xs"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ),
      title: "PV Enterprises"
    };

    const bhimavaramDigitalsItem = {
      node: (
        <div className="h-10 flex items-center justify-center px-2">
          <img
            src="/images/sponsors/bhimavaram-digitals.png"
            alt="Bhimavaram Digitals"
            className="h-9 w-auto max-h-9 object-contain select-none transition-transform hover:scale-105 drop-shadow-xs"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ),
      title: "Bhimavaram Digitals"
    };

    return [deveeLogoItem, pvLogoItem, bhimavaramDigitalsItem, deveeLogoItem, pvLogoItem, bhimavaramDigitalsItem];
  }, []);

  return (
    <div
      className="bg-[#cfd8dc] text-slate-900 antialiased flex flex-col justify-between min-h-screen font-montserrat-bold font-bold"
      style={{
        fontFamily: "'Montserrat', sans-serif",
        height: '100vh',
        maxHeight: '1080px'
      }}
    >
      {/* ===== NEW PLAYER INTRO OVERLAY (10 seconds) ===== */}
      {playerIntro && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-montserrat-bold" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', backgroundColor: 'rgba(15, 23, 42, 0.55)' }}>
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
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-600">
                  <svg className="w-28 h-28 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            {/* CURRENT PLAYER label */}
            <div className="flex items-center gap-3 mb-4" style={{ animation: 'fadeUpIn 0.6s ease-out 0.5s both' }}>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-base font-black tracking-[0.35em] uppercase text-emerald-400 drop-shadow-lg font-montserrat-bold">CURRENT PLAYER</span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            {/* Player Name — Montserrat Black */}
            <h1
              className="text-6xl xl:text-8xl font-black text-white uppercase tracking-tight mb-4 font-montserrat-black"
              style={{ animation: 'fadeUpIn 0.7s ease-out 0.7s both', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            >
              {playerIntro.name || 'PLAYER'}
            </h1>
            {/* Badges: Category & Base Price — Montserrat Bold */}
            <div className="flex items-center gap-4 mt-2 flex-wrap justify-center font-montserrat-bold" style={{ animation: 'fadeUpIn 0.6s ease-out 0.95s both' }}>
              <span className="px-8 py-2.5 rounded-full bg-white/10 border-2 border-white/25 text-white text-xl font-bold uppercase tracking-widest backdrop-blur-sm shadow-lg">
                {playerIntro.category || 'Group A'}
              </span>
              <span className="px-8 py-2.5 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-300 text-xl font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg flex items-center gap-2.5">
                <span className="text-emerald-400/80 text-sm font-semibold tracking-widest uppercase">Base Price:</span>
                <span className="text-white font-montserrat-bold font-black text-2xl">
                  <SpinningCounter
                    value={playerIntro.base_price || 10000}
                    suffix=" pts"
                    spins={2}
                    duration={1200}
                    stagger={70}
                  />
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== SOLD CELEBRATION OVERLAY ===== */}
      {soldCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-montserrat-bold overflow-hidden" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', backgroundColor: 'rgba(6, 78, 59, 0.65)' }}>
          {/* Confetti Sparks Canvas in front of overlay backdrop */}
          <canvas
            ref={confettiCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          />

          {/* Background Rotating Sunburst Light Rays */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.45) 0%, rgba(250, 204, 21, 0.25) 35%, transparent 70%)',
              animation: 'sunburstRotate 20s linear infinite'
            }}
          />

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Sparkle Stars & Flares floating around player photo */}
            <div className="relative">
              {/* Pulsing Aura Ring */}
              <div
                className="absolute -inset-6 rounded-full opacity-70 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(250, 204, 21, 0.5) 0%, rgba(34, 197, 94, 0.3) 50%, transparent 70%)',
                  animation: 'pulseBid 1.5s ease-in-out infinite'
                }}
              />

              {/* Subtle Twinkle Spark 1 (Top Right) */}
              <div
                className="absolute -top-3 -right-3 text-2xl select-none z-20 pointer-events-none drop-shadow-md"
                style={{ animation: 'sparkTwinkle 1.6s ease-in-out infinite alternate' }}
              >
                ✨
              </div>

              {/* Subtle Twinkle Spark 2 (Bottom Left) */}
              <div
                className="absolute -bottom-2 -left-3 text-2xl select-none z-20 pointer-events-none drop-shadow-md"
                style={{ animation: 'sparkTwinkle 1.8s ease-in-out 0.4s infinite alternate' }}
              >
                ✨
              </div>

              {/* Player Photo — slides from right */}
              <div
                className="w-56 h-56 xl:w-64 xl:h-64 rounded-full border-[5px] border-emerald-300 shadow-2xl overflow-hidden mb-6 bg-slate-700 relative z-10"
                style={{
                  animation: 'slideFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  boxShadow: '0 0 90px rgba(34, 197, 94, 0.6), 0 0 40px rgba(250, 204, 21, 0.5), 0 25px 50px rgba(0,0,0,0.5)'
                }}
              >
                {soldCelebration.player_image ? (
                  <img
                    src={soldCelebration.player_image}
                    alt={soldCelebration.player_name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-900">
                    <span className="text-7xl">🎾</span>
                  </div>
                )}
              </div>
            </div>

            {/* SOLD Badge with Sparkles */}
            <div className="relative">
              <div
                className="px-12 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 shadow-2xl mb-4 border-2 border-emerald-200/60 flex items-center justify-center gap-3"
                style={{
                  animation: 'fadeUpIn 0.5s ease-out 0.5s both',
                  boxShadow: '0 0 35px rgba(34, 197, 94, 0.7), 0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                <span className="text-2xl animate-spin-slow">✨</span>
                <h1 className="text-5xl xl:text-7xl font-black text-white uppercase tracking-wider font-montserrat-black" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
                  SOLD!
                </h1>
                <span className="text-2xl animate-spin-slow">✨</span>
              </div>
            </div>

            {/* Player Name — Montserrat Black */}
            <p
              className="text-3xl xl:text-5xl font-black text-white mb-4 tracking-tight font-montserrat-black"
              style={{ animation: 'fadeUpIn 0.6s ease-out 0.7s both', textShadow: '0 3px 20px rgba(0,0,0,0.4)' }}
            >
              {soldCelebration.player_name || 'Player'}
            </p>
            {/* Team Name — Montserrat Bold */}
            <p
              className="text-2xl xl:text-3xl text-emerald-200 font-bold mb-3 font-montserrat-bold"
              style={{ animation: 'fadeUpIn 0.5s ease-out 0.9s both' }}
            >
              Sold to <strong className="text-white font-black">{soldCelebration.team_name || 'Team'}</strong>
            </p>
            {/* Amount with Transitions.dev Spinning Counter */}
            <div
              className="px-8 py-3 rounded-xl bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg font-montserrat-bold flex items-center justify-center"
              style={{ animation: 'fadeUpIn 0.6s ease-out 1.1s both' }}
            >
              <div className="text-5xl xl:text-6xl font-black text-white font-montserrat-bold flex items-center" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.3)' }}>
                <SpinningCounter
                  value={soldCelebration.amount || soldCelebration.final_price || 10000}
                  suffix=" pts"
                  spins={3}
                  duration={1400}
                  stagger={90}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== UNSOLD NOTICE OVERLAY ===== */}
      {unsoldNotice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-montserrat-bold" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', backgroundColor: 'rgba(127, 29, 29, 0.45)' }}>
          <div className="flex flex-col items-center text-center">
            {/* Player Photo — slides from right */}
            <div
              className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-full border-[5px] border-amber-400/70 shadow-2xl overflow-hidden mb-6"
              style={{
                animation: 'slideFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                boxShadow: '0 0 70px rgba(245, 158, 11, 0.35), 0 25px 50px rgba(0,0,0,0.4)'
              }}
            >
              {unsoldNotice.player_image ? (
                <img
                  src={unsoldNotice.player_image}
                  alt={unsoldNotice.player_name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <svg className="w-24 h-24 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            {/* RESERVED POOL label */}
            <h1
              className="text-5xl xl:text-7xl font-black text-amber-400 uppercase tracking-wider mb-4 font-montserrat-black"
              style={{ animation: 'fadeUpIn 0.6s ease-out 0.5s both', textShadow: '0 4px 25px rgba(245, 158, 11, 0.4)' }}
            >RESERVED POOL</h1>
            {/* Player Name — Montserrat Black */}
            <p
              className="text-3xl xl:text-4xl font-black text-white/90 mb-3 font-montserrat-black"
              style={{ animation: 'fadeUpIn 0.6s ease-out 0.75s both', textShadow: '0 3px 20px rgba(0,0,0,0.4)' }}
            >
              {unsoldNotice.player_name || 'Player'}
            </p>
            <p
              className="text-xl text-amber-200/80 font-bold font-montserrat-bold"
              style={{ animation: 'fadeUpIn 0.5s ease-out 0.95s both' }}
            >No buyer this round</p>
          </div>
        </div>
      )}

      {/* ===== TOP BAR ===== */}
      <header className="w-full bg-[#dbe2e6] border-b-2 border-slate-700/80 py-1.5 px-4 shadow-sm shrink-0 font-montserrat-bold">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          {/* Left: Live Status & Stadium Arena */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 tracking-wider font-montserrat-bold">
              LIVE STADIUM ARENA
            </span>
          </div>

          {/* Middle: Big Prominent League Title with Tennis Ball Logo — Montserrat Black */}
          <div className="flex-1 flex items-center justify-center gap-2 px-3">
            <img
              src="/images/tennis-league-logo.png"
              alt="Tennis League Bhimavaram"
              className="h-7 sm:h-8 lg:h-9 w-auto object-contain shrink-0 drop-shadow-xs"
            />
            <h1 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-wider text-slate-900 font-montserrat-black">
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
      <main className="flex-1 w-full max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-slate-100 border-x-2 border-slate-700 font-montserrat-bold">

        {/* ===== LEFT: 4 TEAM COLUMNS (9 cols / 75% width for spacious player rosters) ===== */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-700 border-r-2 border-slate-700 bg-[#e2e8f0]">
          {displayTeams.map((team, idx) => {
            const isLeading = highestTeam?.id === team.id;
            const totalPurse = team.total_purse || 500000;
            const remaining = team.purse_remaining || 0;
            const spent = Math.max(0, totalPurse - remaining);
            const squadCount = team.players_bought || team.players?.length || 0;
            const maxSquad = team.max_players || 12;
            const maxGroupA = team.max_group_a || 4;
            const maxGroupB = team.max_group_b || 8;
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
                className="flex flex-col h-full p-0 relative overflow-hidden transition-all duration-300"
                style={{ backgroundColor: '#ffffff' }}
              >
                {/* Blurred team logo background — only when leading */}
                {isLeading && team.logo_url && (
                  <>
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundImage: `url(${team.logo_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(25px) saturate(1.5)',
                        transform: 'scale(1.3)',
                        opacity: 0.45
                      }}
                    />
                    <div className="absolute inset-0 z-0 bg-white/50" />
                  </>
                )}

                {/* Team Logo Edge-to-Edge at Top + Points Strip */}
                <div
                  className="flex flex-col w-full shrink-0 overflow-hidden relative z-10 transition-all duration-300 border-b-2"
                  style={{
                    borderColor: isLeading ? getTeamBoundaryColor(team) : '#1e293b',
                    boxShadow: isLeading ? `0 4px 16px ${getTeamBoundaryColor(team)}66` : undefined
                  }}
                >
                  {/* Edge-to-Edge Team Logo Image */}
                  <div
                    className="w-full h-44 xl:h-48 overflow-hidden flex items-center justify-center relative transition-colors duration-200"
                    style={{ backgroundColor: getTeamLogoBgColor(team) }}
                  >
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-full h-full object-contain p-1"
                        style={{ backgroundColor: getTeamLogoBgColor(team) }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement?.querySelector('.team-badge-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`team-badge-fallback w-full h-full font-black text-2xl items-center justify-center ${isLeading ? 'bg-slate-200 text-slate-900' : `${badge.bg} ${badge.text}`
                        }`}
                      style={{ display: team.logo_url ? 'none' : 'flex', backgroundColor: getTeamLogoBgColor(team) }}
                    >
                      {team.short_name || team.name || badge.label}
                    </div>
                  </div>

                  {/* Points & Squad Count — side by side strip below image */}
                  <div className={`px-3 py-1.5 flex items-center justify-between gap-1.5 border-t border-slate-200 ${isLeading ? 'bg-slate-100' : 'bg-slate-50'}`}>
                    <span className="text-base sm:text-lg xl:text-xl font-bold text-slate-900 font-montserrat-bold leading-none">
                      {formatCurrency(remaining)}
                    </span>
                    <span className="text-[11px] xl:text-[12px] text-slate-600 font-bold font-montserrat-bold whitespace-nowrap bg-slate-200/80 px-2 py-0.5 rounded-full">
                      Squad: {squadCount}/{maxSquad}
                    </span>
                  </div>
                </div>

                {/* Group A & Group B Separation — Montserrat Bold */}
                <div className="flex-1 flex flex-col justify-between p-2.5 xl:p-3 min-h-0 relative z-10 overflow-hidden">
                  <div className="flex-1 flex flex-col space-y-2 min-h-0 overflow-hidden">
                    {/* GROUP A SECTION GREY BOX (Static / Non-scrolling) */}
                    <div className="border-2 border-slate-400/80 rounded-lg p-2 bg-slate-200/50 shadow-2xs space-y-1.5 shrink-0">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs"></span>
                          <span className="text-[12px] xl:text-[13px] font-black text-slate-900 tracking-wider font-montserrat-bold">GROUP A</span>
                        </div>
                        <span className="text-[11px] xl:text-[12px] font-bold px-2 py-0.5 rounded-full bg-slate-300 text-slate-800 font-montserrat-bold">
                          {groupAPlayers.length}/{maxGroupA}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {groupAPlayers.length > 0 ? (
                          groupAPlayers.map((p, pIdx) => {
                            const isCaptain = p.is_captain || p.designation === 'CAPTAIN';
                            return (
                              <div
                                key={p.id || `ga-${pIdx}`}
                                className="flex items-center justify-between gap-2 py-1 px-1 transition-colors border-b border-slate-300/40 last:border-b-0"
                              >
                                {/* Player Name in Roster with Bullet Point */}
                                <div className="font-extrabold text-slate-950 text-[13.5px] sm:text-[14px] xl:text-[14.5px] 2xl:text-[15px] leading-snug font-montserrat-bold min-w-0 flex-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0 inline-block"></span>
                                  <span className="truncate" title={p.name || p.player_name || ''}>
                                    {p.name || p.player_name || ''}
                                  </span>
                                  {isCaptain && (
                                    <span className="text-[10px] xl:text-[11px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs shrink-0 leading-none font-montserrat-bold">
                                      C
                                    </span>
                                  )}
                                </div>
                                {!isCaptain && (
                                  <div className="text-right shrink-0">
                                    <span className="font-bold text-slate-900 text-[11px] xl:text-[12px] whitespace-nowrap font-montserrat-bold">
                                      {formatLakhsShort(p.purchase_price || p.base_price)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-1.5 text-slate-400 text-[11px] xl:text-[12px] italic bg-white/70 rounded border border-dashed border-slate-300 font-montserrat-bold">
                            No Group A acquired
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GROUP B SECTION GREY BOX (Scrollable squad list) */}
                    <div className="border-2 border-slate-400/80 rounded-lg p-2 bg-slate-200/50 shadow-2xs space-y-1.5 flex flex-col flex-1 min-h-0 overflow-hidden">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-300 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-2xs"></span>
                          <span className="text-[12px] xl:text-[13px] font-black text-slate-900 tracking-wider font-montserrat-bold">GROUP B</span>
                        </div>
                        <span className="text-[11px] xl:text-[12px] font-bold px-2 py-0.5 rounded-full bg-slate-300 text-slate-800 font-montserrat-bold">
                          {groupBPlayers.length}/{maxGroupB}
                        </span>
                      </div>

                      {/* Exclusively Auto-Scrolling Group B Player List in Continuous Loop */}
                      <div className="text-xs overflow-hidden max-h-[150px] sm:max-h-[180px] xl:max-h-[220px] 2xl:max-h-[260px] flex-1 min-h-0 relative">
                        {groupBPlayers.length > 0 ? (
                          <div
                            className={groupBPlayers.length > 3 ? 'group-b-autoscroll space-y-1' : 'space-y-1'}
                            style={{
                              '--scroll-duration': `${Math.max(8, groupBPlayers.length * 3.5)}s`
                            }}
                          >
                            {(groupBPlayers.length > 3 ? [...groupBPlayers, ...groupBPlayers] : groupBPlayers).map((p, pIdx) => (
                              <div
                                key={p.id ? `${p.id}-${pIdx}` : `gb-${pIdx}`}
                                className="flex items-center justify-between gap-2 py-1 px-1 transition-colors border-b border-slate-300/40 last:border-b-0 shrink-0"
                              >
                                {/* Player Name in Roster with Bullet Point */}
                                <div className="font-extrabold text-slate-950 text-[13.5px] sm:text-[14px] xl:text-[14.5px] 2xl:text-[15px] leading-snug font-montserrat-bold min-w-0 flex-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0 inline-block"></span>
                                  <span className="truncate block" title={p.name || p.player_name || ''}>
                                    {p.name || p.player_name || ''}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-slate-900 text-[11px] xl:text-[12px] whitespace-nowrap font-montserrat-bold">
                                    {formatLakhsShort(p.purchase_price || p.base_price)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-1.5 text-slate-400 text-[11px] xl:text-[12px] italic bg-white/70 rounded border border-dashed border-slate-300 font-montserrat-bold">
                            No Group B acquired
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Footer Status - only shown when leading bidder */}
                  {isLeading && (
                    <div
                      className="mt-2 pt-2 shrink-0 font-montserrat-bold"
                      style={{ borderTop: `1px solid ${getTeamBoundaryColor(team)}50` }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md"
                          style={{
                            animation: 'pulseBid 2s infinite ease-in-out',
                            backgroundColor: getTeamBoundaryColor(team)
                          }}
                          title="Holding Current Bid"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-slate-900 mt-1 tracking-wider font-montserrat-bold">
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

        {/* ===== RIGHT PANEL: Player Detail + Bidding (3 cols / 25% width) ===== */}
        <section className="lg:col-span-3 flex flex-col pt-1.5 pb-2 px-3 xl:px-4 bg-white space-y-1.5 xl:space-y-2 min-h-0 overflow-hidden font-montserrat-bold">
          {/* 1. TOP: 3D Rotating Showcase Cube (Player Photo & Sponsors) — Moved Up */}
          <div className="relative flex-1 min-h-[190px] sm:min-h-[220px] flex items-center justify-center overflow-visible pt-0 pb-1">
            <Player3DCube player={activePlayer} />
          </div>

          {/* 2. Player Name Header — Montserrat Black */}
          <div className="text-center py-0.5 px-1 shrink-0">
            <h2 className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-950 tracking-tight uppercase font-montserrat-black leading-tight">
              {activePlayer.name || 'WAITING'}
            </h2>
          </div>

          {/* Current Bid — Box */}
          <div className="text-center py-2.5 xl:py-3 bg-slate-50 rounded-xl border-2 border-slate-700 shadow-sm shrink-0">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5 font-montserrat-bold">CURRENT BID</span>
            <div className="text-3xl sm:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight font-montserrat-black leading-none">
              {highestTeam && Number(currentBid) > 0 ? formatCurrency(currentBid) : 'NO BIDS YET'}
            </div>
          </div>

          {/* Bid By Team — Clean & Moved Up */}
          <div className="flex items-center justify-center gap-2.5 pt-1.5 pb-1 shrink-0 border-t border-slate-200">
            <span className="text-xs sm:text-sm font-bold uppercase text-slate-400 font-montserrat-bold">BID BY:</span>
            <span className="text-xl xl:text-2xl font-black text-slate-900 font-montserrat-black">
              {highestTeam ? highestTeam.short_name : '—'}
            </span>
            {highestTeam && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-xs font-montserrat-bold">
                LEADING
              </span>
            )}
          </div>
        </section>
      </main>

      {/* ===== BOTTOM SPONSORS BAR WITH LOGO LOOP ===== */}
      <footer className="w-full bg-[#dbe2e6] border-t-2 border-slate-700/80 py-0.5 px-3 shadow-inner shrink-0 font-montserrat-bold">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2.5">
          {/* Left: Sponsors Label */}
          <div className="flex items-center gap-1 shrink-0 bg-white/70 px-2 py-0.5 rounded border border-slate-400/60 shadow-xs">
            <span className="text-[10px] tracking-wider font-black uppercase text-slate-800 font-montserrat-bold">SPONSORS</span>
          </div>

          {/* Middle: Scrolling Sponsor Logos Loop */}
          <div className="flex-1 overflow-hidden min-w-0">
            <LogoLoop
              logos={sponsorLogos}
              speed={40}
              direction="left"
              logoHeight={32}
              gap={48}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#dbe2e6"
              ariaLabel="Tournament Official Sponsors"
            />
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
        @keyframes sparkTwinkle {
          0% { transform: scale(0.6) rotate(-15deg); opacity: 0.3; filter: drop-shadow(0 0 2px gold); }
          50% { transform: scale(1.3) rotate(20deg); opacity: 1; filter: drop-shadow(0 0 12px gold); }
          100% { transform: scale(0.9) rotate(0deg); opacity: 0.7; filter: drop-shadow(0 0 6px gold); }
        }
        @keyframes sunburstRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
