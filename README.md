# Van Cortlandt Park Bench Adoption

A take-home project for CSS: a system for Van Cortlandt Park to track which
of its 500+ benches are adopted, by whom, and for how long, and to let
someone adopt an available bench.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no database
configured, this uses a local SQLite file (`data/bench-adoption.db`) —
nothing else to set up.

## Persistent storage (Postgres)

By default this app falls back to SQLite, which is fine locally but is
**not durable on Vercel** (serverless functions get a fresh, empty `/tmp`
on every cold start, so adoptions "disappear"). To make adoptions actually
persist in production:

1. In your Vercel project, go to **Storage → Create Database → Postgres**
   (Neon-backed, free tier) and connect it to the project. Vercel will
   automatically add a `POSTGRES_URL` (or `DATABASE_URL`) environment
   variable to the project — no code changes needed.
2. Redeploy. On first request, the app detects `POSTGRES_URL`, creates the
   `benches`/`adoptions` tables if they don't exist, and seeds the same
   500-bench dataset once. From then on, adoptions are written to Postgres
   and survive reloads, redeploys, and cold starts.
3. (Optional, for local testing against the real database) run
   `vercel env pull .env.local` in this project to pull the same
   `POSTGRES_URL` down locally, then `npm run dev` will use Postgres
   instead of SQLite.

The two backends share one interface (`src/lib/store.ts`), so
`src/lib/benches.ts` doesn't know or care which one is active.

## Design notes

- **Data model**: `benches` (id, code, section) and `adoptions` (bench_id,
  donor_name, message, start_date, duration_months). A bench's status is
  derived, not stored: it's "adopted" if it has an adoption row whose
  `start_date + duration_months` is still in the future. This means an
  expired adoption automatically frees the bench up again with no cron job
  or cleanup step needed.
- **Conflict prevention**: adopting a bench that already has an active
  adoption is rejected server-side (`adoptBench` in `src/lib/benches.ts`),
  so there's no way to double-book a bench through the UI or the server
  action directly.
- **Seed data**: 500 benches are generated across 10 synthetic park
  sections (no real bench inventory was provided), with roughly a third
  pre-seeded with adoptions — some active, some already expired — so the
  "available again" behavior has real data to demonstrate on first run.
  The generator (`src/lib/seed-data.ts`) is deterministic and shared by
  both storage backends, so they produce an identical starting dataset.
- **Assumptions**: no payment collection (per the brief); one active
  adoption per bench; donor identity is a free-text name/dedication with no
  login, matching the brief's low-friction "let people adopt a bench"
  goal; adoption length is entered in months or years and stored as
  months. No waitlist for already-adopted benches — kept out of scope to
  match what the brief actually asked for (view + adopt), though it would
  be a natural next feature.

## Stack

Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind
CSS. Storage is SQLite (`better-sqlite3`) locally by default, or Postgres
(`pg`) in production once connected — see above.
