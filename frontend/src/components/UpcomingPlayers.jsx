import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { Calendar, Star, Clock, ArrowUpRight, ChevronRight } from 'lucide-react';

export default function UpcomingPlayers() {
  const { upcomingPlayers, selectedPlayer, setSelectedPlayer } = useAuction();

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl p-3 lg:p-3.5 border border-slate-800/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-300" />
          <h2 className="text-xs lg:text-sm font-extrabold tracking-wider text-white uppercase font-display">
            UPCOMING PLAYERS
          </h2>
        </div>
        <button 
          onClick={() => {
            if (upcomingPlayers.length > 0) {
              setSelectedPlayer(upcomingPlayers[0]);
            }
          }}
          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Scrollable list fitting inside container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {upcomingPlayers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No upcoming players remaining.
          </div>
        ) : (
          upcomingPlayers.map((player, index) => {
            const isSelected = selectedPlayer?.id === player.id;
            const isUpNext = index === 0;

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`group relative flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-800/90 border-2 border-emerald-500/80 shadow-sm shadow-emerald-950/40'
                    : 'bg-[#0b1328]/80 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700/60">
                    <img
                      src={player.image_url}
                      alt={player.name}
                      className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/tennis-ball-glow.svg';
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-emerald-300 transition-colors">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-slate-400">Base</span>
                      <span className="text-[11px] font-bold text-slate-200">
                        ₹ {player.base_price ? Number(player.base_price).toLocaleString('en-IN') : '10,000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Badge & Chevron */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isUpNext ? (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[9px] font-extrabold tracking-wide text-emerald-400">
                      <ArrowUpRight className="w-2.5 h-2.5 text-emerald-400" />
                      UP NEXT
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-[9px] font-semibold text-slate-400">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      PENDING
                    </span>
                  )}

                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
