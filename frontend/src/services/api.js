// API Service connecting to Node.js backend with JWT Auth

const API_BASE = (import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '') : '') + '/api';

export const authStorage = {
  getToken: () => localStorage.getItem('tennis_admin_token'),
  setToken: (token) => localStorage.setItem('tennis_admin_token', token),
  removeToken: () => localStorage.removeItem('tennis_admin_token'),
  getUser: () => {
    try {
      const raw = localStorage.getItem('tennis_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('tennis_admin_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('tennis_admin_user')
};

function getHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async login({ username, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    if (json.token) authStorage.setToken(json.token);
    if (json.user || json.admin) authStorage.setUser(json.user || json.admin);
    return json;
  },

  async verifyAuth() {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        authStorage.removeToken();
        authStorage.removeUser();
        return null;
      }
      const json = await res.json();
      return json.user || json.admin;
    } catch {
      return null;
    }
  },

  logout() {
    authStorage.removeToken();
    authStorage.removeUser();
  },

  // Auction State
  async getAuctionState() {
    const res = await fetch(`${API_BASE}/auction/state`, {
      headers: getHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  // Place a Bid
  async placeBid({ team_id, amount, increment }) {
    const res = await fetch(`${API_BASE}/auction/bid`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ team_id, amount, increment })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Bid failed');
    return json;
  },

  // Undo Last Bid
  async undoLastBid() {
    const res = await fetch(`${API_BASE}/auction/undo-bid`, {
      method: 'POST',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Undo bid failed');
    return json;
  },

  // Finalize Sale (SOLD)
  async markSold({ winning_team_id, final_price }) {
    const res = await fetch(`${API_BASE}/auction/sell`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ winning_team_id, final_price })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Sale failed');
    return json;
  },

  // Mark UNSOLD
  async markUnsold() {
    const res = await fetch(`${API_BASE}/auction/pass`, {
      method: 'POST',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Action failed');
    return json;
  },

  // Cue Next Player
  async nextPlayer() {
    const res = await fetch(`${API_BASE}/auction/next-player`, {
      method: 'POST',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to cue next player');
    return json;
  },

  // Set Live Player
  async setLivePlayer(playerId) {
    const res = await fetch(`${API_BASE}/auction/set-live`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ player_id: playerId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Action failed');
    return json;
  },

  // Control Auction (Start, Pause, Resume, Reset, Timer)
  async controlAuction({ action, timer_seconds, bid_increment }) {
    const res = await fetch(`${API_BASE}/auction/control`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, timer_seconds, bid_increment })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Control failed');
    return json;
  },

  // Players
  async getPlayers(status = '') {
    const url = status && status !== 'all' ? `${API_BASE}/players?status=${status}` : `${API_BASE}/players`;
    const res = await fetch(url, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async getPlayerById(id) {
    const res = await fetch(`${API_BASE}/players/${id}`, { headers: getHeaders() });
    const json = await res.json();
    return json.data;
  },

  async createPlayer(data) {
    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create player');
    return json.data;
  },

  async updatePlayer(id, data) {
    const res = await fetch(`${API_BASE}/players/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update player');
    return json.data;
  },

  async deletePlayer(id) {
    const res = await fetch(`${API_BASE}/players/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete player');
    return json.data;
  },

  // Teams
  async getTeams() {
    const res = await fetch(`${API_BASE}/teams`, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async getTeamById(id) {
    const res = await fetch(`${API_BASE}/teams/${id}`, { headers: getHeaders() });
    const json = await res.json();
    return json.data;
  },

  async updateCaptain(teamId, captainData) {
    const res = await fetch(`${API_BASE}/teams/${teamId}/captain`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(captainData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update captain');
    return json.data;
  },

  async updateTeam(id, teamData) {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(teamData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update team');
    return json.data;
  },

  // Sponsors
  async getSponsors() {
    const res = await fetch(`${API_BASE}/sponsors`, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
  }
};
