# 🎾 Live Tennis League Player Auction System
### Dual-Interface Architecture: Admin Control Panel (Laptop) & Digital Auction Display (TV/Projector)

A production-grade, real-time Tennis Player Auction system built with **React (Vite)**, **Node.js (Express)**, **Socket.IO**, and **MySQL**.

The system features two completely isolated interfaces synchronized in real time:
1. **Admin Control Panel** (`/admin`): Operated by auction staff on a laptop to control the auction, manage bids, undo bids, manage countdown timers, sell/pass players, and update rosters.
2. **Digital Auction Display** (`/display`): Shown fullscreen on a TV, projector, or LED screen for the audience with 0 admin buttons, large typography, glowing bids, live countdown ring, and dramatic broadcast animations.

---

## 🗂️ 1. Final Folder Structure

```
tennis/
├── frontend/                                # React 19 + Vite + Tailwind CSS Frontend
│   ├── public/
│   │   ├── images/
│   │   │   ├── players/                     # High-res athletic player photography
│   │   │   ├── teams/                       # SVG team emblems (Lion, Eagle, Crown, Flame)
│   │   │   ├── sponsors/                    # Sponsor logos (SportWave, ApexHealth, etc.)
│   │   │   └── tennis-ball-glow.svg         # Rotating neon tennis ball branding
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── AdminControlPanel.jsx    # Complete laptop master control room
│   │   │   │   ├── AdminLogin.jsx           # Secure glassmorphic admin login
│   │   │   │   └── PlayerManagement.jsx     # Athlete pool CRUD, filters & status
│   │   │   └── Display/
│   │   │       └── DigitalAuctionDisplay.jsx# 1080p/4K fullscreen TV presentation view
│   │   ├── components/                      # Modular components & modals
│   │   │   ├── Header.jsx
│   │   │   ├── LiveAuction.jsx
│   │   │   ├── PlayerDetails.jsx
│   │   │   ├── TeamSection.jsx
│   │   │   ├── TeamModal.jsx
│   │   │   └── UpcomingPlayers.jsx
│   │   ├── context/
│   │   │   └── AuctionContext.jsx           # Central real-time state & Socket.IO sync
│   │   ├── services/
│   │   │   ├── api.js                       # Authenticated Fetch API client (JWT)
│   │   │   └── socket.js                    # Socket.IO client singleton
│   │   ├── App.jsx                          # Dynamic router (/display, /admin, /players)
│   │   ├── index.css                        # Glassmorphism, animations, glowing borders
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js                       # WebSocket & /api reverse proxy
│   └── package.json
│
├── backend/                                 # Node.js + Express + Socket.IO Server
│   ├── config/
│   │   └── db.js                            # MySQL2 pool + in-memory store fallback
│   ├── controllers/
│   │   ├── auctionController.js             # Real-time bids, undo, sell, pass, timer
│   │   ├── playersController.js             # Player CRUD & draft filtering
│   │   ├── teamsController.js               # Team purse & roster calculations
│   │   └── sponsorsController.js            # Sponsor directory
│   ├── middleware/
│   │   └── auth.js                          # JWT bearer token verification
│   ├── routes/
│   │   ├── auth.js                          # /api/auth/login and /me
│   │   ├── auction.js                       # /api/auction endpoints
│   │   ├── players.js                       # /api/players endpoints
│   │   ├── teams.js                         # /api/teams endpoints
│   │   └── sponsors.js                      # /api/sponsors endpoints
│   ├── socket/
│   │   └── auctionSocket.js                 # Authoritative server timer & event emitter
│   ├── server.js                            # Express + HTTP + Socket.IO entry point
│   └── package.json
│
├── database/
│   ├── schema.sql                           # Full MySQL DDL (admins, teams, players, bids, events)
│   └── seed.sql                             # Seed data matching live league rosters
│
└── README.md
```

---

## 🗄️ 2. Database Schema

The database schema is defined in [database/schema.sql](file:///Users/vakapallimukesh/tennis/database/schema.sql):

- **`admins`**: `id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`, `updated_at`.
- **`teams`**: `id`, `team_number`, `name`, `tagline`, `owner`, `total_purse`, `purse_remaining`, `max_players`, `logo_url`, `primary_color`, `accent_color`, `glow_color`, `bg_gradient`.
- **`players`**: `id`, `player_number`, `name`, `age`, `country`, `country_flag`, `category`, `playing_hand`, `world_ranking`, `wins`, `aces`, `matches`, `win_percentage`, `base_price`, `image_url`, `status` (`upcoming`, `live`, `sold`, `unsold`), `display_order`.
- **`auctions`**: `id`, `title`, `status`, `current_player_id`, `current_bid`, `highest_bidder_team_id`, `bid_increment`, `timer_seconds`, `timer_remaining`, `timer_running`.
- **`bids`**: `id`, `auction_id`, `player_id`, `team_id`, `amount`, `bid_time`.
- **`team_players`**: `id`, `team_id`, `player_id`, `purchase_price`, `purchased_at`.
- **`auction_events`**: `id`, `event_type`, `auction_id`, `player_id`, `team_id`, `payload`, `created_at`.
- **`sponsors`**: `id`, `category`, `name`, `logo_icon`, `website`.

---

## 🔌 3. API Endpoints

### Authentication
- `POST /api/auth/login` → Log in admin; returns JWT token & admin profile.
- `GET /api/auth/me` → Verify current admin token (`Authorization: Bearer <token>`).

### Auction Management
- `GET /api/auction/state` → Full auction snapshot (player, bids, teams, timer).
- `POST /api/auction/bid` → Place bid (`team_id`, `amount`, `increment`). *(Admin protected)*
- `POST /api/auction/undo-bid` → Revert the last bid and restore previous leader. *(Admin protected)*
- `POST /api/auction/sell` → Finalize sale: hammer falls, team purse deducted, triggers SOLD animation. *(Admin protected)*
- `POST /api/auction/pass` → Mark player as UNSOLD and move to re-auction pool. *(Admin protected)*
- `POST /api/auction/next-player` → Advance to the next upcoming athlete. *(Admin protected)*
- `POST /api/auction/set-live` → Manually cue any athlete to live status. *(Admin protected)*
- `POST /api/auction/control` → Start, pause, resume, end, timer controls. *(Admin protected)*

### Players & Teams
- `GET /api/players?status=upcoming|live|sold|unsold` → List players.
- `POST /api/players` → Create player. *(Admin protected)*
- `PUT /api/players/:id` → Update player. *(Admin protected)*
- `DELETE /api/players/:id` → Remove player. *(Admin protected)*
- `GET /api/teams` → List 4 franchises with purse calculations.
- `GET /api/sponsors` → List sponsors.

---

## ⚡ 4. Socket.IO Real-Time Events

| Event Name | Direction | Payload Description |
| :--- | :--- | :--- |
| `auction_state` | Server → Client | Complete snapshot emitted on connection or state refresh. |
| `timer_updated` | Server → Client | Authoritative tick every second (`timer_remaining`, `timer_running`, `current_bid`). |
| `timer_expired` | Server → Client | Emitted when countdown reaches 0 (`current_bid`, `highest_bidder_team_id`). |
| `bid_placed` | Server → Client | Broadcasts new bid amount, highest team, and updated countdown. |
| `bid_undone` | Server → Client | Broadcasts reverted bid and restored previous leader. |
| `player_sold` | Server → Client | Triggers dramatic **SOLD!** broadcast modal with confetti. |
| `player_unsold` | Server → Client | Triggers **PLAYER UNSOLD** broadcast card. |
| `player_selected`| Server → Client | Sets a new athlete on the live auction block. |
| `auction_started` | Server → Client | Auction goes LIVE; timer starts. |
| `auction_paused` | Server → Client | Auction paused; timer stops. |
| `auction_resumed` | Server → Client | Auction resumes. |
| `auction_ended` | Server → Client | Auction session concludes. |
| `digital_display_updated` | Server → Client | Signals TV display to refresh view. |

---

## 🔐 5. Admin Login Credentials

Default credentials are configured via environment variables in `backend/.env`:
- **Username**: `admin`
- **Password**: Set via `DEFAULT_ADMIN_PASSWORD` in `backend/.env`

> ⚠️ **Important**: Always change default passwords before deploying to production.

---

## 🚀 6. How to Run Backend

```bash
cd backend
npm install
npm run dev
```
Backend runs on: **`http://localhost:5001`**
*(Health check: `http://localhost:5001/api/health`)*

---

## 💻 7. How to Run Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: **`http://localhost:5173`**

---

## 🖥️ 8. How to Open Admin Panel

1. Open your laptop browser and visit:
   👉 **`http://localhost:5173/admin`**
2. Log in with your configured admin credentials (see Section 5 & 13).
3. You now have full auction control over bids, timer, athletes, and hammer fall.

---

## 📺 9. How to Open Digital Display (TV / Projector)

1. Open the TV/projector browser or a separate display monitor and visit:
   👉 **`http://localhost:5173/display`**
2. Press `F11` (or click the lightning bolt icon in the top right) for **Fullscreen Mode**.
3. The display will stay locked on the live broadcast with 0 administrative controls.

---

## 🌐 10. How to Connect Laptop & Digital Screen on the Same Wi-Fi Network

When running the auction at a venue with a laptop and a separate smart TV / PC:
1. Find your laptop's local IP address:
   - On macOS: Run `ipconfig getifaddr en0` or check Wi-Fi Settings (e.g., `192.168.1.45`).
2. Start the frontend with host exposure:
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0
   ```
3. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
4. On the **Laptop**: Open `http://localhost:5173/admin`.
5. On the **Smart TV / Projector**: Open `http://192.168.1.45:5173/display`.
6. Both devices will synchronize instantaneously through WebSockets over the local Wi-Fi router.

---

## ☁️ 11. How to Deploy Frontend to Vercel

1. Push code to GitHub.
2. In Vercel, import the repository and set the **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_BACKEND_URL`: `https://your-backend-domain.com`
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`, Output Directory: `dist`.
6. Deploy!

---

## ☁️ 12. How to Deploy Backend (Render / Railway / VPS)

### Deploying on Render / Railway:
1. Root directory: `backend`.
2. Build command: `npm install`.
3. Start command: `node server.js`.
4. Add Environment Variables:
   - `PORT`: `5001` (or provided by host)
   - `JWT_SECRET`: `your_production_secret_key`
   - `DB_HOST`: Your MySQL host *(Optional: backend automatically uses in-memory store if MySQL is not attached)*
   - `DB_USER`: Your MySQL user
   - `DB_PASSWORD`: Your MySQL password
   - `DB_NAME`: `tennis_auction`

---

## 🔑 13. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
JWT_SECRET=CHANGE_ME_to_a_random_64_character_secret
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tennis_auction
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:5001
```

---

## ✅ 14. Testing Checklist

- [x] **Admin Authentication**: Admin logs in via `/admin/login` using configured credentials.
- [x] **Real-Time Bid Sync**: Placing a bid on `/admin` updates the current bid and highest bidder on `/display` in real time with 0 page refresh.
- [x] **Authoritative Timer**: Timer counts down from server ticks; pausing or adding +5s reflects simultaneously on both screens without drift.
- [x] **Bid Validation**: Prevents bids lower than current bid, prevents bids exceeding franchise purse, and blocks bids when squad is full (5/5).
- [x] **Undo Bid**: Clicking `[UNDO LAST BID]` restores the previous bid and highest bidder immediately.
- [x] **Hammer Fall (SOLD)**: Mark SOLD shows confirmation modal, deducts winning team's purse, adds athlete to franchise roster, and triggers the dramatic **SOLD!** confetti animation on the TV display.
- [x] **Mark UNSOLD**: Correctly flags athlete as unsold and displays broadcast notice.
- [x] **Next Player**: Transitions the live auction block to the next upcoming athlete.
- [x] **Player Pool Management**: Full CRUD, status filtering, and "SET LIVE" cue on `/admin/players`.
- [x] **Reconnection Handling**: Shows reconnecting banner when connection drops and recovers automatically.
