# Van Cortlandt Park Bench Adoption

A take-home project for CSS: a system for Van Cortlandt Park to track which
of its 500+ benches are adopted, by whom, and for how long, and to let
someone adopt an available bench.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
- **Assumptions**: no payment collection (per the brief); one active
  adoption per bench; donor identity is a free-text name/dedication with no
  login, matching the brief's low-friction "let people adopt a bench"
  goal; adoption length is entered in months or years and stored as
  months.
- **Storage caveat**: uses a local SQLite file (`better-sqlite3`) for
  simplicity. On Vercel this is written to `/tmp`, which is not durable
  across deploys/cold starts — fine for demoing this take-home, but a real
  deployment would swap in hosted Postgres.

## Stack

Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind
CSS, SQLite via `better-sqlite3`.
