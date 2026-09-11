import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { 
  Calendar, 
  Trophy, 
  Zap, 
  Hand, 
  Clock, 
  Gavel, 
  CircleDot, 
  Medal,
  Activity
} from 'lucide-react';

export default function LiveAuction() {
  const { auction, currentPlayer, timeLeft, setIsBiddingModalOpen } = useAuction();

  if (!currentPlayer) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-panel rounded-2xl p-6 border border-slate-800 text-center">
        <Activity className="w-8 h-8 animate-pulse text-emerald-400 mb-2" />
        <h3 className="text-base font-bold text-white mb-1">No Live Auction Active</h3>
        <p className="text-xs text-slate-400">
          The auctioneer has not yet nominated a player to the auction stage.
        </p>
      </div>
    );
  }

  const isLowTime = timeLeft <= 5 && timeLeft > 0;
  const isTimeExpired = timeLeft === 0;

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl p-3 lg:p-4 border border-slate-800/80 live-glow-border relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid: Photo on Left, Details & Bid on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0 items-stretch">
        
        {/* Left Column: Player Action Photo */}
        <div className="md:col-span-5 relative rounded-xl overflow-hidden h-full min-h-[200px] md:min-h-0 bg-slate-950 border border-slate-800/80 shadow-inner group flex items-center justify-center">
          {/* ● LIVE Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-emerald-500/60 backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              LIVE
            </span>
          </div>

          <img
            src={currentPlayer.image_url}
            alt={currentPlayer.name}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = '/images/tennis-ball-glow.svg';
            }}
          />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060b17] via-[#060b17]/40 to-transparent" />
        </div>

        {/* Right Column: Player Info, Price Boxes & Bid Action */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-2 py-0.5">
          
          {/* Top Row: Player Number Badge + Flag + Name */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[11px] font-black tracking-wider uppercase">
                {currentPlayer.player_number || 'PLAYER #07'}
              </span>
              <span className="text-base" title={currentPlayer.country}>
                {currentPlayer.country_flag || '🇮🇳'}
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight font-display">
              {currentPlayer.name}
            </h1>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-1.5 py-1.5 border-y border-slate-800/80 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Age <strong className="text-white">{currentPlayer.age}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs">{currentPlayer.country_flag || '🇮🇳'}</span>
              <span className="truncate">{currentPlayer.country}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{currentPlayer.category || 'Singles'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{currentPlayer.playing_hand || 'Right Hand'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Medal className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Rank <strong className="text-white">#{currentPlayer.world_ranking}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span>Wins <strong className="text-white">{currentPlayer.wins}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 col-span-3">
              <Zap className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Aces <strong className="text-white">{currentPlayer.aces}</strong></span>
            </div>
          </div>

          {/* Pricing Blocks (Base Price vs Current Bid) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Base Price */}
            <div className="bg-[#0b1328]/90 rounded-xl p-2 lg:p-2.5 border border-slate-800">
              <div className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                BASE PRICE
              </div>
              <div className="text-base lg:text-xl font-black text-slate-200 mt-0.5 font-display">
                ₹ {Number(currentPlayer.base_price || 10000).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Current Bid */}
            <div className="bg-emerald-950/40 rounded-xl p-2 lg:p-2.5 border-2 border-emerald-500/80 shadow-md shadow-emerald-950/60">
              <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-emerald-400">
                CURRENT BID
              </div>
              <div className="text-base lg:text-xl font-black text-emerald-400 mt-0.5 font-display">
                ₹ {Number(auction?.current_bid || currentPlayer.base_price).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Bottom Action Row: Timer & BID NOW Button */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                TIME REMAINING
              </span>
              <span className={`text-xl lg:text-2xl font-black font-display tracking-tight leading-none mt-0.5 ${
                isTimeExpired 
                  ? 'text-rose-400 animate-pulse' 
                  : isLowTime 
                    ? 'text-amber-400 animate-pulse' 
                    : 'text-amber-300'
              }`}>
                {timeLeft}s
              </span>
            </div>

            <button
              id="bid-now-btn"
              onClick={() => setIsBiddingModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 lg:px-7 py-2 lg:py-2.5 rounded-xl font-black text-xs lg:text-sm tracking-wide uppercase transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 shadow-neon-green hover:shadow-[0_0_25px_rgba(34,197,94,0.7)] font-display cursor-pointer"
            >
              <Gavel className="w-4 h-4" />
              <span>BID NOW</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
