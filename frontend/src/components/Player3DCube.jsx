import React, { useState, useEffect } from 'react';
import './Player3DCube.css';

// Exact 6-item sequence:
// 1. Player -> 2. PV Logo -> 3. Player -> 4. Devee Logo -> 5. Player -> 6. Tournament Logo
const CYCLE_SEQUENCE = [
  'player',
  'pv',
  'player',
  'devee',
  'player',
  'tournament',
];

export default function Player3DCube({ player }) {
  const [imageError, setImageError] = useState(false);
  const [step, setStep] = useState(0);

  // Reset image error and restart sequence at player whenever active player changes
  useEffect(() => {
    setImageError(false);
    setStep(0);
  }, [player?.id, player?.image_url]);

  // Continuous rightward step progression (4.0s hold + 1.0s smooth 3D rotation = 5.0s total per face)
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const playerImageUrl = player?.image_url || '';
  const playerName = player?.name || 'PLAYER';
  const playerCategory = player?.category || 'Group A';

  // Math helper for proper 90-degree 4-face cube:
  // Face indices: 0 = Front, 1 = Right, 2 = Back, 3 = Left
  // Content updates ONLY when a face is at the back (180deg away from viewer), so visible turns never flicker!
  const getFaceItemType = (faceIndex) => {
    const relPos = (faceIndex - (step % 4) + 4) % 4;
    if (relPos === 0) return CYCLE_SEQUENCE[step % 6];
    if (relPos === 1) return CYCLE_SEQUENCE[(step + 1) % 6];
    if (relPos === 2) return CYCLE_SEQUENCE[(step + 2) % 6];
    return CYCLE_SEQUENCE[(step - 1 + 6) % 6]; // relPos === 3 (left face, holds previous until it reaches back)
  };

  const renderFaceContent = (itemType) => {
    switch (itemType) {
      case 'player':
        return (
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

      case 'pv':
        return (
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
        );

      case 'devee':
        return (
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
        );

      case 'tournament':
        return (
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="cube-showcase-scene">
      <div className="cube-3d-wrapper">
        {/* Floor ambient shadow beneath the rotating cube */}
        <div className="cube-floor-shadow" />

        {/* Proper 3D Cube with smooth 90-degree continuous rightward rotation */}
        <div
          className="cube-3d"
          style={{
            transform: `rotateY(${step * -90}deg)`,
            transition: 'transform 1s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
          }}
        >
          {/* 1. FRONT FACE (0deg) */}
          <div className="cube-face cube-face-front">
            {renderFaceContent(getFaceItemType(0))}
          </div>

          {/* 2. RIGHT FACE (90deg) */}
          <div className="cube-face cube-face-right">
            {renderFaceContent(getFaceItemType(1))}
          </div>

          {/* 3. BACK FACE (180deg) */}
          <div className="cube-face cube-face-back">
            {renderFaceContent(getFaceItemType(2))}
          </div>

          {/* 4. LEFT FACE (270deg / -90deg) */}
          <div className="cube-face cube-face-left">
            {renderFaceContent(getFaceItemType(3))}
          </div>

          {/* 5. TOP FACE: Square Metallic Cap */}
          <div className="cube-face cube-face-top">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-slate-400/40 bg-slate-300/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-slate-400/30" />
              </div>
            </div>
          </div>

          {/* 6. BOTTOM FACE: Square Dark Metallic Cap */}
          <div className="cube-face cube-face-bottom">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-slate-600/40 bg-slate-800/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
