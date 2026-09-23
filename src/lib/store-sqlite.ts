import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { generateSeedData } from "./seed-data";
import type { AdoptionRow, BenchRow, Store } from "./store";

const dbPath = process.env.VERCEL
  ? "/tmp/bench-adoption.db"
  : path.join(process.cwd(), "data", "bench-adoption.db");

function openDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS benches (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      section TEXT NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS adoptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bench_id INTEGER NOT NULL REFERENCES benches(id),
      donor_name TEXT NOT NULL,
      message TEXT,
      start_date TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_adoptions_bench ON adoptions(bench_id);
  `);

  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM benches")
    .get() as { count: number };
  if (count === 0) {
    const insertBench = db.prepare(
      "INSERT INTO benches (id, code, section, note) VALUES (?, ?, ?, ?)"
    );
    const insertAdoption = db.prepare(
      `INSERT INTO adoptions (bench_id, donor_name, message, start_date, duration_months, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const txn = db.transaction(() => {
      for (const bench of generateSeedData()) {
        insertBench.run(bench.id, bench.code, bench.section, bench.note);
        if (bench.adoption) {
          insertAdoption.run(
            bench.id,
            bench.adoption.donorName,
            bench.adoption.message,
            bench.adoption.startDate,
            bench.adoption.durationMonths,
            bench.adoption.createdAt
          );
        }
      }
    });
    txn();
  }

  return db;
}

export function createSqliteStore(): Store {
  const db = openDb();

  return {
    async listBenches() {
      return db
        .prepare("SELECT id, code, section, note FROM benches ORDER BY id")
        .all() as BenchRow[];
    },

    async getBench(id) {
      const row = db
        .prepare("SELECT id, code, section, note FROM benches WHERE id = ?")
        .get(id) as BenchRow | undefined;
      return row ?? null;
    },

    async latestAdoptions() {
      const rows = db
        .prepare(
          `SELECT a.id, a.bench_id as benchId, a.donor_name as donorName, a.message,
                  a.start_date as startDate, a.duration_months as durationMonths,
                  a.created_at as createdAt
           FROM adoptions a
           INNER JOIN (
             SELECT bench_id, MAX(created_at) as maxCreated
             FROM adoptions GROUP BY bench_id
           ) latest ON latest.bench_id = a.bench_id AND latest.maxCreated = a.created_at`
        )
        .all() as AdoptionRow[];
      return new Map(rows.map((r) => [r.benchId, r]));
    },

    async latestAdoptionFor(benchId) {
      const row = db
        .prepare(
          `SELECT id, bench_id as benchId, donor_name as donorName, message,
                  start_date as startDate, duration_months as durationMonths,
                  created_at as createdAt
           FROM adoptions WHERE bench_id = ? ORDER BY created_at DESC LIMIT 1`
        )
        .get(benchId) as AdoptionRow | undefined;
      return row ?? null;
    },

    async insertAdoption(benchId, input) {
      db.prepare(
        `INSERT INTO adoptions (bench_id, donor_name, message, start_date, duration_months, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        benchId,
        input.donorName,
        input.message,
        input.startDate,
        input.durationMonths,
        input.createdAt
      );
    },
  };
}
