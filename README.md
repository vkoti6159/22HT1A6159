# URL Shortener Microservice + React UI (Material UI)

## Requirements satisfied
- Single microservice with endpoints:
  - `POST /shorturls` — create (default validity 30 minutes, custom shortcode supported, uniqueness enforced)
  - `GET /shorturls/:code` — statistics (clicks with timestamp/referrer/coarse location, plus original URL, creation and expiry)
  - `GET /:code` — redirection with 302 and click recording; returns `410` JSON if expired
  - `GET /shorturls` — list all short URLs for statistics page
  - `POST /client-telemetry` — optional endpoint so frontend can emit events (logged by middleware)
  - `GET /health` — healthcheck
- Mandatory logging via `middleware/campusLogger.js` (no console / no built-in loggers)
- React frontend at `http://localhost:3000` (Vite) using **Material UI** only
- Client-side validation; shorten up to 5 URLs concurrently
- Clean UI prioritizing key info

## How to run
### Backend
```bash
cd backend
npm install
# Optional: edit .env (PORT=8080 etc.)
npm run start
# server at http://localhost:8080
```
### Frontend
```bash
cd frontend
npm install
npm run dev
# app at http://localhost:3000
```

## Notes
- SQLite file `data.sqlite` will be created next to backend by default.
- All requests and responses are logged by the custom middleware to `logs/YYYY-MM-DD.log`.
- For coarse geolocation, middleware records `cf-ipcountry` / `x-vercel-ip-country` if present; otherwise 'unknown'.
- CORS is restricted to the required frontend origin.
