import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { X, Gavel, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function BidModal() {
  const { 
    isBiddingModalOpen, 
    setIsBiddingModalOpen, 
    currentPlayer, 
    auction, 
    teams, 
    placeBid 
  } = useAuction();

  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [increment, setIncrement] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isBiddingModalOpen || !currentPlayer) return null;

  const currentBid = Number(auction?.current_bid || currentPlayer.base_price || 10000);
  const calculatedBid = useCustom && customAmount ? parseFloat(customAmount) : currentBid + increment;

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setBidding(true);

    try {
      if (useCustom) {
        await placeBid({ team_id: selectedTeamId, amount: calculatedBid });
      } else {
        await placeBid({ team_id: selectedTeamId, increment });
      }
      setIsBiddingModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const isPurseLow = selectedTeam && selectedTeam.purse_remaining < calculatedBid;
  const isSquadFull = selectedTeam && selectedTeam.players_bought >= selectedTeam.max_players;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsBiddingModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-neon-green">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Place Auction Bid
            </h2>
            <p className="text-xs text-slate-400">
              Live Bidder on behalf of tournament franchises
            </p>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="my-3 p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Player Mini Banner */}
        <div className="flex items-center justify-between p-3 my-4 rounded-xl bg-[#0b1328] border border-slate-800">
          <div className="flex items-center gap-3">
            <img 
              src={currentPlayer.image_url} 
              alt={currentPlayer.name} 
              className="w-12 h-12 rounded-lg object-cover object-top border border-slate-700" 
              onError={(e) => { e.target.src = '/images/tennis-ball-glow.svg'; }}
            />
            <div>
              <div className="text-xs text-emerald-400 font-bold uppercase">{currentPlayer.player_number}</div>
              <div className="text-base font-bold text-white">{currentPlayer.name}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Highest Bid</div>
            <div className="text-xl font-black text-emerald-400 font-display">
              ₹ {currentBid.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <form onSubmit={handleBidSubmit} className="space-y-4">
          
          {/* 1. Select Bidding Franchise */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
              Select Bidding Team
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {teams.map((t) => {
                const isSelected = selectedTeamId === t.id;
                const canBid = t.purse_remaining >= calculatedBid && t.players_bought < t.max_players;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`relative p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-2 border-emerald-400 shadow-md shadow-emerald-950'
                        : 'bg-[#0b1328] hover:bg-slate-800/60 border-slate-800 opacity-90'
                    } ${!canBid ? 'border-dashed border-rose-900/60' : ''}`}
                  >
                    <div className="w-10 h-10 mx-auto mb-1">
                      <img src={t.logo_url} alt={t.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs font-bold text-white truncate">{t.name}</div>
                    <div className="text-[11px] font-bold text-emerald-400 mt-1">
                      ₹ {Number(t.purse_remaining).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {t.players_bought}/{t.max_players} slots
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Choose Bid Increment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                Bid Increment
              </label>
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                {useCustom ? 'Use Preset Increments' : 'Enter Custom Amount'}
              </button>
            </div>

            {!useCustom ? (
              <div className="grid grid-cols-3 gap-3">
                {[2000, 5000, 10000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setIncrement(inc)}
                    className={`py-3 px-3 rounded-xl border font-bold text-sm tracking-wide transition-all ${
                      increment === inc
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-neon-green'
                        : 'bg-[#0b1328] hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    + ₹ {inc.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  min={currentBid + 1000}
                  step="1000"
                  placeholder={`Min ₹ ${(currentBid + 1000).toLocaleString('en-IN')}`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-emerald-400"
                  required={useCustom}
                />
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-600/40 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold">New Offer Price</div>
              <div className="text-2xl font-black text-emerald-400 font-display">
                ₹ {Number(calculatedBid).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-slate-400">Jump from current</div>
              <div className="font-bold text-sky-400 flex items-center gap-1 justify-end">
                <TrendingUp className="w-3.5 h-3.5" />
                + ₹ {(calculatedBid - currentBid).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {isPurseLow && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              This team does not have enough purse remaining to make this bid!
            </div>
          )}

          {isSquadFull && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              This team has already filled all 5 roster spots!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={bidding || isPurseLow || isSquadFull || calculatedBid <= currentBid}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              bidding || isPurseLow || isSquadFull || calculatedBid <= currentBid
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-neon-green active:scale-[0.99]'
            }`}
          >
            <Gavel className="w-5 h-5" />
            <span>{bidding ? 'Placing Bid...' : `CONFIRM BID (₹ ${Number(calculatedBid).toLocaleString('en-IN')})`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
