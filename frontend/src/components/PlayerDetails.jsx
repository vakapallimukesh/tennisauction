import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { User, Sparkles, Award, TrendingUp, ShieldCheck } from 'lucide-react';

export default function PlayerDetails() {
  const { selectedPlayer, activeTab, setActiveTab } = useAuction();

  if (!selectedPlayer) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-panel rounded-2xl p-4 border border-slate-800 text-center">
        <User className="w-8 h-8 text-slate-600 mb-1" />
        <p className="text-slate-400 text-xs">Select a player to view details</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl p-3 lg:p-3.5 border border-slate-800/80 relative overflow-hidden">
      
      {/* Subtle Tennis Ball Watermark */}
      <div className="absolute -bottom-6 -right-6 w-28 h-28 opacity-10 pointer-events-none">
        <img src="/images/tennis-ball-glow.svg" alt="Watermark" className="w-full h-full" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800/60 flex-shrink-0">
        <User className="w-4 h-4 text-slate-300" />
        <h2 className="text-xs lg:text-sm font-extrabold tracking-wider text-white uppercase font-display">
          PLAYER DETAILS
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800/80 pb-1.5 mb-2 text-xs font-semibold flex-shrink-0">
        {['Overview', 'Stats', 'History'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-1 transition-colors ${
              activeTab === tab
                ? 'text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-neon-green" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {activeTab === 'Overview' && (
          <div className="relative">
            {/* Signature "Next Big Star" graphic */}
            <div className="absolute right-0 top-8 pointer-events-none select-none z-10 text-right">
              <div className="handwriting-text text-xl lg:text-2xl font-black text-lime-400 leading-none">
                Next<br/>
                Big<br/>
                Star
              </div>
              <Sparkles className="w-4 h-4 text-amber-300 ml-auto -mt-1 animate-bounce" />
            </div>

            {/* Key-Value Pairs List */}
            <div className="space-y-1.5 text-[11px] lg:text-xs max-w-[70%]">
              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Name</span>
                <span className="font-bold text-white text-right truncate max-w-[120px]">{selectedPlayer.name}</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Age</span>
                <span className="font-semibold text-slate-200">{selectedPlayer.age}</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Country</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <span>{selectedPlayer.country_flag || '🇮🇳'}</span>
                  <span className="truncate">{selectedPlayer.country}</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Category</span>
                <span className="font-semibold text-slate-200">{selectedPlayer.category}</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Playing Hand</span>
                <span className="font-semibold text-slate-200 truncate">{selectedPlayer.playing_hand}</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">World Ranking</span>
                <span className="font-bold text-emerald-400">{selectedPlayer.world_ranking}</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Wins</span>
                <span className="font-bold text-slate-200">{selectedPlayer.wins}</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-400">Aces</span>
                <span className="font-bold text-sky-400">{selectedPlayer.aces}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Stats' && (
          <div className="space-y-2 text-[11px] lg:text-xs">
            <div className="bg-[#0b1328] p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>1st Serve %</span>
                <span className="text-emerald-400 font-bold">{selectedPlayer.win_percentage || 68}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${selectedPlayer.win_percentage || 68}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b1328] p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Avg Serve Speed</span>
                <span className="text-sky-400 font-bold">208 km/h</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="bg-[#0b1328] p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Break Points Saved</span>
                <span className="text-amber-400 font-bold">74%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div className="bg-[#0b1328] p-2 rounded-lg border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Forehand Winners</span>
                <span className="text-purple-400 font-bold">142</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="p-2 rounded-lg bg-[#0b1328] border border-slate-800 flex items-start gap-2">
              <Award className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-white">National Hardcourt Champion</div>
                <div className="text-slate-400 text-[10px]">6 consecutive match wins</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#0b1328] border border-slate-800 flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-white">ATP Challenger Tour Quarter-Finals</div>
                <div className="text-slate-400 text-[10px]">Defeated top 100 seeds</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#0b1328] border border-slate-800 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-white">ITF Junior Circuit Leader</div>
                <div className="text-slate-400 text-[10px]">Peak junior rank #14</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
