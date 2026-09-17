import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';

export default function AppLayout({ 
  children, 
  activeNav = 'live-bidding', 
  onNavigate,
  currentRole = 'admin'
}) {
  const { isSocketConnected, logout, currentUser } = useAuction();
  const [isMuted, setIsMuted] = useState(false);

  // Map route to role for selector
  const handleRoleChange = (e) => {
    const selected = e.target.value;
    if (selected === 'Admin Control') {
      onNavigate('/admin');
    } else if (selected === 'Team 1 (Eagles)') {
      onNavigate('/team/1');
    } else if (selected === 'Team 2 (Falcons)') {
      onNavigate('/team/2');
    } else if (selected === 'Team 3 (Vipers)') {
      onNavigate('/team/3');
    } else if (selected === 'Team 4 (Strikers)') {
      onNavigate('/team/4');
    } else if (selected === 'Digital TV LED Display') {
      onNavigate('/display');
    }
  };

  const getRoleDropdownValue = () => {
    if (currentRole === 'admin') return 'Admin Control';
    if (currentRole === 'team1') return 'Team 1 (Eagles)';
    if (currentRole === 'team2') return 'Team 2 (Falcons)';
    if (currentRole === 'team3') return 'Team 3 (Vipers)';
    if (currentRole === 'team4') return 'Team 4 (Strikers)';
    if (currentRole === 'display') return 'Digital TV LED Display';
    return 'Admin Control';
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col pt-6 pb-8 border-r border-outline-variant/15">
        <div 
          className="px-gutter mb-8 flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('/admin')}
        >
          <span className="material-symbols-outlined text-tertiary text-headline-sm animate-pulse">sports_tennis</span>
          <span className="font-headline-sm uppercase text-primary tracking-tight">Tennis Auction</span>
        </div>

        <nav className="flex-1 px-space-md space-y-space-xs">
          <button
            onClick={() => onNavigate('/admin')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left ${
              activeNav === 'live-bidding'
                ? 'bg-surface-container-highest text-tertiary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-3">gavel</span>
            <span>Live Bidding</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/players')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left ${
              activeNav === 'player-pool'
                ? 'bg-surface-container-highest text-tertiary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-3">group</span>
            <span>Player Pool</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/squads')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left ${
              activeNav === 'team-squads'
                ? 'bg-surface-container-highest text-tertiary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-3">shield</span>
            <span>Team Squads</span>
          </button>

          <button
            onClick={() => onNavigate('/display')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left ${
              activeNav === 'display'
                ? 'bg-surface-container-highest text-tertiary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined mr-3">tv</span>
            <span>TV Broadcast View</span>
          </button>

          <button
            onClick={() => onNavigate('/login')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all text-left text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`}
          >
            <span className="material-symbols-outlined mr-3">swap_horiz</span>
            <span>Switch Role / Terminal</span>
          </button>
        </nav>

        <div className="px-gutter pt-4 border-t border-outline-variant/20 flex items-center justify-between text-label-md text-on-surface-variant">
          <span>SYS.v2.4.0</span>
          <span className="flex items-center gap-1 text-tertiary">
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-tertiary animate-pulse' : 'bg-error'}`}></span>
            {isSocketConnected ? 'ONLINE' : 'CONNECTING'}
          </span>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-72">
        {/* Header */}
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-gutter border-b border-outline-variant/15">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-tertiary text-[18px] mr-2">broadcast_on_personal</span>
              <span className="text-label-md uppercase tracking-wider text-on-surface">Role:</span>
              <select 
                value={getRoleDropdownValue()}
                onChange={handleRoleChange}
                className="bg-transparent text-tertiary font-bold ml-1 outline-none cursor-pointer"
              >
                <option className="bg-surface text-on-surface">Admin Control</option>
                <option className="bg-surface text-on-surface">Team 1 (Eagles)</option>
                <option className="bg-surface text-on-surface">Team 2 (Falcons)</option>
                <option className="bg-surface text-on-surface">Team 3 (Vipers)</option>
                <option className="bg-surface text-on-surface">Team 4 (Strikers)</option>
                <option className="bg-surface text-on-surface">Digital TV LED Display</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-tertiary text-[16px]">wifi</span>
              <span>Latency: 12ms</span>
            </div>

            <button 
              onClick={() => setIsMuted(prev => !prev)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>

            <button
              onClick={() => {
                logout();
                onNavigate('/login');
              }}
              className="w-8 h-8 rounded-full bg-primary hover:opacity-90 flex items-center justify-center transition-opacity"
              title={`Logged in as ${currentUser?.full_name || 'Admin'} - Click to Sign Out`}
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="relative pt-24 bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
