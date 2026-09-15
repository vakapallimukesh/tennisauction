import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function AdminControlPanel({ onNavigateToPlayers, onOpenDisplay }) {
  const {
    auction,
    currentPlayer,
    teams,
    timeLeft,
    timerRunning,
    recentBids,
    upcomingPlayers,
    selectLivePlayer,
    placeBid,
    undoLastBid,
    markSold,
    markUnsold,
    nextPlayer,
    controlAuction
  } = useAuction();

  // Local states
  const [manualTeamId, setManualTeamId] = useState(teams[0]?.id || 1);
  const [manualAmount, setManualAmount] = useState('');
  const [isSelectPlayerModalOpen, setIsSelectPlayerModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState(null); // { type: 'success' | 'error', text }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm }

  const highestTeam = auction?.highest_bidder_team_id
    ? teams.find(t => t.id === auction.highest_bidder_team_id)
    : null;

  const currentBid = auction?.current_bid || currentPlayer?.base_price || 500000;
  const bidIncrement = auction?.bid_increment || 50000;
  const nextCalculatedBid = currentBid + bidIncrement;

  // Format currency
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '0 PTS';
    return Number(val).toLocaleString() + ' PTS';
  };

  const showNotice = (text, type = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Master Override Controls
  const handlePause = async () => {
    try {
      await controlAuction('pause');
      showNotice('Master countdown timer paused.');
    } catch (err) {
      showNotice(err.message || 'Failed to pause auction', 'error');
    }
  };

  const handleResume = async () => {
    try {
      await controlAuction('resume');
      showNotice('Auction resumed.');
    } catch (err) {
      showNotice(err.message || 'Failed to resume auction', 'error');
    }
  };

  const handleResetTimer = async () => {
    try {
      await controlAuction('reset_timer');
      showNotice('Master countdown timer reset.');
    } catch (err) {
      showNotice(err.message || 'Failed to reset timer', 'error');
    }
  };

  const handleAdjustTimer = async (seconds) => {
    try {
      await controlAuction('add_time', seconds);
      showNotice(`Timer adjusted by ${seconds > 0 ? `+${seconds}` : seconds}s`);
    } catch (err) {
      showNotice(err.message || 'Failed to adjust timer', 'error');
    }
  };

  // Mark Sold
  const handleMarkSold = () => {
    if (!highestTeam) {
      showNotice('Cannot mark SOLD: No franchise has placed a bid yet.', 'error');
      return;
    }
    setConfirmDialog({
      title: 'CONFIRM HAMMER FALL (SOLD)',
      message: `Sell ${currentPlayer?.name || 'this athlete'} to ${highestTeam.name} for ${formatCurrency(currentBid)}? This will deduct the franchise purse and trigger the arena celebration.`,
      onConfirm: async () => {
        try {
          await markSold(highestTeam.id, currentBid);
          showNotice(`SOLD! ${currentPlayer?.name} sold to ${highestTeam.name}`);
        } catch (err) {
          showNotice(err.message || 'Sale failed', 'error');
        }
      }
    });
  };

  // Mark Unsold
  const handleMarkUnsold = () => {
    setConfirmDialog({
      title: 'MARK ATHLETE AS UNSOLD',
      message: `Pass on ${currentPlayer?.name || 'this athlete'}? They will be moved to the unsold pool for future re-auction.`,
      onConfirm: async () => {
        try {
          await markUnsold();
          showNotice(`${currentPlayer?.name} marked as UNSOLD`);
        } catch (err) {
          showNotice(err.message || 'Failed to pass athlete', 'error');
        }
      }
    });
  };

  // Next Player
  const handleNextPlayer = async () => {
    try {
      await nextPlayer();
      showNotice('Advanced to the next athlete on the draft block.');
    } catch (err) {
      showNotice(err.message || 'Failed to advance athlete', 'error');
    }
  };

  // End Auction
  const handleEndAuction = () => {
    setConfirmDialog({
      title: 'CONCLUDE AUCTION SESSION',
      message: 'Are you sure you want to end the entire auction session? The digital display will show the auction concluded broadcast card.',
      onConfirm: async () => {
        try {
          await controlAuction('end');
          showNotice('Auction session concluded.');
        } catch (err) {
          showNotice(err.message || 'Failed to end auction', 'error');
        }
      }
    });
  };

  // Force Manual Bid
  const handleForceBid = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(String(manualAmount || nextCalculatedBid).replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showNotice('Please enter a valid numeric bid amount.', 'error');
      return;
    }
    try {
      await placeBid({
        team_id: parseInt(manualTeamId, 10),
        amount: parsedAmount
      });
      const team = teams.find(t => t.id === parseInt(manualTeamId, 10));
      showNotice(`Manual bid of ${formatCurrency(parsedAmount)} placed for ${team?.name || 'Team'}`);
      setManualAmount('');
    } catch (err) {
      showNotice(err.message || 'Manual bid placement failed', 'error');
    }
  };

  // Undo Last Bid
  const handleUndoBid = async () => {
    try {
      await undoLastBid();
      showNotice('Last bid reverted and previous highest bidder restored.');
    } catch (err) {
      showNotice(err.message || 'Failed to undo bid', 'error');
    }
  };

  // Format timer display
  const formattedTimer = `00:${timeLeft < 10 ? '0' : ''}${Math.max(0, timeLeft)}`;

  return (
    <div className="flex flex-col w-full p-gutter space-y-gutter">
      {/* Action Notice Floating Alert */}
      {actionNotice && (
        <div className={`fixed top-24 right-8 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border font-label-md transition-all ${actionNotice.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/40'
            : 'bg-surface-container-highest text-tertiary border-tertiary/40'
          }`}>
          <span className="material-symbols-outlined text-[20px]">
            {actionNotice.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Top Telemetry & Status Bar */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Status Overview */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-6 relative overflow-hidden flex flex-col justify-between border border-outline-variant/10">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-label-md bg-tertiary/10 text-tertiary tracking-widest uppercase border border-tertiary/20">
                <span className={`w-2 h-2 rounded-full mr-2 ${timerRunning ? 'bg-tertiary animate-ping' : 'bg-yellow-500'}`} />
                {timerRunning ? 'LIVE BIDDING ACTIVE' : 'BIDDING PAUSED'}
              </span>
              <span className="text-on-surface-variant font-body-md">
                ROUND 03 / LOT {currentPlayer?.player_number || '#042'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-on-surface-variant text-label-md">MASTER TIMER:</span>
              <span className={`font-headline-md font-bold tracking-wider tabular-nums ${timeLeft <= 5 ? 'text-error animate-pulse' : 'text-tertiary'}`}>
                {formattedTimer}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 relative z-10">
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
              <span className="text-on-surface-variant text-label-md block mb-1">CURRENT LOT</span>
              <span className="font-headline-sm text-on-surface truncate block">
                {currentPlayer?.player_number || 'PLAYER #042'}
              </span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
              <span className="text-on-surface-variant text-label-md block mb-1">STARTING BID</span>
              <span className="font-headline-sm text-on-surface">
                {formatCurrency(currentPlayer?.base_price || 500000)}
              </span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
              <span className="text-on-surface-variant text-label-md block mb-1">CURRENT HIGHEST</span>
              <span className="font-headline-sm text-tertiary">
                {formatCurrency(currentBid)}
              </span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10">
              <span className="text-on-surface-variant text-label-md block mb-1">LEADING BIDDER</span>
              <span className="font-headline-sm text-on-surface flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: highestTeam?.primary_color || '#3b82f6' }}
                />
                {highestTeam ? highestTeam.name : 'NO BIDS YET'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Master Controls */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-6 flex flex-col justify-between border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider block">
                MASTER OVERRIDE CONTROLS
              </span>
              <button
                onClick={handleUndoBid}
                className="text-xs text-on-surface-variant hover:text-tertiary flex items-center gap-1"
                title="Undo last bid"
              >
                <span className="material-symbols-outlined text-[16px]">undo</span>
                <span>Undo Bid</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePause}
                className="px-3 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface text-label-md flex flex-col items-center justify-center gap-1 transition-all border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-[20px] text-yellow-500">pause</span>
                Pause
              </button>

              <button
                onClick={handleResume}
                className="px-3 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface text-label-md flex flex-col items-center justify-center gap-1 transition-all border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-[20px] text-tertiary">play_arrow</span>
                Resume
              </button>

              <button
                onClick={handleResetTimer}
                className="px-3 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface text-label-md flex flex-col items-center justify-center gap-1 transition-all border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-[20px] text-error">restart_alt</span>
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => handleAdjustTimer(15)}
              className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface text-label-md flex items-center justify-center gap-1 border border-outline-variant/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> +15s Timer
            </button>

            <button
              onClick={() => handleAdjustTimer(-15)}
              className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface text-label-md flex items-center justify-center gap-1 border border-outline-variant/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span> -15s Timer
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Active Player Card & Teams Status */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Active Player Card (Left 7 cols) */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container rounded-xl p-6 relative overflow-hidden flex flex-col justify-between border border-outline-variant/10">
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAupRDndSPDwuQiMGIzPkpWtzPpkOoYiGXih8mTIC9xWxftpkrJ7KMv_WXWiZbTBOHxfVHi22ti1jCIrbh384VSrhfYDb9d_3OmJDnoRT2Fdoge7dmhBBn3nCd6pVUtf6S0gRTSU4Y58mq1p-CdPBdt1DYczoUh0EM3EsIBBcdh-kiEQI9wbRjoDwVVOKFc_uEuV7LzAXWntzLWETKi6t1RgPRhdLtGguVFONSHMds8fy4Q4L5Odsua')`
            }}
          />

          <div className="flex items-center justify-between relative z-10 mb-6">
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]">person_search</span>
              ACTIVE LOT ON BLOCK
            </span>

            <button
              onClick={() => setIsSelectPlayerModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-tertiary text-label-md flex items-center gap-1 transition-all border border-tertiary/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span> Select New Player
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 mb-6">
            {/* Player Image */}
            <div className="md:col-span-5 relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-container-low shadow-xl border border-outline-variant/20">
              <img
                src={currentPlayer?.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80'}
                alt={currentPlayer?.name || 'Athlete'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent p-4">
                <span className="text-tertiary text-label-md font-bold uppercase">
                  SEED #{currentPlayer?.world_ranking ? String(currentPlayer.world_ranking).padStart(2, '0') : '01'}
                </span>
                <div className="font-headline-md text-on-surface truncate">
                  {currentPlayer?.name || 'Alexander Vance'}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {currentPlayer?.country_flag || '🌐'} {currentPlayer?.country || 'International'} • {currentPlayer?.category || 'Singles'}
                </div>
              </div>
            </div>

            {/* Player Stats */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container-low p-3 rounded-lg text-center border border-outline-variant/10">
                  <span className="text-on-surface-variant text-label-md block">ATP RANK</span>
                  <span className="font-headline-sm text-on-surface">
                    #{currentPlayer?.world_ranking || 4}
                  </span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg text-center border border-outline-variant/10">
                  <span className="text-on-surface-variant text-label-md block">WIN RATE</span>
                  <span className="font-headline-sm text-tertiary">
                    {currentPlayer?.win_percentage || 78}%
                  </span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg text-center border border-outline-variant/10">
                  <span className="text-on-surface-variant text-label-md block">ACES</span>
                  <span className="font-headline-sm text-on-surface">
                    {currentPlayer?.aces || 22}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-lg space-y-2 border border-outline-variant/10">
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface-variant">BASE VALUE</span>
                  <span className="text-on-surface">{formatCurrency(currentPlayer?.base_price || 500000)}</span>
                </div>
                <div className="flex justify-between items-center text-label-md">
                  <span className="text-on-surface-variant">CURRENT BID</span>
                  <span className="text-tertiary font-bold text-headline-sm">{formatCurrency(currentBid)}</span>
                </div>
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface-variant">BID INCREMENT</span>
                  <span className="text-on-surface">+{formatCurrency(bidIncrement)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant text-label-md border border-outline-variant/10">
                  {currentPlayer?.playing_hand || 'Right Handed'}
                </span>
                <span className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant text-label-md border border-outline-variant/10">
                  Hard Court Spec
                </span>
                <span className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant text-label-md border border-outline-variant/10">
                  Clutch Tiebreaks
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Current Lot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10 pt-4 border-t border-outline-variant/10">
            <button
              onClick={handleMarkSold}
              className="px-4 py-3 rounded-lg bg-tertiary text-on-tertiary font-label-md uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-tertiary-fixed-dim transition-all shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">gavel</span> Mark SOLD
            </button>

            <button
              onClick={handleMarkUnsold}
              className="px-4 py-3 rounded-lg bg-error text-on-error font-label-md uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span> Mark UNSOLD
            </button>

            <button
              onClick={handleNextPlayer}
              className="px-4 py-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-outline-variant/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">skip_next</span> Next Player
            </button>

            <button
              onClick={handleEndAuction}
              className="px-4 py-3 rounded-lg bg-surface-container-low hover:bg-error-container text-error hover:text-on-error-container font-label-md uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-error/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">power_settings_new</span> End Auction
            </button>
          </div>
        </div>

        {/* Teams Budget Status (Right 5 cols) */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container rounded-xl p-6 flex flex-col justify-between border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">shield</span>
                FRANCHISE BUDGET &amp; SQUADS
              </span>
              <span className="text-label-md text-tertiary">
                {teams.length} / {teams.length} ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {teams.map((team) => {
                const isLeading = highestTeam?.id === team.id;
                const totalPurse = team.total_purse || 100000;
                const remaining = team.purse_remaining || 0;
                const spent = Math.max(0, totalPurse - remaining);
                const spentPercent = Math.min(100, Math.round((spent / totalPurse) * 100));
                const squadCount = team.players_bought || team.players?.length || 0;
                const maxSquad = team.max_players || 5;

                return (
                  <div
                    key={team.id}
                    className={`bg-surface-container-low p-4 rounded-lg transition-all border ${isLeading
                        ? 'border-tertiary shadow-lg shadow-tertiary/10'
                        : 'border-outline-variant/10 hover:border-outline-variant/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-headline-sm text-on-surface flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.primary_color || '#22c55e' }}
                        />
                        {team.name}
                        {isLeading && (
                          <span className="text-xs bg-tertiary/20 text-tertiary px-1.5 py-0.5 rounded ml-1 font-normal">
                            LEADING
                          </span>
                        )}
                      </span>
                      <span className="text-label-md text-on-surface-variant">
                        Squad: <strong className="text-on-surface">{squadCount} / {maxSquad}</strong>
                      </span>
                    </div>

                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${spentPercent}%`,
                          backgroundColor: team.primary_color || '#22c55e'
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-label-md text-on-surface-variant">
                      <span>Spent: {formatCurrency(spent)}</span>
                      <span className="text-tertiary">Purse Left: {formatCurrency(remaining)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bids Log & Quick Manual Bid Injection */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Recent Bids Log (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]">history</span>
              REAL-TIME AUDIT &amp; BID LOG
            </span>
            <span className="text-label-md text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              AUTO-SYNCING
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-label-md text-on-surface-variant">
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">TEAM</th>
                  <th className="py-3 px-4">PLAYER</th>
                  <th className="py-3 px-4 text-right">BID AMOUNT</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-md">
                {recentBids && recentBids.length > 0 ? (
                  recentBids.slice(0, 6).map((bid, index) => {
                    const isFirst = index === 0;
                    return (
                      <tr key={bid.id || index} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-on-surface-variant text-[13px]">
                          {bid.bid_time ? new Date(bid.bid_time).toLocaleTimeString() : 'Just now'}
                        </td>
                        <td className="py-3 px-4 font-bold text-on-surface flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: bid.team_primary_color || '#38bdf8' }}
                          />
                          {bid.team_name || `Team #${bid.team_id}`}
                        </td>
                        <td className="py-3 px-4 text-on-surface truncate max-w-[160px]">
                          {bid.player_name || currentPlayer?.name || 'Alexander Vance'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-tertiary">
                          {formatCurrency(bid.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isFirst ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-tertiary/10 text-tertiary font-bold">
                              LEADING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-surface-container-high text-on-surface-variant">
                              OUTBID
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-on-surface-variant text-sm">
                      No bids recorded for current session yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Bid Override Panel (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-6 flex flex-col justify-between border border-outline-variant/10">
          <form onSubmit={handleForceBid} className="space-y-4">
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant block">
              ADMIN OVERRIDE BID ENTRY
            </span>

            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">SELECT TEAM</label>
              <select
                value={manualTeamId}
                onChange={(e) => setManualTeamId(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface p-3 rounded-lg outline-none border border-outline-variant/20 cursor-pointer font-body-md"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-surface text-on-surface">
                    {t.name} (Purse: {formatCurrency(t.purse_remaining)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-label-md text-on-surface-variant block mb-1">BID AMOUNT (PTS)</label>
              <input
                type="text"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder={nextCalculatedBid.toLocaleString()}
                className="w-full bg-surface-container-low text-on-surface p-3 rounded-lg outline-none border border-outline-variant/20 font-headline-sm"
              />
              <span className="text-[11px] text-on-surface-variant mt-1 block">
                Next recommended bid: {formatCurrency(nextCalculatedBid)}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg bg-tertiary text-on-tertiary font-label-md uppercase tracking-wider hover:bg-tertiary-fixed-dim transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span> Force Manual Bid
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-headline-sm text-on-surface">{confirmDialog.title}</h3>
            <p className="text-body-md text-on-surface-variant">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const cb = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  cb();
                }}
                className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-md hover:bg-tertiary-fixed-dim transition-colors"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select New Player Modal */}
      {isSelectPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
              <h3 className="font-headline-sm text-on-surface">Select Athlete to Cue Live</h3>
              <button
                onClick={() => setIsSelectPlayerModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {upcomingPlayers && upcomingPlayers.length > 0 ? (
                upcomingPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/10 hover:border-tertiary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.image_url}
                        alt={player.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80'; }}
                      />
                      <div>
                        <div className="font-bold text-on-surface text-sm">{player.name}</div>
                        <div className="text-xs text-on-surface-variant">
                          {player.country_flag} {player.country} • Rank #{player.world_ranking || '-'} • Base: {formatCurrency(player.base_price)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await selectLivePlayer(player.id);
                          setIsSelectPlayerModalOpen(false);
                          showNotice(`${player.name} cued as active lot.`);
                        } catch (err) {
                          showNotice(err.message, 'error');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-label-md hover:bg-tertiary-fixed-dim transition-colors text-xs uppercase"
                    >
                      Set Live
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-on-surface-variant text-sm">
                  No upcoming athletes available in queue.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
