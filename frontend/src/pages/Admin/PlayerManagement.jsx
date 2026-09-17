import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuction } from '../../context/AuctionContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Zap,
  Layers,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  X
} from 'lucide-react';

export default function PlayerManagement({ onBackToControlPanel }) {
  const { selectLivePlayer } = useAuction();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all'); // 'all' | 'A' | 'B'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    player_number: '',
    age: 22,
    group: 'A',
    playing_hand: 'Right Hand',
    base_price: 10000,
    image_url: '/images/players/arjun-mehta.jpg',
    status: 'upcoming'
  });
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

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
      group: 'A',
      playing_hand: 'Right Hand',
      base_price: 12000,
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
      group: player.group || 'A',
      playing_hand: player.playing_hand || 'Right Hand',
      base_price: player.base_price,
      image_url: player.image_url || '/images/players/rohan-iyer.jpg',
      status: player.status || 'upcoming'
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
      p.player_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'all' || (p.group || 'A') === selectedGroup;

    return matchesSearch && matchesGroup;
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
              Draft Athletes Registry • Add, Edit, Group (A/B), and Cue Live to TV Screen
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
      <div className="max-w-7xl mx-auto my-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status & Group Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-white/10 overflow-x-auto">
            {['all', 'upcoming', 'live', 'sold', 'unsold'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${selectedStatus === status
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Group Filter (Group A / Group B) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-black text-slate-500 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Group:
            </span>
            {[
              { label: 'ALL GROUPS', val: 'all' },
              { label: 'GROUP A', val: 'A' },
              { label: 'GROUP B', val: 'B' }
            ].map(grp => (
              <button
                key={grp.val}
                onClick={() => setSelectedGroup(grp.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${selectedGroup === grp.val
                    ? (grp.val === 'B' ? 'bg-purple-500 text-slate-950 shadow-md font-black' : 'bg-emerald-500 text-slate-950 shadow-md font-black')
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {grp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, #..."
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
                <th className="p-3.5">Group</th>
                <th className="p-3.5">Base Price</th>
                <th className="p-3.5">Sold Price</th>
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
                        className="w-10 h-12 object-cover rounded-lg border border-white/10 bg-slate-950"
                      />
                      <div>
                        <span className="font-bold text-white text-sm block">{player.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {player.player_number} • Age {player.age} • {player.playing_hand || 'Right Hand'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase border ${
                        (player.group === 'B')
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      }`}>
                        Group {player.group || 'A'}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-slate-300 font-mono">
                      ₹{parseFloat(player.base_price).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 font-black font-mono">
                      {player.status === 'sold' && (player.sold_price || player.purchase_price) ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                          ₹{parseFloat(player.sold_price || player.purchase_price).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-normal">—</span>
                      )}
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
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-lg font-black font-display text-white uppercase">
                {editingPlayer ? `EDIT ATHLETE: ${editingPlayer.name}` : 'ADD NEW ATHLETE TO DRAFT POOL'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                  <span>Player Photo</span>
                  <span className="text-[10px] text-slate-500 font-normal">PNG, JPG, WEBP</span>
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-emerald-500/40 transition-colors">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Player Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.image_url ? 'Change Photo' : 'Upload Player Photo'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">Upload an image file directly from your computer</p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Mehta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Player Tag/Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PLAYER #07"
                    value={formData.player_number}
                    onChange={(e) => setFormData({ ...formData, player_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Age, Group & Playing Hand */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="60"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Group (A or B)</label>
                  <select
                    value={formData.group || 'A'}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="A">Group A</option>
                    <option value="B">Group B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Playing Hand</label>
                  <select
                    value={formData.playing_hand}
                    onChange={(e) => setFormData({ ...formData, playing_hand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Right Hand">Right Hand</option>
                    <option value="Left Hand">Left Hand</option>
                    <option value="Ambidextrous">Ambidextrous</option>
                  </select>
                </div>
              </div>

              {/* Base Price & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    step="500"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="sold">Sold</option>
                    <option value="unsold">Unsold</option>
                  </select>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
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
