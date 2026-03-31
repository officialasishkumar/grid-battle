# Grid Battle

Real-time multiplayer strategy game built with a server-authoritative architecture using **Nakama** as the game server and **React** for the frontend.

## Architecture

```
grid-battle/
├── frontend/          # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/   # UI components (game board, player cards, timer)
│   │   ├── pages/        # Login, Lobby, Game, Leaderboard
│   │   ├── store/        # Zustand state management
│   │   ├── services/     # Nakama client service
│   │   └── types/        # Shared type definitions
│   └── ...
├── backend/           # Nakama TypeScript runtime modules
│   ├── src/
│   │   ├── main.ts          # Module entry point
│   │   ├── match_handler.ts # Server-authoritative game logic
│   │   ├── rpc.ts           # RPC endpoints
│   │   └── types.ts         # Shared types
│   └── ...
└── docker-compose.yml # Nakama + PostgreSQL infrastructure
```

### Design Decisions

- **Server-authoritative**: All game logic (move validation, win detection, turn management, timers) runs on the Nakama server. Clients send intents; the server validates and broadcasts state.
- **WebSocket real-time**: Match data flows over persistent WebSocket connections for sub-100ms latency.
- **Zustand state management**: Lightweight, minimal boilerplate compared to Redux. Single source of truth for game state synchronized via server messages.
- **Tailwind CSS**: Utility-first styling with custom theme for consistent dark gaming aesthetic.
- **TypeScript end-to-end**: Shared type definitions between frontend and backend for type safety across the stack.

### Security

- Server validates every move (position bounds, turn order, cell occupancy, game phase)
- No game state is trusted from the client
- Session tokens with expiry, stored in localStorage
- Nakama handles authentication, rate limiting, and connection management

## Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** >= 18
- **npm** >= 9

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Build the backend module

```bash
cd backend && npm run build
```

This bundles the TypeScript into `backend/build/index.js` which Nakama loads at startup.

### 3. Start the infrastructure

```bash
# From the project root
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port 5432
- **Nakama server** on ports 7350 (HTTP API), 7349 (gRPC), 7351 (Admin Console)

### 4. Start the frontend

```bash
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Access the Nakama Console

Open [http://localhost:7351](http://localhost:7351) and log in with:
- Username: `admin`
- Password: `admin123`

## Testing Multiplayer

1. Open two browser tabs (or use incognito for the second)
2. Sign up or play as guest in each tab
3. Click **Find Match** in both tabs — they'll be matched together
4. Play the game! Moves are validated server-side and synced in real-time

## Game Modes

| Mode | Description |
|------|-------------|
| **Classic** | No time limit. Take your time to strategize. |
| **Timed** | 30 seconds per move. If time runs out, you forfeit. |

## Features

- **Server-authoritative game engine** — all validation server-side, no cheating possible
- **Real-time matchmaking** — automatic pairing or manual room joining
- **Multiple concurrent games** — each match runs in its own isolated server instance
- **Leaderboard** — global rankings based on wins, losses, and streaks
- **Player statistics** — win rate, current streak, best streak, total games
- **Timer mode** — 30-second turn timer with visual countdown
- **Responsive UI** — works on desktop and mobile
- **Animated game board** — SVG marks with spring animations
- **Glass morphism design** — modern dark theme with neon accents

## API / Server Configuration

### Nakama RPCs

| RPC | Payload | Response |
|-----|---------|----------|
| `find_match` | `{ "gameMode": "classic" \| "timed" }` | `{ "matchId": "...", "created": true }` |
| `get_stats` | `{ "userId": "..." }` (optional) | `PlayerStats` object |
| `list_matches` | — | Array of active match summaries |

### Match OpCodes

| Code | Direction | Purpose |
|------|-----------|---------|
| 1 | Client → Server | Make a move (`{ "position": 0-8 }`) |
| 2 | Server → Client | State update (board, turn, phase) |
| 3 | Server → Client | Game over (winner, winning cells) |
| 4 | Server → Client | Move rejected (reason) |
| 5 | Server → Client | Opponent joined |
| 6 | Server → Client | Opponent left |
| 7 | Server → Client | Timer update (remaining ms) |

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_NAKAMA_HOST=127.0.0.1
VITE_NAKAMA_PORT=7350
VITE_NAKAMA_KEY=defaultkey
VITE_NAKAMA_SSL=false
```

## Deployment

### Backend (Nakama)

1. Build the backend: `cd backend && npm run build`
2. Deploy Nakama with the `docker-compose.yml` to your cloud provider
3. Update the database credentials and console password for production
4. Mount `backend/build/` to `/nakama/data/modules` in the Nakama container

### Frontend

1. Set production environment variables pointing to your Nakama server
2. Build: `cd frontend && npm run build`
3. Deploy the `frontend/dist/` directory to any static hosting (Vercel, Netlify, S3, etc.)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Game Server | Nakama 3.24 |
| Database | PostgreSQL 16 |
| Frontend | React 19, TypeScript 5, Vite |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Animations | Framer Motion |
| Real-time | Nakama JS SDK (WebSocket) |
