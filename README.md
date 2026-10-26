# Meter dashboard

A small React dashboard and Express API for searching meters and viewing their location and consumption readings from the Urja Meter Ops portal.

## How the app works

```text
Browser -> React frontend (port 5173) -> Express API (port 3000) -> Urja Meter Ops portal
```

The frontend asks for a portal email and password. The backend checks them with the portal, keeps the upstream session server-side, and sends the browser an HttpOnly session cookie. Meter endpoints require that local session.

## Requirements

- Node.js 20.12 or newer (the backend loads `.env` using Node's `process.loadEnvFile`).
- The portal account details you are authorized to use.

## Setup

Install the dependencies for each app:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

Create environment files from the examples if they do not exist. For deployment, replace the example domains with your actual service URLs:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

The backend environment configures the API port, upstream portal URL, and allowed frontend origins. The frontend environment configures its server port and, for deployment, the API URL included in the frontend build. Locally, a blank `API_URL` makes the frontend use the browser's current host and `API_PORT`. These `.env` files are ignored by Git; never commit them.

## Run locally

Start the API in one terminal:

```powershell
cd backend
npm start
```

Start the frontend in another terminal:

```powershell
cd frontend
npm run dev
```

Open the frontend URL configured for your deployment. Locally, the blank `API_URL` uses the frontend's current hostname and `API_PORT`; the backend allows the standard local frontend origins in development. Stop each server with `Ctrl+C` in its terminal.

## Features

- Log in with the upstream portal account.
- Search meters and fetch all result pages; the dashboard displays 20 meters at a time.
- View meter installation details and location.
- View the selected meter's consumption readings.
- Log out and invalidate the current local session.

## API routes

All meter routes require a valid session cookie.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Check the submitted portal email and password and create a local session |
| `GET` | `/auth/session` | Check whether the browser has a valid local session |
| `POST` | `/auth/logout` | Remove the local session |
| `GET` | `/meters?q=&page=1` | Search or list one page of meters |
| `GET` | `/meters/{id}` | Get one meter with its location |
| `GET` | `/meters/{id}/consumption` | Get the meter's readings |

The API converts energy readings to numbers and formats their timestamps as ISO-like strings without a timezone, because the source portal does not provide timezone information.

## Project files

### Backend

- `backend/server.mjs`: Express routes, CORS, local sessions, and meter API.
- `backend/portal.mjs`: upstream portal login and requests.
- `backend/package.json`: backend dependencies and start command.
- `backend/.env.example`: example backend configuration.

### Frontend

- `frontend/src/main.jsx`: starts React.
- `frontend/src/App.jsx`: checks the session and shows login or dashboard.
- `frontend/src/Login.jsx`: login form.
- `frontend/src/Dashboard.jsx`: loads meter pages and handles dashboard state.
- `frontend/src/MeterList.jsx`: search, meter results, and page controls.
- `frontend/src/MeterDetails.jsx`: selected meter details and readings.
- `frontend/src/api.js`: API requests, including the session cookie.
- `frontend/styles.css`: dashboard and login styles.
- `frontend/build.mjs`: creates the React bundle with esbuild.
- `frontend/server.mjs`: serves the built frontend.
- `frontend/package.json`: frontend dependencies and commands.
- `frontend/.env.example`: example frontend configuration.

For an expanded explanation, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md). For upstream endpoint observations, see [PROTOCOL.md](./PROTOCOL.md). For lessons and future improvements, see [REFLECTION.md](./REFLECTION.md).

## Before deploying

- Add the real backend and frontend environment values in the hosting platform's settings. Do not publish local `.env` files.
- Set the frontend `API_URL` to the deployed API URL and rebuild the frontend.
- Set the backend `FRONTEND_URLS` to the deployed frontend origin.
- Set `PORT` to the port expected by the hosting platform and `BASE_URL` to the upstream portal URL.
- Deploy behind HTTPS. If frontend and API use different sites, configure cookies for cross-site HTTPS use; the local `SameSite=Lax` cookie settings are intended for local development.
- Backend sessions are stored in memory. Restarting the API logs users out, and multiple API instances need shared session storage.
- The current frontend server is a simple static-file server intended for local use. Use the hosting platform's static site service or a production web server for deployment.

For upstream behavior and data caveats, see [PROTOCOL.md](./PROTOCOL.md).
