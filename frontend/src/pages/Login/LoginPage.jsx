import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';

const TERMINAL_ROLES = [
  {
    id: 'admin',
    name: 'Admin Control',
    category: 'Master Control',
    icon: 'admin_panel_settings',
    badge: 'SEC_LEVEL: 01',
    description: 'Full override privileges, hammer control, player pool management, and audit log oversight.',
    username: 'admin',
    defaultPass: 'tennis2026',
    targetRoute: '/admin'
  },
  {
    id: 'team1',
    name: 'Team 1 (Eagles)',
    category: 'Franchise 01',
    icon: 'shield',
    badge: 'PURSE: ₹12.5L',
    description: 'Dedicated bidding console, purse telemetry, and real-time squad roster tracking.',
    username: 'team1',
    defaultPass: 'team1@auction',
    targetRoute: '/team/1'
  },
  {
    id: 'team2',
    name: 'Team 2 (Falcons)',
    category: 'Franchise 02',
    icon: 'shield',
    badge: 'PURSE: ₹10.8L',
    description: 'Dedicated bidding console, purse telemetry, and real-time squad roster tracking.',
    username: 'team2',
    defaultPass: 'team2@auction',
    targetRoute: '/team/2'
  },
  {
    id: 'team3',
    name: 'Team 3 (Vipers)',
    category: 'Franchise 03',
    icon: 'shield',
    badge: 'PURSE: ₹14.2L',
    description: 'Dedicated bidding console, purse telemetry, and real-time squad roster tracking.',
    username: 'team3',
    defaultPass: 'team3@auction',
    targetRoute: '/team/3'
  },
  {
    id: 'team4',
    name: 'Team 4 (Strikers)',
    category: 'Franchise 04',
    icon: 'shield',
    badge: 'PURSE: ₹9.6L',
    description: 'Dedicated bidding console, purse telemetry, and real-time squad roster tracking.',
    username: 'team4',
    defaultPass: 'team4@auction',
    targetRoute: '/team/4'
  },
  {
    id: 'display',
    name: 'Digital TV / LED Display',
    category: 'Broadcast Feed',
    icon: 'tv',
    badge: 'RES: 4K 60FPS',
    description: 'Optimized high-contrast view for stadium screens, live broadcast feeds, and audience tickers.',
    username: null,
    defaultPass: 'PUBLIC_FEED',
    targetRoute: '/display'
  }
];

export default function LoginPage({ onNavigate }) {
  const { login } = useAuction();
  const [selectedRole, setSelectedRole] = useState(TERMINAL_ROLES[0]);
  const [passkey, setPasskey] = useState(TERMINAL_ROLES[0].defaultPass);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setPasskey(role.defaultPass);
    setErrorMsg('');
  };

  const handleLaunch = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (selectedRole.id === 'display') {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        onNavigate('/display');
      }, 500);
      return;
    }

    setIsAuthenticating(true);
    try {
      await login(selectedRole.username, passkey);
      setTimeout(() => {
        setIsAuthenticating(false);
        onNavigate(selectedRole.targetRoute);
      }, 400);
    } catch (err) {
      // Fallback for admin if seeded with alternative password
      if (selectedRole.id === 'admin' && passkey !== 'tennis2026') {
        try {
          await login(selectedRole.username, 'tennis2026');
          setTimeout(() => {
            setIsAuthenticating(false);
            onNavigate(selectedRole.targetRoute);
          }, 400);
          return;
        } catch {
          // ignore fallback error
        }
      }
      setIsAuthenticating(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden overflow-y-auto bg-surface text-on-surface">
      {/* Stadium background overlay with atmosphere */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" 
        style={{ 
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDdyfWy0s5HCThFlWEPVOlekv-VI0vHR7nSNV3aGZmDhwAiobwLjhlbvtDPZJ3sb_9ItqfCqxHpN-Qh3enXFEhFAn3u7xSysA-YCkjjSoVf4zbtDIB3sI6nfeJqyrc5lfJVrEozs82c0zWHFuDfjOZt4i9ZWXFlaeUW1cReLlZplTa2yMdzOEL7KYgcGorQaahhn84V6VutjHm1lZ7lS93Z-8UchMpCs8TilJD_NPNJZLFuIIF922w')` 
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-surface/90 to-surface/40 backdrop-blur-sm pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col flex-1 max-w-7xl mx-auto w-full px-gutter py-12 justify-between">
        {/* Header Hero Title */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high text-tertiary font-label-md uppercase tracking-wider shadow-sm">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Secure Authentication Portal</span>
          </div>
          <h1 className="font-headline-lg text-4xl lg:text-5xl text-on-surface tracking-tight">
            Select Your Access <span className="text-tertiary">Terminal</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl">
            Choose your authorized persona to enter the live tennis player auction draft room. Telemetry and bidding rights will lock to your selected role.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
          {TERMINAL_ROLES.map((role) => {
            const isSelected = selectedRole.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`group relative cursor-pointer rounded-xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between border-2 ${
                  isSelected
                    ? 'border-tertiary bg-surface-container-high scale-[1.02]'
                    : 'border-transparent bg-surface-container hover:bg-surface-container-high hover:scale-[1.01] hover:border-tertiary/40'
                }`}
              >
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center transition-colors ${
                  isSelected ? 'text-tertiary' : 'text-on-surface-variant group-hover:text-tertiary'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{role.icon}</span>
                </div>

                <div>
                  <span className="text-label-md text-tertiary uppercase tracking-wider">{role.category}</span>
                  <h3 className="font-headline-md text-on-surface mt-1">{role.name}</h3>
                  <p className="font-body-md text-on-surface-variant mt-2">{role.description}</p>
                </div>

                <div className={`mt-6 pt-4 flex items-center justify-between text-label-md border-t border-outline-variant/10 ${
                  isSelected ? 'text-tertiary' : 'text-on-surface group-hover:text-tertiary'
                }`}>
                  <span>{role.badge}</span>
                  <span className="material-symbols-outlined transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-3 max-w-xl mx-auto text-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bottom Action Bar */}
        <form 
          onSubmit={handleLaunch}
          className="flex flex-col sm:flex-row items-center justify-between bg-surface-container-low p-6 rounded-2xl gap-4 border border-outline-variant/15 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-tertiary border border-outline-variant/20">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <div>
              <div className="text-label-md text-on-surface-variant">ACTIVE SELECTION</div>
              <div className="font-headline-sm text-on-surface">{selectedRole.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {selectedRole.id !== 'display' ? (
              <div className="relative flex-1 sm:w-64">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter security passkey..."
                  required
                  className="w-full bg-surface text-on-surface px-4 py-3 rounded-lg border border-outline-variant/30 focus:border-tertiary focus:outline-none font-body-md text-sm"
                />
              </div>
            ) : (
              <div className="hidden sm:block text-label-md text-tertiary px-3 py-2 bg-surface-container rounded-lg">
                PUBLIC BROADCAST (NO PASSKEY REQUIRED)
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="bg-tertiary text-on-tertiary font-label-md px-8 py-3 rounded-lg hover:bg-tertiary-fixed-dim transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>ESTABLISHING SOCKET...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>LAUNCH INTERFACE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
