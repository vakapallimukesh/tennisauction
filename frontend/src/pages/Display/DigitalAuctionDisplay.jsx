import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function DigitalAuctionDisplay() {
  const {
    auction,
    currentPlayer,
    teams,
    timeLeft,
    timerRunning,
    recentBids,
    soldCelebration,
    unsoldNotice
  } = useAuction();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const highestTeam = auction?.highest_bidder_team_id
    ? teams.find(t => t.id === auction.highest_bidder_team_id)
    : null;

  const currentBid = auction?.current_bid || currentPlayer?.base_price || 12450000;

  // Format currency
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '$0';
    return '$' + Number(val).toLocaleString();
  };

  // Format timer
  const formattedTimer = `00:${timeLeft < 10 ? '0' : ''}${Math.max(0, timeLeft)}`;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface text-on-surface overflow-hidden select-none relative font-sans">
      {/* Dynamic Background Aura from Leading Franchise */}
      {highestTeam && (
        <div 
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-all duration-1000"
          style={{ backgroundColor: highestTeam.primary_color || '#00e55b' }}
        />
      )}

      {/* Top Broadcast Telemetry Bar */}
      <div className="flex items-center justify-between px-gutter py-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/15 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error animate-ping" />
            <span className="font-headline-sm uppercase tracking-wider text-error">LIVE BROADCAST FEED</span>
          </div>
          <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-label-md text-on-surface-variant uppercase">
            <span className="material-symbols-outlined text-tertiary text-[18px]">stadia_controller</span>
            <span>Stadium Arena Screen • Court 01</span>
          </div>
        </div>

        {/* Master Timer & Fullscreen Control */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-surface-container-low px-6 py-2 rounded-xl border border-outline-variant/15 shadow-md">
            <span className={`material-symbols-outlined ${timerRunning ? 'text-tertiary animate-pulse' : 'text-on-surface-variant'}`}>
              timer
            </span>
            <div className="flex flex-col items-end">
              <span className="text-label-md text-on-surface-variant uppercase tracking-widest">LOT TIMER</span>
              <span className={`font-headline-md tracking-tight font-bold tabular-nums ${timeLeft <= 5 ? 'text-error animate-pulse' : 'text-tertiary'}`}>
                {formattedTimer}
              </span>
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-tertiary transition-colors"
            title="Toggle Fullscreen"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Arena Display Grid */}
      <div className="grid grid-cols-12 gap-gutter p-gutter max-w-[1920px] mx-auto w-full flex-1 z-10">
        {/* Left Column: Team Budgets & Squad Slots (4 Teams) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-space-md">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-headline-sm text-primary uppercase tracking-wider text-label-md">Franchise Telemetry</h2>
            <span className="material-symbols-outlined text-tertiary text-[16px]">monitoring</span>
          </div>

          {teams.map((team, idx) => {
            const isLeading = highestTeam?.id === team.id;
            const squadCount = team.players_bought || team.players?.length || (8 + idx);
            const maxSquad = team.max_players || 12;
            const remainingPurse = team.purse_remaining || (40000000 - idx * 5000000);

            return (
              <div 
                key={team.id}
                className={`bg-surface-container p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden transition-all ${
                  isLeading 
                    ? 'ring-2 ring-tertiary shadow-lg shadow-tertiary/10 bg-surface-container-high' 
                    : 'hover:bg-surface-container-high border border-outline-variant/10'
                }`}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-tertiary/10 to-transparent pointer-events-none" 
                />

                <div className="flex justify-between items-start">
                  <div>
                    {isLeading ? (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                        <span className="text-label-md text-tertiary uppercase tracking-widest font-bold">HIGHEST BIDDER</span>
                      </div>
                    ) : (
                      <span className="text-label-md text-secondary uppercase tracking-widest">
                        Team 0{team.team_number || idx + 1}
                      </span>
                    )}
                    <h3 className="font-headline-sm text-on-surface">{team.name}</h3>
                  </div>

                  <span 
                    className="material-symbols-outlined p-2 rounded-lg text-[20px]"
                    style={{ 
                      backgroundColor: isLeading ? '#000e02' : '#47464d',
                      color: isLeading ? '#00e55b' : '#c8c5cd'
                    }}
                  >
                    {isLeading ? 'military_tech' : 'shield'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/10">
                  <div>
                    <span className="text-label-md text-on-surface-variant block">BUDGET REMAINING</span>
                    <span className={`font-headline-sm tracking-tight ${isLeading ? 'text-tertiary' : 'text-primary'}`}>
                      {formatCurrency(remainingPurse)}
                    </span>
                  </div>
                  <div>
                    <span className="text-label-md text-on-surface-variant block">SQUAD SLOTS</span>
                    <span className="font-headline-sm text-on-surface tracking-tight">
                      {squadCount} / {maxSquad}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center & Right Columns: Current Player on Block & Stats */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-12 gap-gutter">
          {/* Player Large Photo & Visual Card */}
          <div className="col-span-12 lg:col-span-7 bg-surface-container rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[520px] shadow-2xl border border-outline-variant/15">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
              style={{ 
                backgroundImage: `url('${currentPlayer?.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7KkXPoWb1uadrsImUu8nKRyrPjLB8hep2qDhDLpBf0Horq_VQCrrtvgf20oc9Q2fd20EYGgueS4HhEwOfftm7hzPAzv_Pe48zvN3R7EwhBUskKfULc_vDWU8CFWqcFXxTs1GUGDXm-A18TzRj5DKQizJOPUZZtMUkYgykxwkkE8P8GoSHbTXgNEGysIz1h9MQYXUuqElUdpFo89BSnAJqSVTu0MsvAfx-FxvRfqcbu9LwNhC3dmSw'}')` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent" />

            {/* Top Badge */}
            <div className="relative z-10 p-6 flex justify-between items-start">
              <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/20 shadow-md">
                <span className="material-symbols-outlined text-tertiary text-[18px]">workspace_premium</span>
                <span className="text-label-md uppercase tracking-wider text-on-surface">
                  LOT #{currentPlayer?.player_number || '042'} • {currentPlayer?.category?.toUpperCase() || 'PREMIUM SINGLES'}
                </span>
              </div>
              <div className="bg-tertiary text-on-tertiary font-headline-sm text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold shadow-lg">
                ACTIVE BLOCK
              </div>
            </div>

            {/* Player Name & Core Info */}
            <div className="relative z-10 p-8 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-label-md text-tertiary uppercase tracking-widest bg-tertiary-container px-2.5 py-1 rounded border border-tertiary/20">
                  ATP RANK #{currentPlayer?.world_ranking || 3}
                </span>
                <span className="text-label-md text-on-surface-variant uppercase tracking-widest">
                  {currentPlayer?.country?.toUpperCase() || 'SWITZERLAND'} • AGE {currentPlayer?.age || 24}
                </span>
              </div>
              <h1 className="font-headline-lg text-white text-4xl lg:text-5xl tracking-tight uppercase">
                {currentPlayer?.name || 'MATTEO VANDERBILT'}
              </h1>
              <p className="text-on-surface-variant text-body-lg max-w-xl line-clamp-2">
                Renowned baseline dominator with an explosive first serve and exceptional court coverage under high-pressure tiebreaks.
              </p>
            </div>
          </div>

          {/* Stats & Current Bid Panel */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-space-md">
            {/* Current Bid Showcase Card */}
            <div className="bg-surface-container-high p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-tertiary/30 shadow-xl">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-md text-on-surface-variant uppercase tracking-widest">CURRENT BID AMOUNT</span>
                <span className="flex items-center gap-1.5 text-tertiary bg-tertiary-container px-3 py-1 rounded-full text-label-md border border-tertiary/20">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>LIVE VALUATION</span>
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="font-headline-lg text-4xl xl:text-6xl text-tertiary font-bold tracking-tight">
                  {formatCurrency(currentBid)}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container border border-tertiary/20 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined font-bold">shield</span>
                  </div>
                  <div>
                    <span className="text-label-md text-on-surface-variant block uppercase">LEADING FRANCHISE</span>
                    <span className="font-headline-sm text-on-surface truncate block max-w-[180px]">
                      {highestTeam ? highestTeam.name : 'Waiting for Opening Bid'}
                    </span>
                  </div>
                </div>
                <span className="text-label-md text-tertiary uppercase tracking-wider bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/20">
                  {highestTeam ? 'LOCKED' : 'OPEN'}
                </span>
              </div>
            </div>

            {/* Player Telemetry & Attributes Grid */}
            <div className="bg-surface-container p-6 rounded-2xl flex flex-col gap-4 flex-1 border border-outline-variant/15">
              <h3 className="font-headline-sm text-primary uppercase text-label-md tracking-wider">
                Performance Telemetry
              </h3>

              <div className="space-y-4">
                {/* Stat 1 */}
                <div>
                  <div className="flex justify-between text-label-md mb-1">
                    <span className="text-on-surface-variant">FIRST SERVE ACCURACY</span>
                    <span className="text-tertiary font-bold">88.4%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: '88.4%' }} />
                  </div>
                </div>

                {/* Stat 2 */}
                <div>
                  <div className="flex justify-between text-label-md mb-1">
                    <span className="text-on-surface-variant">BREAK POINT CONVERSION</span>
                    <span className="text-tertiary font-bold">74.2%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: '74.2%' }} />
                  </div>
                </div>

                {/* Stat 3 */}
                <div>
                  <div className="flex justify-between text-label-md mb-1">
                    <span className="text-on-surface-variant">CLUTCH INDEX (PRESSURE)</span>
                    <span className="text-tertiary font-bold">94.8 / 100</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Bid Ticker Footer Bar */}
      <div className="mt-auto bg-surface-container-lowest border-t border-outline-variant/10 py-3 px-gutter flex items-center overflow-hidden z-20">
        <div className="flex items-center gap-2 mr-6 shrink-0 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/20">
          <span className="material-symbols-outlined text-tertiary text-[18px]">history_edu</span>
          <span className="text-label-md uppercase tracking-wider text-primary">LIVE BID TICKER</span>
        </div>

        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar whitespace-nowrap text-body-md text-on-surface-variant">
          {recentBids && recentBids.length > 0 ? (
            recentBids.slice(0, 8).map((bid, i) => (
              <div key={bid.id || i} className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant/10">
                <span className="text-tertiary font-bold">{bid.team_name || `Team #${bid.team_id}`}</span>
                <span className="text-on-surface">bid</span>
                <span className="text-primary font-bold">{formatCurrency(bid.amount)}</span>
                <span className="text-outline text-xs">
                  {bid.bid_time ? new Date(bid.bid_time).toLocaleTimeString() : `${i * 12 + 10}s ago`}
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
                <span className="text-tertiary font-bold">Falcons Apex</span>
                <span className="text-on-surface">bid</span>
                <span className="text-primary font-bold">$12,450,000</span>
                <span className="text-outline text-xs">12s ago</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
                <span className="text-secondary font-bold">Eagles VC</span>
                <span className="text-on-surface">bid</span>
                <span className="text-primary font-bold">$12,200,000</span>
                <span className="text-outline text-xs">28s ago</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
                <span className="text-secondary font-bold">Strikers Elite</span>
                <span className="text-on-surface">bid</span>
                <span className="text-primary font-bold">$11,800,000</span>
                <span className="text-outline text-xs">45s ago</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dramatic SOLD Celebration Broadcast Modal */}
      {soldCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
          <div className="bg-surface-container-highest border-2 border-tertiary rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-tertiary/20 border-2 border-tertiary text-tertiary mx-auto flex items-center justify-center mb-4 animate-bounce">
              <span className="material-symbols-outlined text-4xl">gavel</span>
            </div>
            <div className="inline-block px-4 py-1 rounded-full bg-tertiary text-on-tertiary font-headline-sm uppercase tracking-widest text-sm mb-2 font-bold">
              HAMMER DOWN • SOLD!
            </div>
            <h2 className="font-headline-lg text-white text-4xl my-2">
              {soldCelebration.player?.name || currentPlayer?.name}
            </h2>
            <p className="text-on-surface-variant text-lg">
              Acquired by <span className="text-tertiary font-bold">{soldCelebration.team?.name}</span> for{' '}
              <span className="text-white font-bold">{formatCurrency(soldCelebration.price || currentBid)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Unsold Notice Broadcast Card */}
      {unsoldNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-surface-container-high border-2 border-error rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-error/20 border border-error text-error mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">close</span>
            </div>
            <h2 className="font-headline-md text-error mb-1">PLAYER UNSOLD</h2>
            <p className="text-on-surface-variant">
              {unsoldNotice.player?.name || currentPlayer?.name} moves into the re-auction pool.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
