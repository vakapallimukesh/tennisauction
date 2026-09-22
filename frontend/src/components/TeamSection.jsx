import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { ArrowRight, Coins, Users } from 'lucide-react';

export default function TeamSection() {
  const { teams, viewTeamId, setViewTeamId } = useAuction();

  // Helper to get border and glow class per team number
  const getTeamTheme = (teamNumber) => {
    switch (teamNumber) {
      case 1:
        return {
          cardClass: 'team-card-green',
          badgeText: 'text-emerald-400',
          btnClass: 'border-emerald-500/80 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 shadow-neon-green',
          purseColor: 'text-emerald-400',
          iconColor: 'text-emerald-400'
        };
      case 2:
        return {
          cardClass: 'team-card-blue',
          badgeText: 'text-sky-400',
          btnClass: 'border-sky-500/80 hover:bg-sky-500 text-sky-300 hover:text-slate-950 shadow-neon-blue',
          purseColor: 'text-sky-400',
          iconColor: 'text-sky-400'
        };
      case 3:
        return {
          cardClass: 'team-card-purple',
          badgeText: 'text-purple-400',
          btnClass: 'border-purple-500/80 hover:bg-purple-500 text-purple-300 hover:text-slate-950 shadow-neon-purple',
          purseColor: 'text-purple-400',
          iconColor: 'text-purple-400'
        };
      case 4:
      default:
        return {
          cardClass: 'team-card-orange',
          badgeText: 'text-orange-400',
          btnClass: 'border-orange-500/80 hover:bg-orange-500 text-orange-300 hover:text-slate-950 shadow-neon-orange',
          purseColor: 'text-orange-400',
          iconColor: 'text-orange-400'
        };
    }
  };

  return (
    <div className="h-full w-full">
      <div className="h-full grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3">
        {teams.map((team) => {
          const theme = getTeamTheme(team.team_number);
          const isSelected = viewTeamId === team.id;

          return (
            <div
              key={team.id}
              className={`h-full relative rounded-2xl p-2.5 sm:p-3 lg:p-3.5 bg-[#0a1128]/85 backdrop-blur-md flex flex-col justify-between items-center text-center transition-all duration-200 ${theme.cardClass} ${
                isSelected ? 'ring-2 ring-white/20' : ''
              }`}
            >
              {/* Mascot Logo */}
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 flex items-center justify-center my-0.5">
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>

              {/* Team Name */}
              <div className="my-0.5">
                <h3 className={`text-sm lg:text-base font-black uppercase tracking-wider font-display ${theme.badgeText}`}>
                  TEAM {team.team_number}
                </h3>
                <p className="text-[11px] lg:text-xs font-semibold text-slate-300 tracking-wide truncate max-w-[140px] mx-auto">
                  {team.name}
                </p>
              </div>

              {/* Stats: Purse Remaining & Players Bought */}
              <div className="w-full py-1.5 border-y border-slate-800/80 space-y-1 my-0.5 text-left">
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Coins className={`w-3 h-3 ${theme.iconColor}`} />
                    <span className="text-[10px]">Purse</span>
                  </div>
                  <span className={`font-bold font-display text-xs ${theme.purseColor}`}>
                    ₹ {Number(team.purse_remaining).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between px-1 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px]">Players</span>
                  </div>
                  <span className="font-bold text-white text-xs">
                    {team.players_bought || 0} / {team.max_players || 10}
                  </span>
                </div>
              </div>

              {/* VIEW TEAM Button */}
              <button
                onClick={() => setViewTeamId(team.id)}
                className={`w-full py-1.5 px-2 rounded-xl border bg-transparent font-bold text-[10px] lg:text-[11px] tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1 ${theme.btnClass}`}
              >
                <span>VIEW TEAM</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
