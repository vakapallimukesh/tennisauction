import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { Award, ShieldAlert, Users, Layers } from 'lucide-react';

export default function Header() {
  const { sponsors, setIsAdminOpen, setIsSoldPlayersOpen, soldPlayers } = useAuction();

  return (
    <header className="w-full bg-[#080e22]/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 px-3 lg:px-6 py-2.5">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Tournament Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-lime-500 to-emerald-400 p-0.5 shadow-neon-green flex items-center justify-center">
              <img 
                src="/images/tennis-ball-glow.svg" 
                alt="Tennis Ball" 
                className="w-full h-full animate-tennis-spin"
              />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-slate-300">
                TENNIS LEAGUE
              </div>
              <div className="text-xl lg:text-2xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 font-display">
                PLAYER AUCTION
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-8 w-[1px] bg-slate-800" />

          {/* Quick Navigation Pills */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setIsSoldPlayersOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 transition-all hover:border-emerald-500/50"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sold ({soldPlayers?.length || 0})</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 text-xs font-semibold text-emerald-300 transition-all shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Controller</span>
            </button>
          </div>
        </div>

        {/* Center: Sponsor Strip (Matching reference image exactly) */}
        <div className="hidden xl:flex items-center gap-6 text-xs text-slate-400 border-x border-slate-800/80 px-6">
          {/* Powered By */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">POWERED BY</span>
            <div className="h-5 flex items-center">
              <img src="/images/sponsors/sportwave.svg" alt="SportWave" className="h-4 object-contain" />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Co-Sponsor */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">CO-SPONSOR</span>
            <div className="h-5 flex items-center">
              <img src="/images/sponsors/apexhealth.svg" alt="ApexHealth" className="h-4 object-contain" />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Associate Sponsor */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">ASSOCIATE SPONSOR</span>
            <div className="h-5 flex items-center">
              <img src="/images/sponsors/novatech.svg" alt="NovaTech" className="h-4 object-contain" />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Official Partner */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">OFFICIAL PARTNER</span>
            <div className="h-5 flex items-center">
              <img src="/images/sponsors/grandvista.svg" alt="GrandVista" className="h-4 object-contain" />
            </div>
          </div>
        </div>

        {/* Right: Motto & 3D Glowing Tennis Ball */}
        <div className="flex items-center gap-3">
          {/* Slogan */}
          <div className="text-right leading-tight">
            <div className="text-[11px] font-black tracking-widest text-emerald-400 uppercase">
              BIGGER DREAMS
            </div>
            <div className="text-[11px] font-black tracking-widest text-emerald-300 uppercase">
              BOLDER PLAYERS
            </div>
          </div>

          {/* Glowing 3D Tennis Ball */}
          <div className="relative w-11 h-11 flex-shrink-0 animate-float">
            <img 
              src="/images/tennis-ball-glow.svg" 
              alt="Tennis Action Ball" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(74,222,128,0.7)]"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
