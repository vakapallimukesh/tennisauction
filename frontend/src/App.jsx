import React, { useState, useEffect } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import DigitalAuctionDisplay from './pages/Display/DigitalAuctionDisplay';
import AdminControlPanel from './pages/Admin/AdminControlPanel';
import AdminLogin from './pages/Admin/AdminLogin';
import PlayerManagement from './pages/Admin/PlayerManagement';
import { Tv, ShieldCheck, Users, Radio, MoreVertical, X } from 'lucide-react';

function AppRouter() {
  const { isAuthenticated, loading, error, isSocketConnected } = useAuction();

  // Determine initial view from URL path
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin/login')) return 'login';
    if (path.startsWith('/admin/players')) return 'players';
    if (path.startsWith('/admin')) return 'admin';
    return 'display';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync with browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    let path = '/display';
    if (view === 'admin') path = '/admin';
    if (view === 'login') path = '/admin/login';
    if (view === 'players') path = '/admin/players';
    window.history.pushState({}, '', path);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050914] flex flex-col items-center justify-center text-slate-300">
        <div className="w-14 h-14 relative mb-4">
          <img 
            src="/images/tennis-ball-glow.svg" 
            alt="Loading..." 
            className="w-full h-full animate-tennis-spin"
          />
        </div>
        <h2 className="text-xl font-bold font-display text-white">Connecting to Tennis Auction Engine...</h2>
        <p className="text-xs text-slate-500 mt-1">Establishing Real-Time Socket.IO Channel</p>
      </div>
    );
  }

  // View Resolution
  let renderComponent = null;

  if (currentView === 'display') {
    renderComponent = <DigitalAuctionDisplay />;
  } else if (currentView === 'login') {
    renderComponent = (
      <AdminLogin 
        onLoginSuccess={() => navigateTo('admin')} 
      />
    );
  } else if (currentView === 'players') {
    if (!isAuthenticated) {
      renderComponent = (
        <AdminLogin 
          onLoginSuccess={() => navigateTo('players')} 
        />
      );
    } else {
      renderComponent = (
        <PlayerManagement 
          onBackToControlPanel={() => navigateTo('admin')} 
        />
      );
    }
  } else {
    // currentView === 'admin'
    if (!isAuthenticated) {
      renderComponent = (
        <AdminLogin 
          onLoginSuccess={() => navigateTo('admin')} 
        />
      );
    } else {
      renderComponent = (
        <AdminControlPanel 
          onNavigateToPlayers={() => navigateTo('players')}
          onOpenDisplay={() => window.open('/display', '_blank')}
        />
      );
    }
  }

  return (
    <div className="relative min-h-screen">
      {renderComponent}

      {/* 3-DOTS QUICK-SWITCHER IN NAVIGATION BAR RIGHT CORNER */}
      <div className="fixed top-2.5 right-4 z-50 flex flex-col items-end">
        {/* 3-Dots Trigger Button */}
        <button
          onClick={() => setIsMenuOpen(prev => !prev)}
          className={`p-2 rounded-xl backdrop-blur-xl border transition-all duration-200 shadow-xl flex items-center justify-center ${
            isMenuOpen
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 rotate-90 scale-105'
              : 'bg-slate-900/90 text-slate-300 border-white/20 hover:border-emerald-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Switch Interface View"
          aria-label="Switch Interface View"
        >
          {isMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <MoreVertical className="w-4 h-4" />
          )}
        </button>

        {/* Expanded Menu Dropdown */}
        {isMenuOpen && (
          <>
            {/* Backdrop to close on click outside */}
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsMenuOpen(false)} 
            />

            <div className="relative z-50 mt-2 w-52 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl animate-scale-up">
              <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-display">
                  SWITCH INTERFACE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigateTo('display');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    currentView === 'display'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    <span>TV Display</span>
                  </div>
                  {currentView === 'display' && <span className="text-[10px] font-black uppercase">Active</span>}
                </button>

                <button
                  onClick={() => {
                    navigateTo('admin');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    currentView === 'admin' || currentView === 'login'
                      ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Laptop</span>
                  </div>
                  {(currentView === 'admin' || currentView === 'login') && (
                    <span className="text-[10px] font-black uppercase">Active</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    navigateTo('players');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    currentView === 'players'
                      ? 'bg-purple-500 text-white shadow-md font-black'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Player Pool</span>
                  </div>
                  {currentView === 'players' && <span className="text-[10px] font-black uppercase">Active</span>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuctionProvider>
      <AppRouter />
    </AuctionProvider>
  );
}
