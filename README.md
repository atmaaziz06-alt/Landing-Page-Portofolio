# Portfolio CMS

This application uses React 19, Vite, React Router, an Express API, and SQLite in local development.

## Local development

Use Node.js 22.13 or newer so the built-in `node:sqlite` database is available.

```sh
npm install
npm run dev
```

The Express API runs alongside Vite. CMS records and content-version history are stored in
`server/portfolio.db`; `localStorage` is only an optional browser cache and is not the source of
truth. Public API reads bypass browser caching. Admin history is stored server-side, and restoring
a version writes that snapshot back to the CMS tables and appends a new history entry.

## Vercel persistence (Supabase Postgres)

Vercel uses Supabase Postgres for all CMS entities, activity logs, and content-history versions.
The server calls Supabase's PostgREST RPC endpoint with the service-role key; it does not use a
per-instance SQLite file or in-memory write fallback. When database configuration or the schema is
unavailable, CMS API requests and the health endpoint return `503` instead of accepting volatile
writes.

1. Apply `supabase/migrations/20261011000000_cms_persistence.sql` to the Supabase project using
   the Supabase SQL Editor (or your normal migration workflow).
2. In Vercel project settings, set `SUPABASE_URL` to the project's API URL and
   `SUPABASE_SERVICE_ROLE_KEY` to its service-role key. Keep that key server-side; do not use it
   as a `VITE_*` variable or expose it to the browser.
3. Deploy/redeploy the Vercel application. On first initialization the app seeds empty CMS tables
   with the repository's initial portfolio content and admin account settings.

Local development continues to use `server/portfolio.db` with Node.js 22.13 or newer.

### Upload storage limitation

Uploaded files are still written to `/tmp/uploads` on Vercel. That filesystem is ephemeral, so
upload files can disappear between function instances or deployments even though the CMS database
is durable. Configure an object-storage provider and update the upload route before relying on
persistent user-uploaded files; this change does not solve upload persistence.

## Verification

```sh
npm run lint
npm run build
```
