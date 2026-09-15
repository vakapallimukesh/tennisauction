import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { api } from '../services/api';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Gavel,
  CheckCircle,
  XCircle,
  PlusCircle,
  Users,
  Trash2,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    auction,
    currentPlayer,
    teams,
    upcomingPlayers,
    controlAuction,
    markSold,
    markUnsold,
    selectLivePlayer,
    refreshAll
  } = useAuction();

  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'addPlayer' | 'allPlayers'
  const [winningTeamId, setWinningTeamId] = useState(teams[0]?.id || 1);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // New player form state
  const [formData, setFormData] = useState({
    name: '',
    player_number: '',
    age: 22,
    country: 'India',
    country_flag: '🇮🇳',
    category: 'Singles',
    playing_hand: 'Right Hand',
    world_ranking: 120,
    wins: 30,
    aces: 65,
    matches: 45,
    win_percentage: 70,
    base_price: 10000,
    image_url: '/images/players/rohan-iyer.jpg'
  });

  if (!isAdminOpen) return null;

  const handleControl = async (action) => {
    setActionLoading(true);
    setStatusMsg('');
    try {
      await controlAuction(action);
      setStatusMsg(`Auction action "${action}" executed!`);
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    setActionLoading(true);
    setStatusMsg('');
    try {
      const res = await markSold(winningTeamId, auction?.current_bid);
      setStatusMsg(res.message || 'Player marked as SOLD!');
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnsold = async () => {
    setActionLoading(true);
    setStatusMsg('');
    try {
      const res = await markUnsold();
      setStatusMsg(res.message || 'Player passed as UNSOLD');
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createPlayer(formData);
      setStatusMsg(`Player "${formData.name}" added to draft roster!`);
      setFormData({
        name: '',
        player_number: '',
        age: 22,
        country: 'India',
        country_flag: '🇮🇳',
        category: 'Singles',
        playing_hand: 'Right Hand',
        world_ranking: 120,
        wins: 30,
        aces: 65,
        matches: 45,
        win_percentage: 70,
        base_price: 10000,
        image_url: '/images/players/rohan-iyer.jpg'
      });
      await refreshAll();
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-5 sm:p-7 max-h-[92vh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAdminOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Auctioneer & Admin Controller
            </h2>
            <p className="text-xs text-slate-400">
              Live tournament execution, hammer controls, player additions & roster overrides
            </p>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'controls'
                ? 'bg-emerald-500 text-slate-950 shadow-neon-green'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
          >
            Live Auction Engine
          </button>

          <button
            onClick={() => setActiveTab('addPlayer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'addPlayer'
                ? 'bg-emerald-500 text-slate-950 shadow-neon-green'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
          >
            Add New Player
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'queue'
                ? 'bg-emerald-500 text-slate-950 shadow-neon-green'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
          >
            Draft Queue ({upcomingPlayers.length})
          </button>
        </div>

        {/* TAB 1: Main Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-5">
            {/* Live Player Overview */}
            <div className="p-4 rounded-xl bg-[#0b1328] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentPlayer?.image_url || '/images/tennis-ball-glow.svg'}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover object-top border border-slate-700"
                />
                <div>
                  <div className="text-xs text-emerald-400 font-bold uppercase">{currentPlayer?.player_number || 'NO PLAYER'}</div>
                  <div className="text-lg font-black text-white">{currentPlayer?.name || 'Round Paused'}</div>
                  <div className="text-xs text-slate-400">
                    Base: ₹ {Number(currentPlayer?.base_price || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold">Active Highest Offer</div>
                <div className="text-2xl font-black text-emerald-400 font-display">
                  ₹ {Number(auction?.current_bid || 0).toLocaleString('en-IN')}
                </div>
                {auction?.highest_bidder_team && (
                  <div className="text-xs font-bold text-sky-400">
                    Leader: {auction.highest_bidder_team.name}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Engine Actions */}
            <div>
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                Auction Lifecycle
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleControl('start')}
                  disabled={actionLoading}
                  className="py-3 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Start / Resume</span>
                </button>

                <button
                  onClick={() => handleControl('pause')}
                  disabled={actionLoading}
                  className="py-3 px-3 rounded-xl bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/80 text-amber-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Pause Timer</span>
                </button>

                <button
                  onClick={() => handleControl('reset')}
                  disabled={actionLoading}
                  className="py-3 px-3 rounded-xl bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900/80 text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset Demo State</span>
                </button>

                <button
                  onClick={() => handleMarkUnsold()}
                  disabled={actionLoading || !currentPlayer}
                  className="py-3 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span>Mark UNSOLD</span>
                </button>
              </div>
            </div>

            {/* Final Hammer / Mark SOLD Section */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-[#0b1328] border border-emerald-600/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase font-display">
                <Gavel className="w-5 h-5" />
                <span>Hammer Fall (Sell Current Player)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                    Winning Franchise
                  </label>
                  <select
                    value={winningTeamId}
                    onChange={(e) => setWinningTeamId(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Purse: ₹{Number(t.purse_remaining).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 sm:pt-0">
                  <button
                    onClick={handleMarkSold}
                    disabled={actionLoading || !currentPlayer}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-green flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>SOLD! (Finalize Round)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Bids Log */}
            <div>
              <div className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                Live Bid Stream
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {auction?.recent_bids?.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0b1328] text-xs border border-slate-800">
                    <span className="font-bold text-white">{b.team_name}</span>
                    <span className="font-bold text-emerald-400">₹ {Number(b.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Add New Player */}
        {activeTab === 'addPlayer' && (
          <form onSubmit={handleCreatePlayer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carlos Alcaraz"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Player Tag</label>
                <input
                  type="text"
                  placeholder="e.g. PLAYER #30"
                  value={formData.player_number}
                  onChange={e => setFormData({ ...formData, player_number: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Age</label>
                <input
                  type="number"
                  min="16"
                  max="45"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Flag Emoji</label>
                <input
                  type="text"
                  value={formData.country_flag}
                  onChange={e => setFormData({ ...formData, country_flag: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="Singles">Singles</option>
                  <option value="Doubles">Doubles</option>
                  <option value="All-Rounder">All-Rounder</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Playing Hand</label>
                <select
                  value={formData.playing_hand}
                  onChange={e => setFormData({ ...formData, playing_hand: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="Right Hand">Right Hand</option>
                  <option value="Left Hand">Left Hand</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">World Ranking</label>
                <input
                  type="number"
                  value={formData.world_ranking}
                  onChange={e => setFormData({ ...formData, world_ranking: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.base_price}
                  onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full bg-[#0b1328] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-green flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Enroll Player Into Auction</span>
            </button>
          </form>
        )}

        {/* TAB 3: Draft Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {upcomingPlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0b1328] border border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-xs text-slate-400">Base: ₹{Number(p.base_price).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <button
                  onClick={() => selectLivePlayer(p.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-emerald-900"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Set as LIVE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
