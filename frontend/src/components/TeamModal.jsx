import React, { useEffect, useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { api } from '../services/api';
import { ArrowLeft, X, Trophy, Coins, Users, ShieldCheck, ChevronRight } from 'lucide-react';

export default function TeamModal() {
  const { viewTeamId, setViewTeamId, setSelectedPlayer } = useAuction();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!viewTeamId) {
      setTeamData(null);
      return;
    }

    setLoading(true);
    api.getTeamById(viewTeamId)
      .then(data => {
        setTeamData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch team details:', err);
        setLoading(false);
      });
  }, [viewTeamId]);

  if (!viewTeamId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={() => setViewTeamId(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !teamData ? (
          <div className="py-20 text-center text-slate-400">Loading team details...</div>
        ) : (
          <>
            {/* Header: Logo, Name, Owner */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-950 p-2 border border-slate-800 flex-shrink-0 flex items-center justify-center">
                <img
                  src={teamData.logo_url}
                  alt={teamData.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    TEAM {teamData.team_number}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">Owner: <strong className="text-slate-200">{teamData.owner}</strong></span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display mt-0.5">
                  {teamData.name}
                </h2>
                <p className="text-xs text-slate-400 italic mt-0.5">{teamData.tagline}</p>
              </div>
            </div>

            {/* Financial & Squad Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 my-2 border-b border-slate-800/80">
              <div className="bg-[#0b1328] p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  Purse Remaining
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-400 mt-1 font-display">
                  ₹ {Number(teamData.purse_remaining).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-[#0b1328] p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-slate-400" />
                  Total Purse
                </div>
                <div className="text-base sm:text-lg font-black text-slate-200 mt-1 font-display">
                  ₹ {Number(teamData.total_purse).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-[#0b1328] p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-sky-400" />
                  Players Bought
                </div>
                <div className="text-base sm:text-lg font-black text-white mt-1 font-display">
                  {teamData.players_bought || 0} / {teamData.max_players || 10}
                </div>
              </div>

              <div className="bg-[#0b1328] p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Slots Open
                </div>
                <div className="text-base sm:text-lg font-black text-amber-300 mt-1 font-display">
                  {Math.max(0, (teamData.max_players || 10) - (teamData.players_bought || 0))}
                </div>
              </div>
            </div>

            {/* PURCHASED PLAYERS Header */}
            <div className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>PURCHASED PLAYERS</span>
              <span className="text-[11px] font-normal text-slate-500">
                {teamData.purchased_players?.length || 0} Drafted
              </span>
            </div>

            {/* Purchased Players List matching reference image layout */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {!teamData.purchased_players || teamData.purchased_players.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  This team has not acquired any players in the auction yet.
                </div>
              ) : (
                teamData.purchased_players.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlayer(p);
                      setViewTeamId(null); // Return to auction with player details loaded
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0b1328]/90 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all group"
                  >
                    {/* Left: Avatar & Title */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            e.target.src = '/images/tennis-ball-glow.svg';
                          }}
                        />
                      </div>

                      <div>
                        <div className="font-bold text-white text-sm sm:text-base group-hover:text-emerald-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.category} • Ranking: <span className="text-slate-200 font-semibold">{p.world_ranking}</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">
                          Purchased: ₹ {Number(p.purchase_price).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Right: Matches, Win %, Aces (Matching reference image) */}
                    <div className="flex items-center gap-4 sm:gap-6 text-right text-xs">
                      <div className="hidden sm:block">
                        <span className="text-slate-500 block text-[10px] uppercase">Matches</span>
                        <span className="font-bold text-slate-200">{p.matches || 12}</span>
                      </div>

                      <div className="hidden sm:block">
                        <span className="text-slate-500 block text-[10px] uppercase">Win %</span>
                        <span className="font-bold text-emerald-400">{p.win_percentage || 72}%</span>
                      </div>

                      <div className="hidden sm:block">
                        <span className="text-slate-500 block text-[10px] uppercase">Aces</span>
                        <span className="font-bold text-sky-400">{p.aces || 45}</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom: Back to Auction Button */}
            <div className="pt-4 mt-2 border-t border-slate-800">
              <button
                onClick={() => setViewTeamId(null)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 font-bold text-sm tracking-wider uppercase text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO AUCTION</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
