import React, { useEffect, useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  WifiOff, 
  Radio, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Award, 
  Crown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DigitalAuctionDisplay() {
  const {
    auction,
    currentPlayer,
    teams,
    timeLeft,
    timerRunning,
    recentBids,
    sponsors,
    isSocketConnected,
    soldCelebration,
    unsoldNotice
  } = useAuction();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const highestTeam = auction?.highest_bidder_team_id
    ? teams.find(t => t.id === auction.highest_bidder_team_id)
    : null;

  const currentBid = auction?.current_bid || currentPlayer?.base_price || 10000;
  const basePrice = currentPlayer?.base_price || 10000;

  const timerSecondsTotal = auction?.timer_seconds || 15;
  const timerPercent = Math.min(100, Math.max(0, (timeLeft / timerSecondsTotal) * 100));

  // Determine timer color
  const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#22c55e';

  return (
    <div className="min-h-screen w-full bg-[#050914] text-white flex flex-col justify-between overflow-hidden relative select-none font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      {highestTeam && (
        <div 
          className="absolute inset-0 opacity-15 transition-all duration-1000 pointer-events-none blur-3xl"
          style={{ backgroundColor: highestTeam.primary_color }}
        />
      )}

      {/* TOP HEADER: Branding & Sponsors */}
      <header className="relative z-10 w-full px-6 py-3 border-b border-white/10 bg-slate-950/70 backdrop-blur-md flex items-center justify-between">
        {/* League Logo & Slogan */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 relative flex items-center justify-center">
            <img 
              src="/images/tennis-ball-glow.svg" 
              alt="Tennis Ball" 
              className="w-10 h-10 animate-tennis-spin"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-display tracking-wider bg-gradient-to-r from-emerald-400 via-teal-200 to-sky-400 bg-clip-text text-transparent uppercase">
                TENNIS LEAGUE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                OFFICIAL LIVE AUCTION
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-widest font-display uppercase">
              BIGGER DREAMS • BOLDER PLAYERS • GRAND SLAM 2026
            </p>
          </div>
        </div>

        {/* Sponsors Ribbon */}
        <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
          {(sponsors && sponsors.length > 0 ? sponsors : [
            { category: 'POWERED BY', name: 'SportWave' },
            { category: 'CO-SPONSOR', name: 'ApexHealth' },
            { category: 'ASSOCIATE SPONSOR', name: 'NovaTech' },
            { category: 'OFFICIAL PARTNER', name: 'GrandVista' }
          ]).map((sp, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                {sp.category}
              </span>
              <span className="text-xs font-black tracking-wide text-slate-100 font-display">
                {sp.name}
              </span>
            </div>
          ))}
        </div>

        {/* Live Broadcast Indicator & Fullscreen Button */}
        <div className="flex items-center gap-3 mr-12">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${
            isSocketConnected 
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
            <span>{isSocketConnected ? 'LIVE FEED SYNCED' : 'RECONNECTING...'}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* RECONNECTING WARNING TOAST */}
      {!isSocketConnected && (
        <div className="relative z-30 bg-rose-600/90 backdrop-blur-md text-white text-center py-2 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-xl">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>AUCTION SCREEN RECONNECTING... STAND BY FOR LIVE FEED</span>
        </div>
      )}

      {/* MAIN ARENA STAGE (Optimized for 1080p / 4K TV) */}
      <main className="relative z-10 flex-1 w-full max-w-[1920px] mx-auto px-6 py-4 grid grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT & CENTER: Huge Player Hero Showcase (7 cols) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 relative overflow-hidden shadow-2xl">
          
          {/* Subtle watermark */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <img src="/images/tennis-ball-glow.svg" alt="" className="w-96 h-96" />
          </div>

          {/* Top Tags */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black tracking-widest font-display uppercase">
                {currentPlayer?.player_number || 'PLAYER #07'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold font-display">
                {currentPlayer?.category || 'Singles'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-display flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                RANK #{currentPlayer?.world_ranking || 148}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
              <span className="text-xl">{currentPlayer?.country_flag || '🇮🇳'}</span>
              <span>{currentPlayer?.country || 'India'}</span>
            </div>
          </div>

          {/* Player Main Stage: Action Image & Typography */}
          <div className="flex-1 flex flex-col md:flex-row items-center gap-8 my-2">
            {/* Action Image with Glowing Frame */}
            <div className="relative group shrink-0">
              <div 
                className="absolute -inset-2 rounded-3xl opacity-75 blur-xl transition duration-500"
                style={{ 
                  backgroundColor: highestTeam ? highestTeam.primary_color : '#22c55e'
                }}
              />
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl">
                <img 
                  src={currentPlayer?.image_url || '/images/players/arjun-mehta.jpg'} 
                  alt={currentPlayer?.name || 'Player Photo'} 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                {/* Playing hand badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10">
                  <span className="text-slate-400">PLAYING HAND</span>
                  <span className="text-emerald-400">{currentPlayer?.playing_hand || 'Right Hand'}</span>
                </div>
              </div>
            </div>

            {/* Player Details & Career Stats */}
            <div className="flex-1 flex flex-col justify-center text-left">
              <p className="text-sm font-bold tracking-widest text-emerald-400 font-display uppercase mb-1">
                ON THE AUCTION BLOCK
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase drop-shadow-md mb-2">
                {currentPlayer?.name || 'Arjun Mehta'}
              </h1>
              <p className="text-sm text-slate-300 font-medium mb-6">
                Age {currentPlayer?.age || 22} Years • Professional Tennis Circuit Athlete
              </p>

              {/* Athletic Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matches</span>
                  <span className="text-2xl font-black font-display text-white mt-0.5">
                    {currentPlayer?.matches || 47}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wins</span>
                  <span className="text-2xl font-black font-display text-emerald-400 mt-0.5">
                    {currentPlayer?.wins || 32}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
                  <span className="text-2xl font-black font-display text-sky-400 mt-0.5">
                    {currentPlayer?.win_percentage || 68}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aces</span>
                  <span className="text-2xl font-black font-display text-amber-400 mt-0.5">
                    {currentPlayer?.aces || 87}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Feed: Recent Bids Tape */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3 overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              LIVE BID TRAIL:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {recentBids && recentBids.length > 0 ? (
                recentBids.slice(0, 5).map((bid, i) => (
                  <span 
                    key={bid.id || i}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    style={{ borderColor: `${bid.primary_color}50` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bid.primary_color }} />
                    <span className="text-slate-200">{bid.team_name}</span>
                    <span className="text-emerald-400 font-mono">₹{bid.amount?.toLocaleString('en-IN')}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Awaiting first opening bid...</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Financials, Live Current Bid & TV Countdown (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* BID BOX CARD */}
          <div className="flex-1 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            
            {/* Top row: Base Price */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                BASE OPENING PRICE
              </span>
              <span className="text-lg font-black font-display text-slate-300 font-mono">
                ₹{basePrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Glowing Big Current Bid Display */}
            <div className="my-4 text-center">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase font-display block mb-1">
                🔥 CURRENT HIGHEST BID
              </span>
              <div className="text-5xl sm:text-6xl xl:text-7xl font-black font-display tracking-tight text-white text-glow-emerald drop-shadow-2xl font-mono">
                ₹{currentBid.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Minimum increment: ₹{(auction?.bid_increment || 2000).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Highest Bidder Franchise Showcase */}
            <div 
              className="p-4 rounded-2xl border transition-all duration-500 relative overflow-hidden flex items-center justify-between"
              style={{
                backgroundColor: highestTeam ? `${highestTeam.primary_color}18` : 'rgba(255,255,255,0.03)',
                borderColor: highestTeam ? highestTeam.primary_color : 'rgba(255,255,255,0.15)',
                boxShadow: highestTeam ? `0 0 25px ${highestTeam.glow_color}` : 'none'
              }}
            >
              <div className="flex items-center gap-3">
                {highestTeam ? (
                  <>
                    <img 
                      src={highestTeam.logo_url} 
                      alt={highestTeam.name} 
                      className="w-12 h-12 object-contain filter drop-shadow-md"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        LEADING FRANCHISE
                      </span>
                      <span className="text-lg font-black font-display text-white">
                        {highestTeam.name}
                      </span>
                      <span className="text-xs text-slate-300 block font-mono">
                        Purse Left: ₹{highestTeam.purse_remaining?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      STATUS
                    </span>
                    <span className="text-base font-bold text-slate-400">
                      Waiting for First Bid...
                    </span>
                  </div>
                )}
              </div>

              {highestTeam && (
                <div className="px-3 py-1 rounded-xl bg-white/10 text-xs font-black uppercase tracking-wider text-white border border-white/20 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>TOP BIDDER</span>
                </div>
              )}
            </div>
          </div>

          {/* LARGE TV COUNTDOWN TIMER CARD */}
          <div className={`rounded-3xl bg-slate-900/60 backdrop-blur-xl border p-6 flex items-center justify-between relative overflow-hidden shadow-2xl transition-all duration-300 ${
            timeLeft <= 5 ? 'border-rose-500/80 bg-rose-950/30' : 'border-white/10'
          }`}>
            <div className="flex items-center gap-4">
              {/* Circular SVG Progress Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    style={{ stroke: timerColor }}
                    strokeDasharray={`${timerPercent}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    className="transition-all duration-1000 ease-linear"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Clock className={`w-8 h-8 absolute ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`} />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display block">
                  AUCTION CLOCK
                </span>
                <div 
                  className={`text-4xl sm:text-5xl font-black font-display tracking-tight font-mono ${
                    timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
                  }`}
                >
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-block ${
                timerRunning 
                  ? (timeLeft <= 5 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-bounce' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40')
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {timerRunning ? (timeLeft <= 5 ? '🔨 HAMMER FALLING!' : 'CLOCK RUNNING') : 'PAUSED'}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Server-Authoritative Sync
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER: 4 TEAMS LIVE PURSE & SQUAD STATUS */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {(teams && teams.length > 0 ? teams : [
            { id: 1, name: 'The Racquet Warriors', logo_url: '/images/teams/team1-lion.svg', primary_color: '#22c55e', purse_remaining: 125000, players_bought: 3, max_players: 5 },
            { id: 2, name: 'Ace Storm', logo_url: '/images/teams/team2-eagle.svg', primary_color: '#0ea5e9', purse_remaining: 108000, players_bought: 2, max_players: 5 },
            { id: 3, name: 'Thunder Bolts', logo_url: '/images/teams/team3-crown.svg', primary_color: '#a855f7', purse_remaining: 142000, players_bought: 2, max_players: 5 },
            { id: 4, name: 'Fire Servers', logo_url: '/images/teams/team4-flame.svg', primary_color: '#f97316', purse_remaining: 96000, players_bought: 2, max_players: 5 }
          ]).map((team) => {
            const isLeader = highestTeam && highestTeam.id === team.id;
            return (
              <div 
                key={team.id}
                className="p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between relative overflow-hidden"
                style={{
                  backgroundColor: isLeader ? `${team.primary_color}25` : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isLeader ? team.primary_color : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isLeader ? `0 0 20px ${team.primary_color}40` : 'none'
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="w-9 h-9 object-contain shrink-0 filter drop-shadow"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-black font-display text-white truncate block">
                      {team.name}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                      ₹{team.purse_remaining?.toLocaleString('en-IN')} remaining
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Squad
                  </span>
                  <span className="text-xs font-black text-slate-200 font-mono">
                    {team.players_bought || 0}/{team.max_players || 5}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </footer>

      {/* ========================================================= */}
      {/* DRAMATIC SOLD BROADCAST ANIMATION MODAL                     */}
      {/* ========================================================= */}
      {soldCelebration && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in select-none">
          <div className="max-w-2xl w-full rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400/80 p-8 text-center relative overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.4)] animate-scale-up">
            
            {/* Top celebratory header */}
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(234,179,8,0.6)]">
              🔨
            </div>

            <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest font-display uppercase mb-2">
              OFFICIAL HAMMER FALL
            </div>

            <h1 className="text-6xl sm:text-7xl font-black font-display text-amber-400 tracking-tight uppercase drop-shadow-[0_0_35px_rgba(234,179,8,0.8)] mb-2">
              SOLD!
            </h1>

            <p className="text-2xl sm:text-3xl font-black font-display text-white uppercase mb-4">
              {soldCelebration.player?.name}
            </p>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 my-4 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display mb-2">
                SOLD TO FRANCHISE
              </span>

              {soldCelebration.winning_team?.logo_url && (
                <img 
                  src={soldCelebration.winning_team.logo_url} 
                  alt="" 
                  className="w-16 h-16 object-contain mb-2 filter drop-shadow"
                />
              )}

              <h2 className="text-2xl sm:text-3xl font-black font-display uppercase" style={{ color: soldCelebration.winning_team?.primary_color || '#22c55e' }}>
                {soldCelebration.winning_team?.name}
              </h2>

              <div className="text-4xl sm:text-5xl font-black font-display text-emerald-400 font-mono mt-3 text-glow-emerald">
                ₹{soldCelebration.final_price?.toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
              TRANSITIONING TO NEXT PLAYER READY...
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* UNSOLD BROADCAST MODAL                                    */}
      {/* ========================================================= */}
      {unsoldNotice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in select-none">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-700 p-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl">
              ❌
            </div>
            <h2 className="text-3xl font-black font-display text-rose-400 uppercase mb-1">
              PLAYER UNSOLD
            </h2>
            <p className="text-lg font-bold text-white mb-2">
              {unsoldNotice.player?.name}
            </p>
            <p className="text-xs text-slate-400">
              This player will move into the Unsold pool for second chance re-auction.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
