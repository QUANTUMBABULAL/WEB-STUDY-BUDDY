# Deployment Guide

This document summarizes the production configuration for the MERN + Socket.io stack in this repo. Follow the sections below for environment variables, build commands, hosting on Render/Vercel/Netlify, and running everything on a single VPS with NGINX + PM2.

## 1. Environment Variables

### Backend (`backend/.env` based on `.env.example`)
| Key | Description |
| --- | --- |
| `NODE_ENV` | `production` when serving real traffic. |
| `PORT` | Port that Express/Socket.io listens on (default `5000`). |
| `MONGO_URI` | Connection string for MongoDB Atlas/Replica. |
| `JWT_SECRET` | Strong secret used for signing tokens. |
| `FRONTEND_URL` | Public URL that serves the Vite app (e.g. `https://app.example.com`). |
| `DEV_FRONTEND_URL` | Local dev origin (`http://localhost:5174`). |
| `ADDITIONAL_CORS_ORIGINS` | Comma separated list for admin/staging dashboards. |
| `TRUST_PROXY` | `1` when running behind NGINX/Render so Express respects `X-Forwarded-*`.

### Frontend (`frontend/.env` or `.env.production`)
| Key | Description |
| --- | --- |
| `VITE_API_URL` | HTTPS origin of the backend (`https://api.example.com`). |
| `VITE_SOCKET_URL` | Usually the same as `VITE_API_URL`; override if sockets live elsewhere. |
| `VITE_APP_BASE` | Base path for Vite router (default `/`). |
| `VITE_DEV_PORT` | Local dev server port (default `5174`). |
| `VITE_PREVIEW_PORT` | Local preview port (default `4173`). |

Copy each `.env.example` into a real `.env` file per environment and update the values accordingly.

## 2. Build & Start Commands

### Development
```
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

### Production (single service)
```
cd frontend
npm install
npm run build

cd ../backend
npm install --omit=dev
NODE_ENV=production PORT=5000 FRONTEND_URL="https://app.example.com" npm start
```
Express will automatically serve the static files from `frontend/dist` when `NODE_ENV=production` and the build output is present.

## 3. Socket.io CORS

`srv/server.js` reads `FRONTEND_URL`, `DEV_FRONTEND_URL`, and `ADDITIONAL_CORS_ORIGINS` to allow WebSocket upgrades. Always keep those env variables aligned with the domains hosting your React app (Render/Netlify/Vercel/custom). When hosting both frontend and backend under the same domain, set `FRONTEND_URL=https://app.example.com` and Socket.io will reuse that origin.

## 4. Deploying on a VPS (NGINX + PM2)
1. Copy `backend/.env.example` → `.env` and update real values.
2. Build the frontend (`npm run build` in `frontend`) and ensure `frontend/dist` is copied to the server.
3. Install backend dependencies and start via PM2:
   ```
   cd /var/www/web-2.0/backend
   npm install --omit=dev
   pm2 start ecosystem.config.js --env production
   pm2 save && pm2 startup
   ```
4. Place `deploy/nginx.conf` in `/etc/nginx/sites-available/web20.conf`, adjust domains/paths, then enable it:
   ```
   sudo ln -s /etc/nginx/sites-available/web20.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. (Optional) Enable HTTPS via Certbot and uncomment the TLS directives inside the config.

## 5. Render Deployment
- **Service type:** Web Service
- **Build Command:**
  ```
  npm install --prefix frontend && npm run build --prefix frontend && npm install --prefix backend
  ```
- **Start Command:**
  ```
  cd backend && npm start
  ```
- **Environment:** set variables from backend `.env.example`. Render automatically exposes `PORT`; no change required.
- **Static assets:** Because Express serves `frontend/dist`, no separate Static Site service is required. Commit the `dist` folder or build it during deploy (preferred).

## 6. Netlify or Vercel Deployment (Frontend-only)
1. Deploy the backend elsewhere (Render/Heroku/VPS) and note its public URL.
2. In Netlify/Vercel project settings, set `VITE_API_URL` and `VITE_SOCKET_URL` to the backend URL.
3. Build command: `npm run build` (working directory `frontend`).
4. Publish directory: `frontend/dist`.
5. Ensure backend CORS env (`FRONTEND_URL`, `ADDITIONAL_CORS_ORIGINS`) includes the Netlify/Vercel domain.

## 7. Serving Frontend with Backend
This repo is already wired for single-service deployments:
- Run `npm run build` in `frontend`.
- Start the backend with `NODE_ENV=production`. `src/server.js` automatically calls `express.static(frontend/dist)` and serves `index.html` for non-API routes.
- CORS + Socket.io origins are inferred from `FRONTEND_URL`, so hostnames stay consistent.

## 8. Additional Notes
- The PM2 config (`backend/ecosystem.config.js`) uses cluster mode with `instances="max"`. Adjust memory limits per server size.
- `deploy/nginx.conf` includes WebSocket upgrades for `/socket.io/` and proxies `/api/*` to the Node process.
- React Router future flags (`v7_relativeSplatPath`) are already enabled via `main.jsx`.
- Keep secrets out of the repo; `.env.example` exists solely as a template.
