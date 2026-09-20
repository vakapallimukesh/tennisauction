# Project Security Audit

## Executive Summary

A comprehensive security audit of the **Tennis Premier League Player Auction System** repository was performed across all code, configuration files, environment variables, database schemas, frontend components, backend endpoints, and Git history.

Overall, the repository demonstrates a solid, modern component structure and clear separation between frontend and backend. However, **critical security risks** exist that must be remediated prior to public deployment. Most notably, **hardcoded JWT secrets**, **default admin and team credentials**, **unauthenticated endpoint exposures (`PUT /api/teams/:id` and `/api/auction/reset`)**, **insecure default CORS configuration (`origin: '*'`)**, and **hardcoded fallback secrets inside source code and repository history**.

---

## Critical Issues

### 1. Unauthenticated Global Reset Endpoint
- **Severity**: CRITICAL
- **File Path**: [`backend/server.js`](file:///Users/vakapallimukesh/tennis/backend/server.js#L45-L54)
- **Line Number**: 45-54
- **Problem**: The endpoint `POST /api/auction/reset` resets all auction state (clearing all placed bids, resetting franchise purses, and unassigning sold players) **without any authentication or authorization checks**.
- **Why it is dangerous**: Any unauthenticated public user or malicious attacker could send an HTTP POST request to `/api/auction/reset` during a live auction and instantly wipe out all live auction data and database state.
- **Safe Recommendation**: Protect the route with `requireAdmin` middleware (`app.post('/api/auction/reset', requireAdmin, ...)`), or remove/disable the endpoint entirely in production environments.

### 2. Hardcoded JWT Secret Fallback in Source Code
- **Severity**: CRITICAL
- **File Path**: [`backend/middleware/auth.js`](file:///Users/vakapallimukesh/tennis/backend/middleware/auth.js#L3)
- **Line Number**: 3
- **Problem**: The JWT signing and verification fallback key is hardcoded directly in the source code: `process.env.JWT_SECRET || 'tennis_auction_super_secret_jwt_key_2026'`.
- **Why it is dangerous**: If `JWT_SECRET` is omitted from `.env` in production, the application silently defaults to this public secret. Anyone with knowledge of the code can forge valid JWT admin tokens and gain full administrative access to the server.
- **Safe Recommendation**: Do not provide a hardcoded fallback string for `JWT_SECRET`. If `process.env.JWT_SECRET` is missing on startup, throw an explicit initialization error and prevent the server from starting.

### 3. Hardcoded Default Passwords & Auto-Login Credentials in Client Frontend
- **Severity**: CRITICAL
- **File Path**: [`frontend/src/pages/Admin/AdminLogin.jsx`](file:///Users/vakapallimukesh/tennis/frontend/src/pages/Admin/AdminLogin.jsx#L7-L8) and [`frontend/src/pages/Login/LoginPage.jsx`](file:///Users/vakapallimukesh/tennis/frontend/src/pages/Login/LoginPage.jsx#L13-L58)
- **Line Number**: AdminLogin.jsx (Lines 7-8, 30-31, 111), LoginPage.jsx (Lines 13-58, 108-110)
- **Problem**: Default admin credentials (`admin` / `tenn****2026`) and team passkeys (`team1@auction`, `team2@auction`, etc.) are pre-populated into React state and bundled directly into client-side JavaScript.
- **Why it is dangerous**: Once bundled and deployed, anyone viewing the public site (or inspecting JavaScript assets in DevTools) will see valid production credentials and can use the "Fill Default" button or source code strings to log into the Admin Control Panel.
- **Safe Recommendation**: Remove all hardcoded default passwords and autofill buttons from frontend source code before production build. Ensure production users must enter unique credentials managed securely on the server.

### 4. Unauthenticated Franchise Data Modification (`PUT /api/teams/:id`)
- **Severity**: CRITICAL
- **File Path**: [`backend/routes/teams.js`](file:///Users/vakapallimukesh/tennis/backend/routes/teams.js#L7)
- **Line Number**: 7
- **Problem**: The route `PUT /api/teams/:id` allows modifying franchise details (such as total purse, purse remaining, and owner name) without requiring authentication (`requireAdmin`).
- **Why it is dangerous**: Any unauthenticated client can send a `PUT` payload to set their team purse to unlimited funds or modify other team properties during the live auction.
- **Safe Recommendation**: Wrap `router.put('/:id', ...)` with `requireAdmin` middleware.

---

## High Risk Issues

### 1. Insecure Global CORS Policy (`origin: '*'`)
- **Severity**: HIGH
- **File Path**: [`backend/server.js`](file:///Users/vakapallimukesh/tennis/backend/server.js#L23-L27) and [`backend/socket/auctionSocket.js`](file:///Users/vakapallimukesh/tennis/backend/socket/auctionSocket.js#L531-L534)
- **Line Number**: server.js (Lines 23-27), auctionSocket.js (Lines 531-534)
- **Problem**: Express and Socket.IO servers allow requests from any origin (`origin: '*'`).
- **Why it is dangerous**: Allows malicious third-party websites visited by an admin to trigger cross-origin API requests or WebSocket operations against the live auction backend.
- **Safe Recommendation**: Restrict allowed CORS origins to specific trusted domain names (e.g. `process.env.CLIENT_URL` or `https://your-domain.com`).

### 2. Password Hashes and Plaintext Passwords Committed to Git & Seed Files
- **Severity**: HIGH
- **File Path**: [`database/seed.sql`](file:///Users/vakapallimukesh/tennis/database/seed.sql#L27-L39) and [`backend/config/db.js`](file:///Users/vakapallimukesh/tennis/backend/config/db.js#L6-L19)
- **Line Number**: seed.sql (Lines 27-39), db.js (Lines 6-19)
- **Problem**: Pre-computed bcrypt hashes along with comments revealing their plaintext passwords (`admin123`, `tennis2026`, `team1@auction`) are checked into the repository and stored in source files.
- **Why it is dangerous**: Anyone with repository access or reading public SQL seed files can obtain default passwords and attempt logins against production instances using default database seeds.
- **Safe Recommendation**: Never commit default production account credentials into seed scripts. Use environment-driven seed scripts or force password resets on initial deployment.

---

## Medium Risk Issues

### 1. Lack of Authentication on WebSockets (`Socket.IO`)
- **Severity**: MEDIUM
- **File Path**: [`backend/socket/auctionSocket.js`](file:///Users/vakapallimukesh/tennis/backend/socket/auctionSocket.js#L537-L574)
- **Line Number**: 537-574
- **Problem**: Socket.IO connection handling (`io.on('connection')`) does not perform JWT authentication handshake. Any client can emit `submit_bid` over WebSockets directly.
- **Why it is dangerous**: While HTTP `/api/auction/bid` validates JWT permissions, socket listeners for `submit_bid` rely on payload data (`team_id`) without verifying the socket client's JWT identity.
- **Safe Recommendation**: Add Socket.IO authentication middleware (`io.use(...)`) to verify JWT tokens passed in socket handshake query parameters or auth headers.

### 2. Default Secrets in Documentation & Commit History
- **Severity**: MEDIUM
- **File Path**: [`README.md`](file:///Users/vakapallimukesh/tennis/README.md#L145-L250), [`backend/.env.example`](file:///Users/vakapallimukesh/tennis/backend/.env.example#L2)
- **Line Number**: README.md (Lines 145-146, 246), .env.example (Line 2)
- **Problem**: `README.md` and `.env.example` explicitly list `tennis_auction_super_secret_jwt_key_2026` and `tennis2026`.
- **Why it is dangerous**: Developers or system administrators might copy these example configurations into production environments without changing the secret keys.
- **Safe Recommendation**: Use dummy placeholder values in documentation (e.g. `JWT_SECRET=change_this_to_a_random_secure_64_character_string`).

---

## Low Risk Issues

### 1. Verbose Internal Error Messages Exposed in API Responses
- **Severity**: LOW
- **File Path**: [`backend/server.js`](file:///Users/vakapallimukesh/tennis/backend/server.js#L73) and [`backend/routes/auth.js`](file:///Users/vakapallimukesh/tennis/backend/routes/auth.js#L82)
- **Line Number**: server.js (Line 73), auth.js (Line 82)
- **Problem**: Express error handlers return `{ error: err.message }` directly to the client.
- **Why it is dangerous**: May leak database column names, internal filesystem structures, or stack details when database queries fail.
- **Safe Recommendation**: Log detailed errors on the server side, but return generic messages (`Internal Server Error`) to the client when in `production` mode.

---

## Exposed Secrets

| File | Line | Secret Type | Masked Value | Risk | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/middleware/auth.js` | 3 | JWT Secret Fallback | `tenn****2026` | CRITICAL | Remove fallback; enforce env var |
| `backend/.env` | 2 | JWT Secret | `tenn****2026` | HIGH | Rotate key for production |
| `backend/.env.example` | 2 | JWT Secret Example | `tenn****2026` | MEDIUM | Replace with dummy string |
| `frontend/src/pages/Admin/AdminLogin.jsx` | 8, 31, 111 | Admin Password Preset | `tenn****2026` | CRITICAL | Remove preset from frontend code |
| `frontend/src/pages/Login/LoginPage.jsx` | 13, 24-57 | Default Passwords Preset | `team****tion` | CRITICAL | Remove presets from frontend code |
| `backend/config/db.js` | 7-11 | Hardcoded Account Hashes | `$2b$****cR/a` | HIGH | Remove hardcoded user hashes |
| `database/seed.sql` | 35-39 | Hardcoded Account Hashes | `$2b$****cR/a` | HIGH | Change default seed credentials |
| `README.md` | 146, 246 | Documented Default Credentials | `tenn****2026` | MEDIUM | Remove default password from docs |

---

## Suspicious Files

| File/Folder | Reason | Safe to Deploy? | Recommended Action |
| :--- | :--- | :--- | :--- |
| `backend/.env` | Local environment variables | **NO** | Keep ignored in `.gitignore`; configure via hosting platform environment settings. |
| `frontend/.env` | Frontend environment configuration | **NO** | Keep ignored; inject via build environment. |
| `database/seed.sql` | Contains default seed data with known password hashes | **NEEDS CAUTION** | Remove default user passwords/hashes before importing to production DB. |
| `backend/node_modules/` | Server dependency binaries | **NO** | Exclude from deployment; install on target server via `npm install --production`. |
| `frontend/node_modules/` | Frontend development node modules | **NO** | Exclude from deployment; build static bundle via `npm run build`. |
| `frontend/dist/` | Generated build output | **YES** | Upload only to web root/CDN. |

---

## Suspicious Code

| File | Line | Code Pattern | Explanation | Severity |
| :--- | :--- | :--- | :--- | :--- |
| `backend/server.js` | 45-54 | `app.post('/api/auction/reset', ...)` | Unauthenticated database/state reset route. | CRITICAL |
| `backend/routes/teams.js` | 7 | `router.put('/:id', teamsController.updateTeam)` | Unauthenticated team modification route. | CRITICAL |
| `frontend/src/pages/Admin/AdminLogin.jsx` | 8 | `useState('tennis2026')` | Hardcoded password in React client component state. | CRITICAL |
| `backend/middleware/auth.js` | 3 | `process.env.JWT_SECRET \|\| '...'` | Fallback JWT secret in code. | CRITICAL |

*Note: No malicious backdoors, webshells, obfuscated payloads, or cryptocurrency miners were found in the codebase.*

---

## Public Exposure Risks

1. **Unprotected State Reset Endpoint**: If `/api/auction/reset` is exposed on the public backend URL, anyone can send an unauthenticated HTTP POST request to reset all live auction data.
2. **Unprotected Team Update Endpoint**: `/api/teams/:id` can be invoked by any client without a JWT token to modify team purse balances or team owners.
3. **Admin Login Credential Exposure**: Client-side JavaScript bundles contain default passwords in plaintext (`admin` / `tennis2026`, `team1@auction`), allowing anyone inspecting browser source code or network payloads to discover admin access credentials.

---

## Git / GitHub Risks

- `.env` files in `backend/` and `frontend/` are correctly added to `.gitignore` and are not currently tracked in Git.
- **Git History Leak**: The default secret string (`tennis_auction_super_secret_jwt_key_2026`) and default passwords (`tennis2026`) were committed in earlier Git commits.
- **Action Required**: Rotate all production secrets (generate brand-new, unique values for production `JWT_SECRET` and database passwords). Do NOT reuse any secrets mentioned in commit history.

---

## Files Safe to Upload

The following core source files and directories are standard production assets and safe to deploy once critical code fixes are made:

- `backend/server.js` (after securing `/api/auction/reset`)
- `backend/controllers/`
- `backend/routes/`
- `backend/middleware/`
- `backend/socket/`
- `backend/config/`
- `backend/package.json` & `package-lock.json`
- `frontend/dist/` (static build generated via `npm run build`)
- `database/schema.sql`

---

## Files NOT to Upload

Do **NOT** upload the following to your public web hosting or web root:

- `backend/.env` & `frontend/.env` (Set via host server environment panel)
- `node_modules/` directories (Install on server via `npm install`)
- `.git/` folder
- `.gitignore` & `.oxlintrc.json`
- Local IDE folders (`.vscode/`, `.idea/`)
- OS metadata files (`.DS_Store`)

---

## Recommended .gitignore

Below is the consolidated `.gitignore` tailored specifically for this project:

```gitignore
# Dependencies
node_modules/
backend/node_modules/
frontend/node_modules/

# Production build output
dist/
frontend/dist/
build/

# Environment and Secret files
.env
.env.local
.env.*.local
*.env
backend/.env
frontend/.env

# Logs and temporary files
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Database dumps / Local SQLite / Backups
*.sql.bak
*.dump
backup/

# System and Editor metadata
.DS_Store
*.DS_Store
.idea/
.vscode/
*.swp
*.swo
```

---

## Pre-Deployment Security Checklist

- [ ] **Secrets removed from source code**: Remove hardcoded fallback strings for `JWT_SECRET` in `backend/middleware/auth.js`.
- [ ] **Exposed credentials rotated**: Generate a random, cryptographically strong `JWT_SECRET` for production and change default admin/team passwords.
- [ ] **Frontend credentials removed**: Remove pre-filled default passwords (`tennis2026`, `team1@auction`) from `AdminLogin.jsx` and `LoginPage.jsx`.
- [ ] **`.env` protected**: Ensure `.env` is never committed to Git and environment variables are set directly in host configuration.
- [ ] **Endpoints authenticated**: Add `requireAdmin` middleware to `POST /api/auction/reset` and `PUT /api/teams/:id`.
- [ ] **Socket.IO authenticated**: Implement JWT handshake verification on Socket.IO connections.
- [ ] **CORS policy restricted**: Change `origin: '*'` in `backend/server.js` and `auctionSocket.js` to your exact production frontend URL.
- [ ] **Database credentials secured**: Set strong `DB_PASSWORD` and non-root `DB_USER` in host environment variables.
- [ ] **Error display disabled in production**: Ensure `NODE_ENV=production` so stack traces and internal errors are suppressed in client responses.
- [ ] **`.git` directory omitted from web root**: Confirm `.git` is not placed inside the web root.

---

## Final Important Actions

BEFORE deploying your website publicly, perform these critical steps:

1. **Protect Unauthenticated Endpoints**: Update `backend/routes/teams.js` and `backend/server.js` to wrap `/api/teams/:id` and `/api/auction/reset` with admin authentication middleware.
2. **Clean Frontend Code**: Strip out default password presets (`useState('tennis2026')`) and demo autofill buttons from `AdminLogin.jsx` and `LoginPage.jsx`.
3. **Enforce Environment-Driven JWT Secret**: Remove the hardcoded fallback secret in `backend/middleware/auth.js` so server startup fails if `JWT_SECRET` is missing.
4. **Set Production Environment Variables**: On your hosting server (Render, Railway, Vercel, VPS), configure unique values for `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`, and database credentials.
5. **Restrict CORS**: Replace `origin: '*'` with your official production frontend domain name.
