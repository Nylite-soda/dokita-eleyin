# Dokita Eleyin

Next.js website with first-party CMS, booking, inbox, newsletter, and admin tools. Prisma ORM 7.10 connects the app to Prisma Postgres. Runtime queries use the pooled URL; Prisma CLI migrations use the direct URL.

## Local setup

1. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL` (pooled Prisma Postgres URL), and `DIRECT_URL` (direct Prisma Postgres URL).
2. Install dependencies and apply migrations:

   ```bash
   npm install
   npm run prisma:deploy
   npm run prisma:generate
   ```

3. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12–128 characters), and optional `ADMIN_NAME`, then run:

   ```bash
   npm run admin:create
   npm run dev
   ```

The public site runs at `http://localhost:3000`; the admin workspace is at `/admin/login`. Remove the bootstrap password from the environment after creating the account. To recover an existing account using trusted server access, use `npm run admin:create -- --reset`; this resets its password, elevates it to admin, and revokes its sessions.

## Existing local SQLite data

The original `data/site.sqlite` and `data/media` remain as a local rollback copy. To import a different legacy SQLite database into an already-migrated, empty Prisma Postgres database, set `LEGACY_SQLITE_PATH` if needed, then run:

```bash
npm run data:import-sqlite -- --confirm-import
```

The importer copies application rows in foreign-key order, stores image bytes with their media records, skips conflicting rows, reports counts only, and leaves the SQLite source unchanged. The current Prisma database has already received this workspace’s six CMS documents, booking configuration, and one image; do not rerun the import against it.

The separate `prisma/schema.sqlite.prisma` and `prisma/migrations-sqlite` exist only for isolated tests and legacy local data. `npm test` uses disposable SQLite databases and never connects to the saved Prisma URLs.

## Content and backups

The one-time Sanity importer can still export content from an old Sanity project. Set its legacy project/dataset values and optional read token in `.env.local`, review the export with `npm run content:import -- --dry-run`, then run `npm run content:import` to import it into Prisma Postgres.

The `scripts/backup.mjs` utility backs up only the legacy SQLite source and its local media directory. Use Prisma Console’s database backup tools for the active PostgreSQL database. Keep backups containing client or staff information in restricted storage.

## Deployment

In Vercel, set `DATABASE_URL` and `DIRECT_URL` as server-only environment variables, along with the site URL and any payment/email secrets. Apply pending migrations with `npm run prisma:deploy` before deploying code that depends on them. CMS image bytes are stored in PostgreSQL, so they persist across Vercel function instances and deployments.

Booking services, hours, blackouts, content, users, messages, and subscribers are managed in `/admin`. ZeptoMail handles transactional messages. Newsletter signups are stored in PostgreSQL and the admin workspace can export the consented mailing list as CSV; newsletter campaigns are not sent by ZeptoMail. Set `ZEPTOMAIL_API_KEY` and `ZEPTOMAIL_FROM_EMAIL` in the server environment. Form submissions, subscribers, and booking notifications are saved to PostgreSQL before email delivery is attempted.
