import React, { useState, useEffect } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import DigitalAuctionDisplay from './pages/Display/DigitalAuctionDisplay';
import AdminControlPanel from './pages/Admin/AdminControlPanel';
import LoginPage from './pages/Login/LoginPage';
import TeamDashboard from './pages/Team/TeamDashboard';
import PlayerManagement from './pages/Admin/PlayerManagement';
import TeamSquadsManagement from './pages/Admin/TeamSquadsManagement';
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
    if (path.startsWith('/admin/squads') || path === '/squads' || path === '/admin/teams' || path === '/teams') {
      return { view: 'squads', teamId: null };
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
    if (!isAuthenticated || !isAdmin) {
      return <LoginPage onNavigate={navigateTo} />;
    }
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

  if (route.view === 'squads') {
    return (
      <AppLayout
        activeNav="team-squads"
        onNavigate={navigateTo}
        currentRole="admin"
      >
        <TeamSquadsManagement
          onNavigate={navigateTo}
        />
      </AppLayout>
    );
  }

  if (route.view === 'admin') {
    if (!isAuthenticated || !isAdmin) {
      return <LoginPage onNavigate={navigateTo} />;
    }
    return (
      <AdminControlPanel
        onNavigate={navigateTo}
        onNavigateToPlayers={() => navigateTo('/admin/players')}
        onOpenDisplay={() => window.open('/display', '_blank')}
      />
    );
  }

  return <LoginPage onNavigate={navigateTo} />;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4 text-2xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Auction Screen Recovery</h1>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {this.state.error?.message || 'A temporary interface error occurred. You can safely reload the page or return to the login terminal.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuctionProvider>
        <AppRouter />
      </AuctionProvider>
    </ErrorBoundary>
  );
}
