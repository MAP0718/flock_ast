# Project reflection

## What assumptions did I make?

- I treated the meter portal as read-only. The API only reads meter, location, and consumption data.
- I used the upstream portal login for the dashboard login rather than creating a separate account system. The backend checks the submitted credentials with the portal.
- I did not guess a timezone for readings. The portal timestamps have no timezone, so the API does not add one.
- `kwh` looks like a running total, not usage for a single interval. The dashboard displays the value provided by the API without calculating interval usage.
- The first page response provides the total page count, so the dashboard uses it to fetch the remaining meters.

## What was difficult?

The upstream login was the part that needed the most investigation. The portal expects a form-encoded request with an `email` field and an `Origin` header; sending JSON did not work. Inspecting the request and response clarified that the server needs to retain the session cookie for later portal requests.

Connecting the React frontend to the API also required treating the apps as separate servers: the frontend runs on port 5173 and the API on port 3000. The API must allow the frontend origin and browser requests must include the session cookie.

## What did I learn?

- A page can render its data from JSON requests even when its initial HTML contains no useful records.
- HTTP status codes and response headers help identify whether a login failure is caused by the body format, request origin, or session.
- Cookies marked HttpOnly should stay on the server/browser cookie path rather than being read by frontend JavaScript.
- Keeping the React login, dashboard, meter list, and meter details in separate files makes each part easier to understand.
- API and frontend configuration belong in environment files, while example files can document settings without containing private values.

## What would I improve next?

1. Add automated backend tests for login, session expiry, logout, and meter endpoint authorization.
2. Store sessions in a shared, persistent session store for a production deployment instead of an in-memory map.
3. Configure secure cross-site cookies and CSRF protections if the production frontend and API are hosted on different sites.
4. Add request timeouts and more specific handling for upstream network errors.
5. Add a short-lived cache if portal requests become slow or rate-limited.
6. Implement the signed export only after verifying the exact message the portal expects to be signed.
7. Add charts or interval usage, clearly separating calculated usage from the portal's cumulative `kwh` readings.

## What are the current limitations?

- The session store is in memory and is cleared when the backend process restarts.
- The local server and cookie configuration are for development; production hosting needs deployment-specific configuration.
- The upstream portal controls the login and data availability. A portal outage prevents new logins and data requests.
- Reading timestamps do not include a timezone.
- The signed export, transformer list, and network hierarchy are not exposed by this app.
- The project does not yet have an automated test suite.
