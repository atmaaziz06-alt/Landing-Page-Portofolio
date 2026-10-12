# Portfolio CMS

This application uses React 19, Vite, React Router, an Express API, and SQLite in local development.

## Local development

Use Node.js 22.13 or newer so the built-in `node:sqlite` database is available.
Configure `JWT_SECRET` and `ADMIN_DEFAULT_PASSWORD` in `.env` before starting the server.
Use a unique, randomly generated JWT secret (at least 32 bytes) and a strong admin password.
`ADMIN_DEFAULT_PASSWORD` is only used when initializing an empty database.

```sh
npm install
npm run dev
```

The Express API runs alongside Vite. CMS records are stored in `server/portfolio.db`;
`localStorage` is only an optional browser cache and is not the source of truth. Public API reads
bypass browser caching.

## Vercel persistence (Supabase Postgres)

Vercel uses Supabase Postgres for all CMS entities and activity logs.
The server calls Supabase's PostgREST RPC endpoint with the service-role key; it does not use a
per-instance SQLite file or in-memory write fallback. When database configuration or the schema is
unavailable, CMS API requests and the health endpoint return `503` instead of accepting volatile
writes.

1. Apply `supabase/migrations/20261011000000_cms_persistence.sql` to the Supabase project using
   the Supabase SQL Editor (or your normal migration workflow), then apply
   `supabase/migrations/20261012000000_supabase_upload_storage.sql` to create the public upload bucket,
   `supabase/migrations/20261012001000_allow_video_uploads.sql` to allow MP4/WebM uploads, and
   `supabase/migrations/20261013000000_remove_content_history.sql` to remove the obsolete history
   table and RPC functions.
2. In Vercel project settings, set `SUPABASE_URL` to the project's API URL and
   `SUPABASE_SERVICE_ROLE_KEY` to its service-role key. Keep that key server-side; do not use it
   as a `VITE_*` variable or expose it to the browser. Also set a unique `JWT_SECRET` and a strong
   `ADMIN_DEFAULT_PASSWORD` for first-time admin seeding; never reuse the local `.env` values.
3. Deploy/redeploy the Vercel application. On first initialization the app seeds empty CMS tables
   with the repository's initial portfolio content and admin account settings.
4. Verify the deployment at `/api/health`. A `503` response includes the initialization error;
   for DNS failures, Vercel function logs report the configured hostname and DNS error code without
   exposing the service-role key.

Local development continues to use `server/portfolio.db` with Node.js 22.13 or newer.

### Uploaded files

Local development stores uploads under `public/uploads`. Vercel uploads use the `portfolio-uploads`
Supabase Storage bucket and return durable public URLs. Apply the storage migration above before
uploading files to a Vercel deployment. Apply the video upload migration as well before uploading
MP4 or WebM files. Previously uploaded files whose URLs start with `/uploads/` were stored on
Vercel's temporary filesystem and may need to be uploaded again.

## Verification

```sh
npm run lint
npm run build
```
