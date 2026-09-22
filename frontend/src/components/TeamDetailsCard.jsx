import React, { useEffect, useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { api } from '../services/api';
import { ArrowLeft, X, Coins, Users, ChevronRight } from 'lucide-react';

export default function TeamDetailsCard() {
  const { viewTeamId, setViewTeamId, setSelectedPlayer } = useAuction();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  if (!viewTeamId || !teamData) return null;

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl p-3 lg:p-3.5 border border-slate-800/80 relative overflow-hidden">
      
      {/* Top Header: Team Logo, Name, Owner & Close [X] */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-slate-950 p-1 border border-slate-800 flex-shrink-0 flex items-center justify-center">
            <img
              src={teamData.logo_url}
              alt={teamData.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                TEAM {teamData.team_number} DETAILS
              </span>
            </div>
            <h3 className="text-xs font-bold text-white truncate">
              {teamData.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right text-[10px] hidden sm:block">
            <span className="text-slate-500 block">Team Owner</span>
            <span className="font-bold text-slate-300">{teamData.owner}</span>
          </div>

          <button
            onClick={() => setViewTeamId(null)}
            className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close team details"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Stats Bar: Purse Remaining & Total Players Bought */}
      <div className="grid grid-cols-2 gap-2 py-1.5 my-1.5 border-b border-slate-800/60 text-xs">
        <div className="bg-[#0b1328]/90 px-2 py-1 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Purse Remaining</span>
          <span className="font-bold font-display text-emerald-400 text-xs">
            ₹ {Number(teamData.purse_remaining).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-[#0b1328]/90 px-2 py-1 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Total Players Bought</span>
          <span className="font-bold font-display text-white text-xs">
            {teamData.players_bought || 0} / {teamData.max_players || 10}
          </span>
        </div>
      </div>

      {/* PURCHASED PLAYERS Header */}
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
        <span>PURCHASED PLAYERS</span>
        <span className="text-[9px] text-slate-500 font-normal">
          {teamData.purchased_players?.length || 0} signed
        </span>
      </div>

      {/* Purchased Players List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
        {!teamData.purchased_players || teamData.purchased_players.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No players purchased yet.
          </div>
        ) : (
          teamData.purchased_players.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              className="flex items-center justify-between p-1.5 rounded-lg bg-[#0b1328]/80 hover:bg-slate-800/70 border border-slate-800/80 cursor-pointer transition-all group"
            >
              {/* Player Avatar & Info */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { e.target.src = '/images/tennis-ball-glow.svg'; }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span>{p.name}</span>
                    {(p.is_captain || p.designation === 'CAPTAIN') && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 shadow-xs shrink-0">
                        👑 CAPTAIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {p.category} • <span className="font-bold text-emerald-400">{p.is_captain ? 'CAPTAIN' : `₹ ${Number(p.purchase_price).toLocaleString('en-IN')}`}</span>
                  </div>
                </div>
              </div>

              {/* Stats: Matches, Win %, Aces */}
              <div className="flex items-center gap-3 text-right text-[10px] flex-shrink-0">
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase">Matches</span>
                  <span className="font-bold text-slate-200">{p.matches || 12}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase">Win %</span>
                  <span className="font-bold text-emerald-400">{p.win_percentage || 72}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase">Aces</span>
                  <span className="font-bold text-sky-400">{p.aces || 45}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-white" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Button: [ ← BACK TO AUCTION ] */}
      <div className="pt-2 mt-1 border-t border-slate-800/80">
        <button
          onClick={() => setViewTeamId(null)}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold tracking-wider uppercase text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO AUCTION</span>
        </button>
      </div>

    </div>
  );
}
