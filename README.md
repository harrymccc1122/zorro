# Counter-Strike 2 Inventory Viewer

A small full-stack project (Express + React) that fetches and displays a Steam user's Counter-Strike 2 inventory. The server proxies requests to the Steam Community inventory API to work around browser CORS restrictions, while the client renders a responsive grid with filtering.

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```
   This uses npm workspaces to install dependencies for both the server and client.

2. **Start the development servers**
   ```bash
   npm run dev
   ```
   This runs both the Express server (http://localhost:5174) and the Vite dev server (http://localhost:5173) via `concurrently`.

3. **Open the app**
   Visit [http://localhost:5173](http://localhost:5173) and enter a public 17-digit SteamID64. An example ID you can try is `76561197960435530`.

## Environment variables

- `/server/.env`
  ```env
  PORT=5174
  STEAM_INVENTORY_BASE=https://steamcommunity.com/inventory
  ```
  Optionally set `STEAM_PROXY_URL` here to override the upstream Steam base URL.

- `/client/.env`
  ```env
  VITE_API_URL=http://localhost:5174
  ```

## Why an Express proxy?

The Steam inventory endpoint disallows cross-origin browser requests. The Express server proxies requests to the Steam Community inventory API and returns JSON that the React client can consume without CORS issues.

## Scripts

- `npm run dev` – Runs the client and server together in development mode.
- `npm run install:all` – Installs dependencies inside the `server` and `client` folders if you prefer managing them separately.

## Project structure

```
.
├── client/        # Vite + React app
├── server/        # Express proxy
├── package.json   # root scripts + workspaces
└── README.md
```

## Notes

- Inventories must be public for the Steam API to return items.
- Responses are cached on the server per Steam ID for 60 seconds to reduce upstream requests.
- Filters are applied client-side for instant interactions.
