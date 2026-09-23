import { Pool } from "pg";
import { generateSeedData } from "./seed-data";
import type { AdoptionRow, BenchRow, Store } from "./store";

declare global {
  var __benchPgPool: Pool | undefined;
  var __benchPgReady: Promise<void> | undefined;
}

function getPool(connectionString: string): Pool {
  if (globalThis.__benchPgPool) return globalThis.__benchPgPool;
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });
  globalThis.__benchPgPool = pool;
  return pool;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function ensureSchemaAndSeed(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS benches (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      section TEXT NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS adoptions (
      id SERIAL PRIMARY KEY,
      bench_id INTEGER NOT NULL REFERENCES benches(id),
      donor_name TEXT NOT NULL,
      message TEXT,
      start_date TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_adoptions_bench ON adoptions(bench_id);
  `);

  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM benches"
  );
  if (Number(rows[0].count) > 0) return;

  const seed = generateSeedData();

  for (const batch of chunk(seed, 100)) {
    const values: unknown[] = [];
    const placeholders = batch
      .map((bench, i) => {
        const base = i * 4;
        values.push(bench.id, bench.code, bench.section, bench.note);
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
      })
      .join(", ");
    await pool.query(
      `INSERT INTO benches (id, code, section, note) VALUES ${placeholders}
       ON CONFLICT (id) DO NOTHING`,
      values
    );
  }

  const adopted = seed.filter((b) => b.adoption);
  for (const batch of chunk(adopted, 100)) {
    const values: unknown[] = [];
    const placeholders = batch
      .map((bench, i) => {
        const a = bench.adoption!;
        const base = i * 6;
        values.push(
          bench.id,
          a.donorName,
          a.message,
          a.startDate,
          a.durationMonths,
          a.createdAt
        );
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
      })
      .join(", ");
    await pool.query(
      `INSERT INTO adoptions (bench_id, donor_name, message, start_date, duration_months, created_at)
       VALUES ${placeholders}`,
      values
    );
  }
}

function mapAdoptionRow(r: {
  id: number;
  bench_id: number;
  donor_name: string;
  message: string | null;
  start_date: string;
  duration_months: number;
  created_at: string;
}): AdoptionRow {
  return {
    id: r.id,
    benchId: r.bench_id,
    donorName: r.donor_name,
    message: r.message,
    startDate: r.start_date,
    durationMonths: r.duration_months,
    createdAt: r.created_at,
  };
}

export async function createPostgresStore(connectionString: string): Promise<Store> {
  const pool = getPool(connectionString);
  if (!globalThis.__benchPgReady) {
    globalThis.__benchPgReady = ensureSchemaAndSeed(pool);
  }
  await globalThis.__benchPgReady;

  return {
    async listBenches() {
      const { rows } = await pool.query<BenchRow>(
        "SELECT id, code, section, note FROM benches ORDER BY id"
      );
      return rows;
    },

    async getBench(id) {
      const { rows } = await pool.query<BenchRow>(
        "SELECT id, code, section, note FROM benches WHERE id = $1",
        [id]
      );
      return rows[0] ?? null;
    },

    async latestAdoptions() {
      const { rows } = await pool.query(
        `SELECT DISTINCT ON (bench_id) id, bench_id, donor_name, message,
                start_date, duration_months, created_at
         FROM adoptions
         ORDER BY bench_id, created_at DESC`
      );
      const map = new Map<number, AdoptionRow>();
      for (const row of rows) {
        const mapped = mapAdoptionRow(row);
        map.set(mapped.benchId, mapped);
      }
      return map;
    },

    async latestAdoptionFor(benchId) {
      const { rows } = await pool.query(
        `SELECT id, bench_id, donor_name, message, start_date, duration_months, created_at
         FROM adoptions WHERE bench_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [benchId]
      );
      return rows[0] ? mapAdoptionRow(rows[0]) : null;
    },

    async insertAdoption(benchId, input) {
      await pool.query(
        `INSERT INTO adoptions (bench_id, donor_name, message, start_date, duration_months, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          benchId,
          input.donorName,
          input.message,
          input.startDate,
          input.durationMonths,
          input.createdAt,
        ]
      );
    },
  };
}
