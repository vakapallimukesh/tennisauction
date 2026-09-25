import React, { useState } from 'react';
import './Player3DCube.css';

export default function Player3DCube({ player }) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state whenever player changes
  React.useEffect(() => {
    setImageError(false);
  }, [player?.id, player?.image_url]);

  const playerImageUrl = player?.image_url || '';
  const playerName = player?.name || 'PLAYER';
  const playerCategory = player?.category || 'Group A';

  // Helper for rendering player face consistently
  const renderPlayerFace = () => (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col justify-between">
      {/* Player Image */}
      {!imageError && playerImageUrl ? (
        <img
          src={playerImageUrl}
          alt={playerName}
          className="w-full h-full object-cover object-top cube-player-photo"
          onError={() => setImageError(true)}
          loading="eager"
          decoding="sync"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3">
            <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="text-white text-xs font-bold uppercase tracking-wider font-montserrat-bold">
            {playerName}
          </span>
        </div>
      )}

      {/* Top Tag Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 border border-white/25 text-[10px] font-black uppercase text-emerald-400 tracking-wider shadow-md font-montserrat-bold">
          {playerCategory}
        </span>
      </div>
    </div>
  );

  return (
    <div className="cube-showcase-scene">
      <div className="cube-3d-wrapper">
        {/* Floor ambient shadow beneath the rotating cube */}
        <div className="cube-floor-shadow" />

        {/* 3D Rotating Showcase — resets animation smoothly when player changes */}
        <div className="cube-3d" key={player?.id || 'default-player'}>
          {/* 1. FACE 1: Player Photo */}
          <div className="cube-face cube-face-1">
            {renderPlayerFace()}
          </div>

          {/* 2. FACE 2: PV Enterprises Sponsor Logo */}
          <div className="cube-face cube-face-2">
            <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-b from-white via-slate-50 to-slate-100">
              {/* Header Badge */}
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-900 font-montserrat-bold">
                  OFFICIAL SPONSOR
                </span>
              </div>

              {/* Sponsor Logo */}
              <div className="flex-1 flex items-center justify-center px-2 w-full my-auto overflow-hidden">
                <img
                  src="/images/sponsors/pv-enterprises.png"
                  alt="PV Enterprises"
                  className="max-h-40 sm:max-h-48 md:max-h-52 w-auto max-w-[94%] object-contain cube-sponsor-logo select-none"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  loading="eager"
                  decoding="sync"
                />
              </div>

              {/* Footer */}
              <div className="w-full text-center border-t border-slate-200 pt-1.5">
                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider font-montserrat-bold">
                  PV ENTERPRISES
                </span>
              </div>
            </div>
          </div>

          {/* 3. FACE 3: Player Photo */}
          <div className="cube-face cube-face-3">
            {renderPlayerFace()}
          </div>

          {/* 4. FACE 4: Devee Group Sponsor Logo */}
          <div className="cube-face cube-face-4">
            <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-b from-white via-slate-50 to-slate-100">
              {/* Header Badge */}
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 font-montserrat-bold">
                  OFFICIAL SPONSOR
                </span>
              </div>

              {/* Sponsor Logo */}
              <div className="flex-1 flex items-center justify-center px-2 w-full my-auto overflow-hidden">
                <img
                  src="/images/sponsors/devee-group.png"
                  alt="Devee Group"
                  className="max-h-40 sm:max-h-48 md:max-h-52 w-auto max-w-[94%] object-contain cube-sponsor-logo select-none"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  loading="eager"
                  decoding="sync"
                />
              </div>

              {/* Footer */}
              <div className="w-full text-center border-t border-slate-200 pt-1.5">
                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider font-montserrat-bold">
                  DEVEE GROUP
                </span>
              </div>
            </div>
          </div>

          {/* 5. FACE 5: Player Photo */}
          <div className="cube-face cube-face-5">
            {renderPlayerFace()}
          </div>

          {/* 6. FACE 6: Bhimavaram Tennis League Tournament Logo */}
          <div className="cube-face cube-face-6">
            <div className="relative w-full h-full flex flex-col items-center justify-between p-3.5 bg-gradient-to-b from-white via-slate-50 to-slate-100">
              {/* Header Badge */}
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 font-montserrat-bold">
                  OFFICIAL TOURNAMENT
                </span>
              </div>

              {/* Tournament Logo */}
              <div className="flex-1 flex items-center justify-center px-1.5 w-full my-auto overflow-hidden">
                <img
                  src="/images/tennis-league-logo.png"
                  alt="Bhimavaram Tennis League"
                  className="max-h-40 sm:max-h-48 md:max-h-52 w-auto max-w-[94%] object-contain cube-sponsor-logo select-none"
                  onError={(e) => {
                    e.target.src = '/images/bhimavaram-tennis-league.png';
                  }}
                  loading="eager"
                  decoding="sync"
                />
              </div>

              {/* Footer */}
              <div className="w-full text-center border-t border-slate-200 pt-1.5">
                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider font-montserrat-bold">
                  BHIMAVARAM TENNIS LEAGUE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
