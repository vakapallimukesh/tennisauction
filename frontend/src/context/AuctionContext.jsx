import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, authStorage } from '../services/api';
import { getSocket } from '../services/socket';
import confetti from 'canvas-confetti';

const AuctionContext = createContext(null);

export function AuctionProvider({ children }) {
  const [auction, setAuction] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [upcomingPlayers, setUpcomingPlayers] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time socket status
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Authentication State
  const [adminUser, setAdminUser] = useState(() => authStorage.getUser());
  const isAuthenticated = !!adminUser;

  // Modals & Navigation
  const [viewTeamId, setViewTeamId] = useState(1);
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
  const [isSoldPlayersOpen, setIsSoldPlayersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // Authoritative Countdown timer
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);

  // Dramatic SOLD celebration & UNSOLD banner states for Digital Display
  const [soldCelebration, setSoldCelebration] = useState(null);
  const [unsoldNotice, setUnsoldNotice] = useState(null);

  // Sync whole state from server snapshot
  const syncSnapshot = useCallback((data) => {
    if (!data) return;
    if (data.auction) {
      setAuction(data.auction);
      setCurrentPlayer(data.auction.current_player || data.current_player);
      if (data.auction.timer_remaining !== undefined) {
        setTimeLeft(data.auction.timer_remaining);
      }
      if (data.auction.timer_running !== undefined) {
        setTimerRunning(data.auction.timer_running);
      }
    }
    if (data.current_player) {
      setCurrentPlayer(data.current_player);
      setSelectedPlayer(prev => prev ? prev : data.current_player);
    }
    if (data.teams) setTeams(data.teams);
    if (data.upcoming_players) setUpcomingPlayers(data.upcoming_players);
    if (data.sold_players) setSoldPlayers(data.sold_players);
    if (data.unsold_players) setUnsoldPlayers(data.unsold_players);
    if (data.recent_bids) setRecentBids(data.recent_bids);
    if (data.sponsors) setSponsors(data.sponsors);
    setLoading(false);
    setError(null);
  }, []);

  // Initial HTTP fetch fallback
  const refreshAll = useCallback(async () => {
    try {
      const data = await api.getAuctionState();
      syncSnapshot(data);
    } catch (err) {
      console.warn('HTTP fetch failed, waiting for socket or retry:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [syncSnapshot]);

  // Auth verify on mount
  useEffect(() => {
    api.verifyAuth().then(user => {
      if (user) setAdminUser(user);
      else {
        setAdminUser(null);
      }
    });
  }, []);

  // Socket.IO Setup & Event Listeners
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsSocketConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const onAuctionState = (data) => {
      syncSnapshot(data);
    };

    const onTimerUpdated = (data) => {
      if (data.timer_remaining !== undefined) {
        setTimeLeft(data.timer_remaining);
      }
      if (data.timer_running !== undefined) {
        setTimerRunning(data.timer_running);
      }
      if (data.current_bid !== undefined) {
        setAuction(prev => prev ? { ...prev, current_bid: data.current_bid, highest_bidder_team_id: data.highest_bidder_team_id } : prev);
      }
    };

    const onBidPlaced = (data) => {
      setAuction(prev => prev ? {
        ...prev,
        current_bid: data.current_bid,
        highest_bidder_team_id: data.highest_bidder_team_id
      } : prev);
      setTimeLeft(data.timer_remaining || 15);
      if (data.bid) {
        setRecentBids(prev => [data.bid, ...prev.slice(0, 14)]);
      }
    };

    const onBidUndone = (data) => {
      setAuction(prev => prev ? {
        ...prev,
        current_bid: data.current_bid,
        highest_bidder_team_id: data.highest_bidder_team_id
      } : prev);
      setTimeLeft(data.timer_remaining || 15);
    };

    const onPlayerSold = (data) => {
      setSoldCelebration(data);
      // Confetti burst for TV display celebration
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#38bdf8', '#a855f7', '#f97316', '#eab308', '#ffffff']
      });

      // Auto clear celebration banner after 7 seconds
      setTimeout(() => {
        setSoldCelebration(null);
      }, 7000);
    };

    const onPlayerUnsold = (data) => {
      setUnsoldNotice(data);
      setTimeout(() => {
        setUnsoldNotice(null);
      }, 5000);
    };

    const onPlayerSelected = (data) => {
      setSoldCelebration(null);
      setUnsoldNotice(null);
      if (data.player) {
        setCurrentPlayer(data.player);
        setSelectedPlayer(data.player);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('auction_state', onAuctionState);
    socket.on('digital_display_updated', onAuctionState);
    socket.on('timer_updated', onTimerUpdated);
    socket.on('bid_placed', onBidPlaced);
    socket.on('bid_undone', onBidUndone);
    socket.on('player_sold', onPlayerSold);
    socket.on('player_unsold', onPlayerUnsold);
    socket.on('player_selected', onPlayerSelected);

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    refreshAll();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('auction_state', onAuctionState);
      socket.off('digital_display_updated', onAuctionState);
      socket.off('timer_updated', onTimerUpdated);
      socket.off('bid_placed', onBidPlaced);
      socket.off('bid_undone', onBidUndone);
      socket.off('player_sold', onPlayerSold);
      socket.off('player_unsold', onPlayerUnsold);
      socket.off('player_selected', onPlayerSelected);
    };
  }, [syncSnapshot, refreshAll]);

  // Auth Functions
  const login = async (username, password) => {
    const res = await api.login({ username, password });
    setAdminUser(res.admin);
    return res;
  };

  const logout = () => {
    api.logout();
    setAdminUser(null);
  };

  // Actions
  const placeBid = async ({ team_id, amount, increment }) => {
    return await api.placeBid({ team_id, amount, increment });
  };

  const undoLastBid = async () => {
    return await api.undoLastBid();
  };

  const markSold = async (winning_team_id, final_price) => {
    return await api.markSold({ winning_team_id, final_price });
  };

  const markUnsold = async () => {
    return await api.markUnsold();
  };

  const nextPlayer = async () => {
    return await api.nextPlayer();
  };

  const selectLivePlayer = async (playerId) => {
    return await api.setLivePlayer(playerId);
  };

  const controlAuction = async (action, timer_seconds, bid_increment) => {
    return await api.controlAuction({ action, timer_seconds, bid_increment });
  };

  const value = {
    auction,
    currentPlayer,
    selectedPlayer,
    setSelectedPlayer,
    teams,
    upcomingPlayers,
    soldPlayers,
    unsoldPlayers,
    recentBids,
    sponsors,
    loading,
    error,
    isSocketConnected,
    adminUser,
    isAuthenticated,
    login,
    logout,
    timeLeft,
    timerRunning,
    viewTeamId,
    setViewTeamId,
    isBiddingModalOpen,
    setIsBiddingModalOpen,
    isSoldPlayersOpen,
    setIsSoldPlayersOpen,
    isAdminOpen,
    setIsAdminOpen,
    activeTab,
    setActiveTab,
    soldCelebration,
    setSoldCelebration,
    unsoldNotice,
    setUnsoldNotice,
    placeBid,
    undoLastBid,
    markSold,
    markUnsold,
    nextPlayer,
    selectLivePlayer,
    controlAuction,
    refreshAll
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
}

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) throw new Error('useAuction must be used within an AuctionProvider');
  return context;
};
