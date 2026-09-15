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
    soldCelebration,
    unsoldNotice,
    isSocketConnected
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

  // Format currency helpers
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
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
      category: 'Singles',
      playing_hand: 'Right Hand',
      world_ranking: 148,
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
        id: 1, team_number: 1, name: 'The Racquet Warriors',
        tagline: 'Speed, Spin & Power', owner: 'Rohan Iyer',
        total_purse: 100000, purse_remaining: 100000, spent: 0,
        max_players: 5, players_bought: 0, players: []
      },
      {
        id: 2, team_number: 2, name: 'Ace Storm',
        tagline: 'Precision In Every Serve', owner: 'Vikramaditya Roy',
        total_purse: 100000, purse_remaining: 100000, spent: 0,
        max_players: 5, players_bought: 0, players: []
      },
      {
        id: 3, team_number: 3, name: 'Thunder Bolts',
        tagline: 'Striking Like Lightning', owner: 'Maya Sengupta',
        total_purse: 100000, purse_remaining: 100000, spent: 0,
        max_players: 5, players_bought: 0, players: []
      },
      {
        id: 4, team_number: 4, name: 'Fire Servers',
        tagline: 'Feel the Burning Heat', owner: 'Kabir Malhotra',
        total_purse: 100000, purse_remaining: 100000, spent: 0,
        max_players: 5, players_bought: 0, players: []
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
        total_purse: totalPurse,
        purse_remaining: purseLeft,
        spent: spent,
        players_bought: rosterCount,
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

  // Timer
  const displayTimerSeconds = timeLeft !== undefined ? Math.max(0, timeLeft) : 15;
  const timerFormatted = `00:${displayTimerSeconds < 10 ? '0' : ''}${displayTimerSeconds}s`;

  // Team badge colors for visual
  const teamBadgeColors = [
    { bg: 'bg-blue-100', text: 'text-blue-700', label: 'TA' },
    { bg: 'bg-amber-100', text: 'text-amber-700', label: 'TB' },
    { bg: 'bg-purple-100', text: 'text-purple-700', label: 'TC' },
    { bg: 'bg-rose-100', text: 'text-rose-700', label: 'TD' }
  ];

  return (
    <div
      className="bg-slate-100 text-slate-900 antialiased flex flex-col justify-between min-h-screen"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        height: '100vh',
        maxHeight: '1080px'
      }}
    >
      {/* ===== SOLD CELEBRATION OVERLAY ===== */}
      {soldCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-lg">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">🎾</div>
            <h1 className="text-5xl font-black text-lime-700 uppercase tracking-tight mb-2">SOLD!</h1>
            <p className="text-2xl font-bold text-slate-800">
              {soldCelebration.player_name || 'Player'}
            </p>
            <p className="text-xl text-slate-600 mt-1">
              to <strong className="text-slate-900">{soldCelebration.team_name || 'Team'}</strong> for{' '}
              <strong className="text-lime-700">{formatCurrency(soldCelebration.amount)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ===== UNSOLD NOTICE OVERLAY ===== */}
      {unsoldNotice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-4xl font-black text-red-600 uppercase tracking-tight mb-2">UNSOLD</h1>
            <p className="text-xl text-slate-600">
              {unsoldNotice.player_name || 'Player'} — No buyer this round
            </p>
          </div>
        </div>
      )}

      {/* ===== TOP SPONSORS BAR ===== */}
      <header className="w-full bg-slate-200 border-b border-slate-300 py-2.5 px-6 shadow-sm shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSocketConnected ? 'bg-lime-500 animate-ping' : 'bg-red-500'}`}></span>
            <span className="text-xs tracking-widest font-black uppercase text-slate-500">Official Tournament Sponsors</span>
          </div>
          <div className="flex items-center gap-8 md:gap-14 text-slate-700 font-bold uppercase tracking-wider text-sm md:text-base">
            <div className="flex items-center gap-2 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/></svg>
              <span className="font-black text-slate-800 tracking-tight text-lg">ROLEX</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-slate-900">
              <span className="text-red-600 font-black text-xl italic tracking-tighter">Wilson</span>
            </div>
            <div className="flex items-center gap-2 hover:text-slate-900">
              <span className="font-extrabold text-red-700 tracking-wide text-sm bg-red-50 border border-red-200 px-2 py-0.5 rounded">Emirates</span>
              <span className="text-xs text-slate-400 font-medium lowercase">Fly Better</span>
            </div>
            <div className="flex items-center gap-1 hover:text-slate-900">
              <span className="font-black tracking-widest text-slate-900 text-lg">HEAD</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 hover:text-slate-900">
              <span className="font-bold tracking-tight text-blue-700 text-base">Babolat.</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-300">LIVE ARENA 01</span>
            </div>
          </div>
          <div className="text-right hidden lg:flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              LOT {activePlayer.player_number || '#01'}
            </span>
            <button
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-slate-700 transition p-1 rounded hover:bg-slate-300"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('/admin')}
                className="text-xs font-bold px-2 py-1 rounded bg-slate-300 hover:bg-slate-400 text-slate-700 transition border border-slate-400"
                title="Admin Control Room"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN AUCTION STAGE ===== */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-white shadow-md border-x border-slate-200">

        {/* ===== LEFT: 4 TEAM COLUMNS ===== */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-r border-slate-300 bg-slate-50">
          {displayTeams.map((team, idx) => {
            const isLeading = highestTeam?.id === team.id;
            const totalPurse = team.total_purse || 100000;
            const remaining = team.purse_remaining || 0;
            const spent = Math.max(0, totalPurse - remaining);
            const squadCount = team.players_bought || team.players?.length || 0;
            const maxSquad = team.max_players || 5;
            const badge = teamBadgeColors[idx] || teamBadgeColors[0];
            const teamPlayers = team.players || [];

            return (
              <article
                key={team.id}
                className={`flex flex-col h-full p-4 transition duration-150 ${
                  isLeading
                    ? 'bg-lime-50/40 border-2 border-lime-500/80 rounded-sm shadow-sm relative'
                    : 'bg-slate-50/70 hover:bg-white border-b md:border-b-0'
                }`}
              >
                {/* Leading Bidder Badge */}
                {isLeading && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow tracking-wider z-10">
                    Leading Bidder
                  </div>
                )}

                {/* Team Header */}
                <div className={`pb-3 text-center ${isLeading ? 'border-b-2 border-lime-300 mt-1' : 'border-b-2 border-slate-300'}`}>
                  <div
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm mb-1.5 shadow-sm ${
                      isLeading ? 'bg-lime-200 text-lime-900 font-black' : ''
                    }`}
                    style={!isLeading ? {
                      backgroundColor: (team.primary_color || '#3b82f6') + '20',
                      color: team.primary_color || '#3b82f6'
                    } : undefined}
                  >
                    {badge.label}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{team.name}</h2>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isLeading ? 'text-lime-800' : 'text-slate-500'}`}>
                    {team.tagline || 'Franchise'}
                  </p>
                </div>

                {/* Team Purse */}
                <div className={`py-4 text-center rounded-lg my-3 px-2 ${
                  isLeading ? 'bg-white shadow-md border-b border-lime-200' : 'bg-white shadow-sm border-b border-slate-200'
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Amount Remaining:</span>
                  <div className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(remaining)}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 px-1">
                    <span>Spent: <strong>{formatCurrency(spent)}</strong></span>
                    <span>Slots: <strong>{squadCount} / {maxSquad}</strong></span>
                  </div>
                </div>

                {/* Roster */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mt-1">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Confirmed Roster</p>
                    <div className="space-y-2 text-xs text-slate-700">
                      {teamPlayers.length > 0 ? (
                        teamPlayers.map((p, pIdx) => (
                          <div
                            key={p.id || pIdx}
                            className={`rounded-xl p-2.5 flex items-center justify-between shadow-sm ${
                              isLeading ? 'bg-white border border-lime-100' : 'border border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.image_url || '/images/players/rohan-iyer.jpg'}
                                alt={p.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate text-sm">
                                  {pIdx + 1}. {p.name || p.player_name}
                                </div>
                                <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                                  {p.category || 'Singles'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 pl-2">
                              <span className="font-black text-slate-900 text-sm block">
                                {formatCurrency(p.purchase_price || p.base_price)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-slate-400 text-xs italic">
                          No players acquired yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Footer Status */}
                  <div className={`mt-4 pt-3 flex flex-col items-center justify-center ${isLeading ? 'border-t border-lime-200' : 'border-t border-slate-200'}`}>
                    {isLeading ? (
                      <>
                        <div
                          className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-md"
                          style={{ animation: 'pulseBid 2s infinite ease-in-out' }}
                          title="Active Bid Placed"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-[11px] font-extrabold uppercase text-slate-800 mt-1">
                          HOLDING {formatCurrency(currentBid)}
                        </span>
                      </>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                        Idle / Observing
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ===== RIGHT: PLAYER PROFILE + BID AMOUNT ===== */}
        <section className="lg:col-span-4 flex flex-col justify-between p-6 bg-white space-y-6">
          {/* Player Profile Card */}
          <div className="flex-1 flex flex-col bg-slate-50 border-2 border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
            {/* Tags Row */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-lime-500 text-white text-xs font-black uppercase tracking-wider">On Auction</span>
                <span className="text-xs text-slate-400 font-semibold">LOT {activePlayer.player_number || '#01'}</span>
              </div>
              <div className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                RANK: #{activePlayer.world_ranking || '-'}
              </div>
            </div>

            {/* Player Visual */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-white rounded-lg border border-slate-200 shadow-inner mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-slate-300 overflow-hidden mb-3 shadow bg-slate-200">
                {activePlayer.image_url ? (
                  <img
                    src={activePlayer.image_url}
                    alt={activePlayer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/players/rohan-iyer.jpg'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200">
                    <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {activePlayer.name || 'AWAITING PLAYER'}
              </h3>
              <p className="text-sm font-semibold text-blue-700">
                {activePlayer.playing_hand || 'Right-Handed'} • {activePlayer.category || 'Singles'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                <span>Age: <strong>{activePlayer.age || '-'}</strong></span>
                <span>•</span>
                <span>Country: <strong>{activePlayer.country_flag || ''} {activePlayer.country || '-'}</strong></span>
                <span>•</span>
                <span>Win Rate: <strong>{activePlayer.win_percentage || '-'}%</strong></span>
              </div>
            </div>

            {/* Player Meta Info */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-center">
              <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Base Price</span>
                <span className="text-lg font-black text-slate-800">{formatCurrency(activePlayer.base_price)}</span>
              </div>
              <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Role</span>
                <span className="text-lg font-black text-slate-800">{activePlayer.category || 'Singles'} Pro</span>
              </div>
            </div>
          </div>

          {/* Current Highest Bid Card */}
          <div className="bg-slate-200 border-2 border-slate-300 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-xs font-black tracking-widest text-slate-600 uppercase mb-1">
              CURRENT HIGHEST BID
            </span>
            <div className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight my-1">
              {formatCurrency(currentBid)}
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-300 mt-2 shadow-sm">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: highestTeam ? (highestTeam.primary_color || '#84cc16') : '#94a3b8' }}
              ></span>
              <span className="text-xs font-extrabold uppercase text-slate-800">
                BID HELD BY: {highestTeam ? highestTeam.name : 'NO BIDS YET'}
              </span>
            </div>
            <div className="w-full mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Increment: <strong>+{formatCurrency(bidIncrement)}</strong></span>
              <span className={`font-extrabold ${displayTimerSeconds <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                TIMER: {timerFormatted}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ===== BOTTOM SPONSORS BAR ===== */}
      <footer className="w-full bg-slate-200 border-t border-slate-300 py-3 px-6 shadow-inner shrink-0">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-widest font-black uppercase text-slate-500">Official Partners &amp; Sponsors</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-700 font-bold uppercase tracking-wider text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="font-extrabold tracking-normal text-slate-800">BNP PARIBAS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="font-black text-slate-800">LACOSTE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
              <span className="font-black italic text-slate-800 tracking-tight">YONEX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="font-extrabold text-slate-800">DUNLOP</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              <span className="font-black tracking-widest text-slate-800">INFOSYS</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium text-center md:text-right">
            STADIUM DISPLAY NETWORK • COURT #1
          </div>
        </div>
      </footer>

      {/* Inline style for pulseBid animation */}
      <style>{`
        @keyframes pulseBid {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
