import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import {
  Shield,
  Users,
  DollarSign,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function TeamSquadsManagement({ onNavigate }) {
  const { teams, soldPlayers } = useAuction();
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all'); // 'all' | teamId

  // Calculate totals
  const totalPurseAllocated = useMemo(() => {
    return (teams || []).reduce((sum, t) => sum + (t.total_purse || 400000), 0);
  }, [teams]);

  const totalPurseSpent = useMemo(() => {
    return (teams || []).reduce((sum, t) => sum + ((t.total_purse || 400000) - (t.purse_remaining !== undefined ? t.purse_remaining : 400000)), 0);
  }, [teams]);

  const totalPlayersAcquired = useMemo(() => {
    return (teams || []).reduce((sum, t) => sum + (t.players_bought || t.roster?.length || 0), 0);
  }, [teams]);

  const filteredTeams = useMemo(() => {
    if (selectedTeamFilter === 'all') return teams || [];
    return (teams || []).filter(t => t.id === parseInt(selectedTeamFilter, 10));
  }, [teams, selectedTeamFilter]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container rounded-xl p-6 border border-outline-variant/10">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate ? onNavigate('/admin') : (window.location.href = '/admin')}
              className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/10 transition-colors"
              title="Back to Live Bidding"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-headline-md text-on-surface flex items-center gap-2">
                <Shield className="w-6 h-6 text-tertiary" />
                Team Squads & Rosters
              </h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Real-time purse allocations, squad capacity, and player acquisitions across all 4 franchises.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate ? onNavigate('/admin') : (window.location.href = '/admin')}
            className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold text-label-md hover:bg-tertiary/90 transition-all shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>Back to Live Bidding</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Total Franchises</span>
            <span className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-headline-sm text-on-surface mt-2">
            {teams?.length || 4} Teams
          </div>
          <p className="text-xs text-on-surface-variant mt-1">5 max slots per franchise</p>
        </div>

        <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Players Acquired</span>
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-headline-sm text-on-surface mt-2">
            {totalPlayersAcquired} / 20 Slots Filled
          </div>
          <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-tertiary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalPlayersAcquired / 20) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Total Purse Spent</span>
            <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-tertiary mt-2">
            {formatCurrency(totalPurseSpent)}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Out of {formatCurrency(totalPurseAllocated)} total league purse
          </p>
        </div>
      </div>

      {/* Team Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedTeamFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold text-label-md transition-all shrink-0 ${
            selectedTeamFilter === 'all'
              ? 'bg-tertiary text-on-tertiary shadow-md'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/10'
          }`}
        >
          All 4 Teams
        </button>
        {(teams || []).map(team => (
          <button
            key={team.id}
            onClick={() => setSelectedTeamFilter(String(team.id))}
            className={`px-4 py-2 rounded-lg font-bold text-label-md transition-all shrink-0 flex items-center gap-2 ${
              selectedTeamFilter === String(team.id)
                ? 'bg-surface-container-highest text-tertiary border-2 border-tertiary shadow-md'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/10'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: team.primary_color || '#22c55e' }}
            />
            <span>{team.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface-container-low font-mono">
              {team.players_bought || team.roster?.length || 0}/{team.max_players || 10}
            </span>
          </button>
        ))}
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.map((team) => {
          const squadCount = team.players_bought || team.roster?.length || 0;
          const maxSquad = team.max_players || 10;
          const maxGroupA = team.max_group_a || 3;
          const maxGroupB = team.max_group_b || 7;
          const groupACount = team.group_a_count !== undefined ? team.group_a_count : (team.roster ? team.roster.filter(p => !((p.group === 'B') || (p.category || '').toLowerCase().includes('group b'))).length : 0);
          const groupBCount = team.group_b_count !== undefined ? team.group_b_count : (team.roster ? team.roster.filter(p => ((p.group === 'B') || (p.category || '').toLowerCase().includes('group b'))).length : 0);
          const purseRemaining = team.purse_remaining !== undefined ? team.purse_remaining : 400000;
          const totalPurse = team.total_purse || 400000;
          const totalSpent = totalPurse - purseRemaining;
          const roster = team.roster || [];

          return (
            <div
              key={team.id}
              className="bg-surface-container rounded-xl border border-outline-variant/15 overflow-hidden flex flex-col justify-between shadow-lg relative"
            >
              {/* Header Color Band */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: team.primary_color || '#22c55e' }}
              />

              <div className="p-6">
                {/* Team Info Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 shadow-md"
                        style={{ borderColor: team.primary_color || '#22c55e' }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-slate-950 text-base shadow-md"
                        style={{ backgroundColor: team.primary_color || '#22c55e' }}
                      >
                        T{team.id}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold font-headline-sm text-on-surface">
                          {team.name}
                        </h2>
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${team.primary_color || '#22c55e'}15`,
                            borderColor: team.primary_color || '#22c55e',
                            color: team.primary_color || '#22c55e'
                          }}
                        >
                          Team {team.id}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Owner: <span className="text-on-surface font-semibold">{team.owner || 'Franchise Owner'}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate ? onNavigate(`/team/${team.id}`) : (window.location.href = `/team/${team.id}`)}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-tertiary border border-outline-variant/10 transition-colors flex items-center gap-1 text-xs"
                    title="Open franchise bidding terminal"
                  >
                    <span>Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Financial Telemetry */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/10 mb-5">
                  <div>
                    <span className="text-[10px] uppercase text-on-surface-variant font-bold block">Remaining Purse</span>
                    <span className="text-base font-bold font-mono text-tertiary">
                      {formatCurrency(purseRemaining)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-on-surface-variant font-bold block">Total Spent</span>
                    <span className="text-base font-bold font-mono text-on-surface">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-on-surface-variant font-bold block">Squad Slots</span>
                    <span className="text-base font-bold font-mono text-on-surface">
                      {squadCount}/{maxSquad}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block font-mono">
                      A: {groupACount}/{maxGroupA} • B: {groupBCount}/{maxGroupB}
                    </span>
                  </div>
                </div>

                {/* Squad Roster Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                      Acquired Athletes ({squadCount}/{maxSquad})
                    </span>
                    {squadCount >= maxSquad ? (
                      <span className="text-[11px] font-bold text-yellow-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SQUAD FULL (10/10)
                      </span>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant">
                        {maxSquad - squadCount} slot(s) remaining (A: {groupACount}/{maxGroupA}, B: {groupBCount}/{maxGroupB})
                      </span>
                    )}
                  </div>

                  {roster.length === 0 ? (
                    <div className="py-8 text-center rounded-lg border border-dashed border-outline-variant/20 bg-surface-container-low/50">
                      <Users className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-on-surface-variant">No players acquired yet</p>
                      <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                        Players won during live bidding will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {roster.map((player, idx) => (
                        <div
                          key={player.id || idx}
                          className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/10 flex items-center justify-between gap-3 hover:border-tertiary/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={player.image_url || '/images/default-player.jpg'}
                              alt={player.player_name || player.name}
                              className="w-10 h-10 rounded-lg object-cover bg-surface-container-highest border border-outline-variant/20 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-on-surface">
                                  {player.player_name || player.name}
                                </h4>
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-tertiary/10 text-tertiary border border-tertiary/20">
                                  Group {player.group || 'A'}
                                </span>
                              </div>
                              <span className="text-[11px] text-on-surface-variant font-mono">
                                {player.player_number || `#${String(idx + 1).padStart(2, '0')}`}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase text-on-surface-variant font-bold block">Sold Price</span>
                            <span className="text-sm font-bold font-mono text-tertiary">
                              {formatCurrency(player.purchase_price || player.current_bid || player.base_price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
