# Ironline — Gym Management Frontend

A React (Vite) frontend built directly against your `gym-management` backend
(`backend/src/app.js`, mounted under `/api/v1`).

## Stack
- React 18 + React Router 6
- Tailwind CSS (custom "Ironline" theme — see `tailwind.config.js`)
- Axios for API calls, with a bearer-token interceptor
- JWT decoded client-side (`jwt-decode`) to drive role-based UI — no separate
  "who am I" call is required for `SUPER_ADMIN`, since `/auth/me` on the
  backend is gated to `ADMIN` only.

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your running backend
npm run dev                # http://localhost:5173
```

Make sure your backend is running (default `http://localhost:5001`) and that
`cors()` is enabled there — it already is in `backend/src/app.js`.

## How the roles map to screens

The backend has two roles with usable endpoints today: `SUPER_ADMIN` and
`ADMIN`. Other roles (`MANAGER`, `TRAINER`, `RECEPTIONIST`, `ACCOUNTANT`) can
log in but currently have no routes exposed to them on the API — the
dashboard shows them a clear "not yet available" state instead of a broken
screen.

- **SUPER_ADMIN** → `/app/tenants`: create gyms (tenants) and, per gym,
  create its first `ADMIN` user directly from the tenant card. There's no
  "list all tenants" endpoint on the backend, so created tenants are kept in
  `localStorage` on the device that created them, with a copyable ID.
- **ADMIN** → full gym console: `My Gym` (tenant profile, read-only — there's
  no update-tenant endpoint), `Branches`, `Staff`, `Members` (with a detail
  page showing membership history, enroll/freeze/deactivate actions),
  `Membership Plans`, and a cross-member `Memberships` ledger.

## Project structure

```
src/
  lib/api.js            All backend endpoint calls, one function per route
  lib/usePageMeta.js     Small hook pages use to set the topbar title
  context/AuthContext.jsx  Token storage, JWT decode, login/register/logout
  components/layout/     Sidebar, Topbar, AppLayout, AuthShell
  components/ui/         Button, Field (Input/Select/Textarea), Modal,
                          ConfirmDialog, Table, Toast, Badge/EmptyState/StatCard
  pages/                 One file per screen, matching the routes in App.jsx
```

## Notes on backend quirks the UI works around
- `POST /auth/register` always creates a user with role `ADMIN` and no
  tenant — that's the account a gym owner registers with before either a
  `SUPER_ADMIN` links them to a tenant, or they're issued one directly.
- `PUT /members/:id` and `PATCH /branches/:id` differ in HTTP verb from the
  rest of the API (most updates are `PATCH`) — `lib/api.js` already matches
  each route exactly as defined in `member.routes.js` / `branch.route.js`.
- Deleting a branch, member, staff user, or plan is a soft-delete on the
  backend (status flips to inactive) — the UI's delete confirmation reflects
  that language rather than implying permanent removal.
