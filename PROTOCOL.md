# Urja Meter Ops protocol notes

This document describes the upstream portal and how this project talks to it. The local application has its own login and API flow; see [README.md](./README.md) for how to run both apps.

## Upstream portal

Base URL: `https://urja-ops.flockenergy.tech`

The portal is a SvelteKit app. Meter pages load data from JSON endpoints under `/portal/...`, rather than embedding the full meter data in the page HTML.

The observations below came from read-only browsing and requests to the portal.

## Upstream login

The portal accepts:

- `POST /login`
- Form body: `email` and `password`
- Headers: `Origin` set to the portal base URL, `x-sveltekit-action: true`, and `Accept: application/json`

A successful login responds with a redirect result and a session cookie in `Set-Cookie`. The cookie must be sent on subsequent portal requests. It is HttpOnly and Secure, so browser JavaScript cannot read it.

When tested, a JSON body was rejected with `415 Unsupported Media Type`, and a form request without the expected `Origin` was rejected. The API's server-side client uses the form format and headers.

The portal's session lifetime was not measured precisely. A request without a valid session returned `401`.

## Upstream read endpoints

These endpoints require the portal session cookie:

| Endpoint | Observed response |
|---|---|
| `GET /portal/meters/search?q=&page=1` | Meter search results, 20 items per page |
| `GET /portal/meters/{id}/geo` | Latitude and longitude for one meter |
| `GET /portal/meters/{id}/energy` | Consumption readings for one meter |
| `GET /portal/dts?page=1` | Distribution transformer list, 20 items per page |
| `GET /portal/keys` | Signing secret used by the portal's export flow |
| `GET /portal/export?page=1` | Export data requiring signed headers |

The local backend currently uses the search, geo, and energy endpoints. It does not expose transformer listing or the signed export.

## Response formats and observations

Meter search returns fields such as `meterId`, `serialNo`, `make`, `phaseType`, `installStatus`, and `dtCode`. A response also includes `data`, `total`, `page`, and `pageSize`.

Geo values and energy values are numeric strings. Energy timestamps use `DD/MM/YYYY HH:mm` and do not include a timezone. The local API converts the numeric fields to numbers and formats timestamps as `YYYY-MM-DDTHH:mm:ss` without adding a timezone.

The energy field `kwh` appears to be a cumulative meter reading, rather than usage for that half-hour. Calculate interval usage by subtracting adjacent readings if that is needed.

Other observed behavior:

- Page size was 20. The initial dataset had 403 meters, or 21 pages.
- A page beyond the final page returned an empty `data` array.
- Search matched meter IDs and serial numbers, including lowercase input.
- The `J100000` meter had 337 half-hour readings in the sample inspected.
- Export records included more fields, such as installation type, hierarchy, and geo coordinates.
- The export flow retrieved a signing secret from `/portal/keys`, then sent a timestamp and HMAC-SHA-256 signature to `/portal/export`. The exact signed message was not established, so this project does not implement that flow.

These are observations from the portal at the time they were tested, not a guarantee that the upstream service will always behave the same way.
