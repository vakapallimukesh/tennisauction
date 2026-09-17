import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuction } from '../../context/AuctionContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Radio,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Filter,
  Trophy,
  User,
  Zap
} from 'lucide-react';

export default function PlayerManagement({ onBackToControlPanel }) {
  const { selectLivePlayer } = useAuction();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    player_number: '',
    age: 22,
    country: 'India',
    country_flag: '🇮🇳',
    category: 'Group A',
    playing_hand: 'Right Hand',
    world_ranking: 150,
    base_price: 10000,
    matches: 40,
    wins: 25,
    aces: 60,
    win_percentage: 65,
    image_url: '/images/players/rohan-iyer.jpg',
    status: 'upcoming'
  });
  const [message, setMessage] = useState(null);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await api.getPlayers(selectedStatus === 'all' ? '' : selectedStatus);
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [selectedStatus]);

  const openCreateModal = () => {
    setEditingPlayer(null);
    setFormData({
      name: '',
      player_number: `PLAYER #${(players.length + 1) < 10 ? '0' + (players.length + 1) : players.length + 1}`,
      age: 22,
      country: 'India',
      country_flag: '🇮🇳',
      category: 'Group A',
      playing_hand: 'Right Hand',
      world_ranking: 120,
      base_price: 12000,
      matches: 45,
      wins: 30,
      aces: 75,
      win_percentage: 67,
      image_url: '/images/players/rohan-iyer.jpg',
      status: 'upcoming'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      player_number: player.player_number,
      age: player.age,
      country: player.country,
      country_flag: player.country_flag,
      category: player.category,
      playing_hand: player.playing_hand,
      world_ranking: player.world_ranking,
      base_price: player.base_price,
      matches: player.matches,
      wins: player.wins,
      aces: player.aces,
      win_percentage: player.win_percentage,
      image_url: player.image_url,
      status: player.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await api.updatePlayer(editingPlayer.id, formData);
        setMessage({ type: 'success', text: `Player ${formData.name} updated successfully!` });
      } else {
        await api.createPlayer(formData);
        setMessage({ type: 'success', text: `Player ${formData.name} added to draft pool!` });
      }
      setIsModalOpen(false);
      loadPlayers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the player registry?`)) return;
    try {
      await api.deletePlayer(id);
      setMessage({ type: 'success', text: `Player ${name} removed.` });
      loadPlayers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSetLive = async (player) => {
    try {
      await selectLivePlayer(player.id);
      setMessage({ type: 'success', text: `${player.name} is now LIVE on the auction screen!` });
      loadPlayers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.player_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-[#060a16] text-white p-4 lg:p-8 font-sans">

      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToControlPanel}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Control Panel</span>
          </button>
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase">
              PLAYER POOL MANAGEMENT
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Draft Athletes Registry • Add, Edit, Filter, and Cue Live to TV Screen
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PLAYER</span>
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`max-w-7xl mx-auto mt-4 p-3 rounded-xl flex items-center justify-between text-xs font-bold ${message.type === 'success' ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
          }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
          {['all', 'upcoming', 'live', 'sold', 'unsold'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${selectedStatus === status
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, country, #..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Players Grid Table */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3.5">Athlete</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Ranking</th>
                <th className="p-3.5">Base Price</th>
                <th className="p-3.5">Stats (M/W/A)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={player.image_url}
                        alt=""
                        className="w-10 h-12 object-cover rounded-lg border border-white/10"
                      />
                      <div>
                        <span className="font-bold text-white text-sm block">{player.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {player.player_number} • {player.country_flag} {player.country} • Age {player.age}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium">
                        {player.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-amber-300">
                      #{player.world_ranking}
                    </td>

                    <td className="p-3.5 font-black text-emerald-400 font-mono">
                      ₹{parseFloat(player.base_price).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-slate-300 font-mono">
                      {player.matches}m / {player.wins}w / {player.aces}a ({player.win_percentage}%)
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${player.status === 'live' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' :
                          player.status === 'sold' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                            player.status === 'unsold' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                              'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        }`}>
                        {player.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {player.status !== 'live' && (
                          <button
                            onClick={() => handleSetLive(player)}
                            title="Cue Live onto Digital Auction Display"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>SET LIVE</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(player)}
                          title="Edit Player"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id, player.name)}
                          title="Delete Player"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No athletes found matching the active criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT PLAYER MODAL                                    */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-lg font-black font-display text-white uppercase">
                {editingPlayer ? `EDIT ATHLETE: ${editingPlayer.name}` : 'ADD NEW ATHLETE TO DRAFT POOL'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Player Tag/Number</label>
                  <input
                    type="text"
                    value={formData.player_number}
                    onChange={(e) => setFormData({ ...formData, player_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Country Flag</label>
                  <input
                    type="text"
                    value={formData.country_flag}
                    onChange={(e) => setFormData({ ...formData, country_flag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  >
                    <option value="Group A">Group A</option>
                    <option value="Group B">Group B</option>
                    <option value="Doubles">Doubles</option>
                    <option value="All-Rounder">All-Rounder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Playing Hand</label>
                  <select
                    value={formData.playing_hand}
                    onChange={(e) => setFormData({ ...formData, playing_hand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  >
                    <option value="Right Hand">Right Hand</option>
                    <option value="Left Hand">Left Hand</option>
                    <option value="Ambidextrous">Ambidextrous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">World Ranking</label>
                  <input
                    type="number"
                    value={formData.world_ranking}
                    onChange={(e) => setFormData({ ...formData, world_ranking: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="sold">Sold</option>
                    <option value="unsold">Unsold</option>
                  </select>
                </div>
              </div>

              {/* Athletic Stats */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Career Match Statistics</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase">Matches</label>
                    <input
                      type="number"
                      value={formData.matches}
                      onChange={(e) => setFormData({ ...formData, matches: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase">Wins</label>
                    <input
                      type="number"
                      value={formData.wins}
                      onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase">Win %</label>
                    <input
                      type="number"
                      value={formData.win_percentage}
                      onChange={(e) => setFormData({ ...formData, win_percentage: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase">Aces</label>
                    <input
                      type="number"
                      value={formData.aces}
                      onChange={(e) => setFormData({ ...formData, aces: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Image URL / Preset</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/players/arjun-mehta.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider"
                >
                  {editingPlayer ? 'SAVE CHANGES' : 'CREATE ATHLETE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
