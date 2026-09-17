import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { 
  Calendar, 
  Hand, 
  Clock, 
  Gavel, 
  CircleDot, 
  Layers,
  Radio,
  Hourglass,
  UserPlus
} from 'lucide-react';

export default function LiveAuction() {
  const { auction, currentPlayer, timeLeft, setIsBiddingModalOpen } = useAuction();

  // Empty Slot State: When no player is currently live (e.g. after sold out or waiting)
  if (!currentPlayer) {
    return (
      <div className="h-full flex flex-col glass-panel rounded-2xl p-4 lg:p-6 border border-slate-800/80 relative overflow-hidden justify-between">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-display">
              STAGE IDLE • WAITING FOR NEW PLAYER
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">LOT STANDBY</span>
        </div>

        {/* Center Main Stage Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto py-4 items-center">
          {/* Silhouette Box */}
          <div className="md:col-span-5 h-48 sm:h-52 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-4 bg-slate-950/40 text-center relative overflow-hidden group">
            <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-500 mb-2 shadow-inner">
              <UserPlus className="w-7 h-7 text-emerald-400/60" />
            </div>
            <span className="text-xs font-bold text-slate-300">AUCTION BLOCK EMPTY</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Player sold out</span>
          </div>

          {/* Message & Status */}
          <div className="md:col-span-7 space-y-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                ROUND CONCLUDED
              </span>
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight font-display mt-1">
                Waiting for the Next Player
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The previous athlete has been finalized and moved to the Sold roster. Standing by for the auctioneer to cue the next draft candidate onto the live block.
              </p>
            </div>

            {/* Price Preview Block */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
              <div className="bg-[#0b1328]/60 rounded-xl p-2.5 border border-slate-800/60">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  BASE PRICE
                </div>
                <div className="text-base font-black text-slate-400 mt-0.5 font-display">
                  ₹ --
                </div>
              </div>

              <div className="bg-[#0b1328]/60 rounded-xl p-2.5 border border-slate-800/60">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  CURRENT BID
                </div>
                <div className="text-base font-black text-slate-400 mt-0.5 font-display">
                  ₹ --
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Hourglass className="w-3.5 h-3.5 text-amber-400/80 animate-spin" />
            <span>Ready for next lot nomination</span>
          </div>
          <button
            disabled
            className="px-5 py-2 rounded-xl bg-slate-800/50 text-slate-500 font-bold text-xs uppercase cursor-not-allowed border border-slate-800"
          >
            BIDDING PAUSED
          </button>
        </div>
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
          
          {/* Top Row: Player Number Badge + Group + Name */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[11px] font-black tracking-wider uppercase">
                {currentPlayer.player_number || 'PLAYER #07'}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase border ${
                (currentPlayer.group === 'B')
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              }`}>
                Group {currentPlayer.group || 'A'}
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight font-display">
              {currentPlayer.name}
            </h1>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-slate-800/80 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Age: <strong className="text-white">{currentPlayer.age}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">Hand: <strong className="text-white">{currentPlayer.playing_hand || 'Right Hand'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 col-span-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Auction Group: <strong className="text-white">Group {currentPlayer.group || 'A'}</strong></span>
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
