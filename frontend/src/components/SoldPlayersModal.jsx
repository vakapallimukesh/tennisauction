import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { X, Award, CheckCircle2, ChevronRight, User } from 'lucide-react';

export default function SoldPlayersModal() {
  const { isSoldPlayersOpen, setIsSoldPlayersOpen, soldPlayers, setSelectedPlayer } = useAuction();
  const [selectedSoldPlayer, setSelectedSoldPlayer] = useState(null);

  if (!isSoldPlayersOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsSoldPlayersOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Drafted & Sold Players
            </h2>
            <p className="text-xs text-slate-400">
              Total {soldPlayers.length} athletes signed across all franchises
            </p>
          </div>
        </div>

        {/* List of Sold Players */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2.5 pr-1">
          {soldPlayers.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No players have been sold yet in this auction edition.
            </div>
          ) : (
            soldPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => {
                  setSelectedPlayer(player);
                  setIsSoldPlayersOpen(false);
                }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b1328]/90 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all group"
              >
                {/* Left: Player Avatar + Info */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                    <img
                      src={player.image_url}
                      alt={player.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { e.target.src = '/images/tennis-ball-glow.svg'; }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {player.name}
                      </span>
                      <span className="text-xs">{player.country_flag}</span>
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      {player.category} • Hand: {player.playing_hand} • World Rank: #{player.world_ranking}
                    </div>
                  </div>
                </div>

                {/* Middle: Winning Team Badge */}
                <div className="hidden sm:flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Drafted By</span>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200 mt-0.5">
                    {player.sold_to_team?.logo_url && (
                      <img src={player.sold_to_team.logo_url} alt="" className="w-4 h-4 object-contain" />
                    )}
                    <span>{player.sold_to_team?.name || 'Franchise'}</span>
                  </div>
                </div>

                {/* Right: Final Bid & SOLD Status */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Bid</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400 font-display">
                      ₹ {Number(player.purchase_price || player.base_price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-[10px] font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    SOLD
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-right">
          <button
            onClick={() => setIsSoldPlayersOpen(false)}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
