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
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const userTeamId = currentUser?.team_id || null;

  // Modals & Navigation
  const [viewTeamId, setViewTeamId] = useState(1);
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
  const [isSoldPlayersOpen, setIsSoldPlayersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // Authoritative Countdown timer
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);

  // Dramatic SOLD celebration & UNSOLD banner & Player Intro states for Digital Display
  const [soldCelebration, setSoldCelebration] = useState(null);
  const [unsoldNotice, setUnsoldNotice] = useState(null);
  const [playerIntro, setPlayerIntro] = useState(null);
  const playerIntroTimerRef = useRef(null);

  // Sync whole state from server snapshot
  const syncSnapshot = useCallback((data) => {
    if (!data) return;
    if (data.auction) {
      setAuction(data.auction);
      setCurrentPlayer(data.current_player || data.auction.current_player || null);
      if (data.auction.timer_remaining !== undefined) {
        setTimeLeft(data.auction.timer_remaining);
      }
      if (data.auction.timer_running !== undefined) {
        setTimerRunning(data.auction.timer_running);
      }
    } else if (data.current_player !== undefined) {
      setCurrentPlayer(data.current_player || null);
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

  // Auth verify on mount and safety timeout to prevent hanging
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    api.verifyAuth().then(user => {
      if (user) setCurrentUser(user);
      else {
        setCurrentUser(null);
      }
    }).catch(() => {
      // ignore auth check error
    }).finally(() => {
      setLoading(false);
    });

    return () => clearTimeout(safetyTimer);
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
      // Clear any active player intro
      if (playerIntroTimerRef.current) {
        clearTimeout(playerIntroTimerRef.current);
        playerIntroTimerRef.current = null;
      }
      setPlayerIntro(null);

      // Socket sends: { player, team, amount }
      // HTTP controller sends: { player, winning_team, final_price }
      const team = data.team || data.winning_team || {};
      const teamId = team.id || 0;
      const shortNames = { 1: 'TEAM A', 2: 'TEAM B', 3: 'TEAM C', 4: 'TEAM D' };
      const soldAmount = data.amount || data.final_price || 0;

      setSoldCelebration({
        ...data,
        player_name: data.player?.name || data.player_name || 'Player',
        player_image: data.player?.image_url || null,
        player_category: data.player?.category || null,
        team_name: shortNames[teamId] || team.name || data.team_name || 'Team',
        amount: soldAmount
      });
      setCurrentPlayer(null);
      setSelectedPlayer(null);
      setRecentBids([]);

      // Confetti burst for TV display celebration
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#38bdf8', '#a855f7', '#f97316', '#eab308', '#ffffff']
      });

      // Auto clear celebration banner after 7 seconds
      setTimeout(() => setSoldCelebration(null), 7000);

      // Refresh full state so team purse updates in admin panel
      setTimeout(() => refreshAll(), 500);
    };

    const onPlayerUnsold = (data) => {
      // Clear any active player intro
      if (playerIntroTimerRef.current) {
        clearTimeout(playerIntroTimerRef.current);
        playerIntroTimerRef.current = null;
      }
      setPlayerIntro(null);

      setUnsoldNotice({
        ...data,
        player_name: data.player?.name || data.player_name || 'Player',
        player_image: data.player?.image_url || null,
        player_category: data.player?.category || null
      });
      setCurrentPlayer(null);
      setSelectedPlayer(null);
      setRecentBids([]);

      // Auto clear unsold banner after 5 seconds
      setTimeout(() => setUnsoldNotice(null), 5000);

      // Refresh full state
      setTimeout(() => refreshAll(), 500);
    };

    const onPlayerSelected = (data) => {
      setSoldCelebration(null);
      setUnsoldNotice(null);

      if (data.player) {
        setCurrentPlayer(data.player);
        setSelectedPlayer(data.player);

        // Trigger player intro overlay for 10 seconds
        setPlayerIntro({
          name: data.player.name,
          image_url: data.player.image_url,
          category: data.player.category || 'Group A',
          base_price: data.player.base_price
        });

        // Clear any existing intro timer
        if (playerIntroTimerRef.current) {
          clearTimeout(playerIntroTimerRef.current);
        }
        playerIntroTimerRef.current = setTimeout(() => {
          setPlayerIntro(null);
          playerIntroTimerRef.current = null;
        }, 10000);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('auction_state', onAuctionState);
    socket.on('auction_state_updated', onAuctionState);
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
      socket.off('auction_state_updated', onAuctionState);
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
    const userPayload = res.user || res.admin;
    setCurrentUser(userPayload);
    return res;
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  // Actions
  const placeBid = async ({ team_id, amount, increment }) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit('submit_bid', { team_id, amount, increment }, (response) => {
          if (response && response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response?.message || 'Bid failed'));
          }
        });
      });
    }
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
    currentUser,
    adminUser: currentUser,
    isAdmin,
    userTeamId,
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
    playerIntro,
    setPlayerIntro,
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
