import React, { useState, useEffect } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import DigitalAuctionDisplay from './pages/Display/DigitalAuctionDisplay';
import AdminControlPanel from './pages/Admin/AdminControlPanel';
import LoginPage from './pages/Login/LoginPage';
import TeamDashboard from './pages/Team/TeamDashboard';
import PlayerManagement from './pages/Admin/PlayerManagement';
import AppLayout from './components/Layout/AppLayout';

function AppRouter() {
  const { isAuthenticated, isAdmin, loading } = useAuction();

  // Parse path and query parameters
  const parseCurrentRoute = () => {
    const path = window.location.pathname.toLowerCase();
    
    if (path === '/' || path === '/login' || path.startsWith('/admin/login')) {
      return { view: 'login', teamId: null };
    }
    if (path.startsWith('/admin/players') || path === '/players') {
      return { view: 'players', teamId: null };
    }
    if (path === '/admin' || path.startsWith('/admin/')) {
      return { view: 'admin', teamId: null };
    }
    if (path === '/display') {
      return { view: 'display', teamId: null };
    }
    
    // Match /team/:id
    const teamMatch = path.match(/^\/team\/([1-4])/);
    if (teamMatch) {
      return { view: 'team', teamId: parseInt(teamMatch[1], 10) };
    }

    // Default to Login & Role Selection
    return { view: 'login', teamId: null };
  };

  const [route, setRoute] = useState(parseCurrentRoute);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCurrentRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (targetPath) => {
    window.history.pushState({}, '', targetPath);
    setRoute(parseCurrentRoute());
  };

  if (loading) {
    return (
      <div className="h-screen bg-surface flex flex-col items-center justify-center text-on-surface">
        <div className="w-14 h-14 relative mb-4">
          <img 
            src="/images/tennis-ball-glow.svg" 
            alt="Loading..." 
            className="w-full h-full animate-tennis-spin"
          />
        </div>
        <h2 className="text-xl font-bold font-headline-md text-on-surface">Connecting to Tennis Auction Engine...</h2>
        <p className="text-xs text-on-surface-variant mt-1">Authoritative Real-Time Channel</p>
      </div>
    );
  }

  // View Resolution
  if (route.view === 'login') {
    return <LoginPage onNavigate={navigateTo} />;
  }

  if (route.view === 'display') {
    return <DigitalAuctionDisplay onNavigate={navigateTo} />;
  }

  if (route.view === 'team') {
    return (
      <TeamDashboard 
        teamId={route.teamId} 
        onNavigate={navigateTo} 
      />
    );
  }

  if (route.view === 'players') {
    return (
      <AppLayout 
        activeNav="player-pool" 
        onNavigate={navigateTo}
        currentRole="admin"
      >
        <PlayerManagement 
          onBackToControlPanel={() => navigateTo('/admin')} 
        />
      </AppLayout>
    );
  }

  if (route.view === 'admin') {
    return (
      <AppLayout 
        activeNav="live-bidding" 
        onNavigate={navigateTo}
        currentRole="admin"
      >
        <AdminControlPanel 
          onNavigateToPlayers={() => navigateTo('/admin/players')}
          onOpenDisplay={() => window.open('/display', '_blank')}
        />
      </AppLayout>
    );
  }

  return <LoginPage onNavigate={navigateTo} />;
}

export default function App() {
  return (
    <AuctionProvider>
      <AppRouter />
    </AuctionProvider>
  );
}
