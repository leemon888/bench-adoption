import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.VERCEL
  ? "/tmp/bench-adoption.db"
  : path.join(process.cwd(), "data", "bench-adoption.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

declare global {
  var __benchDb: Database.Database | undefined;
}

function createDb() {
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
  return db;
}

export const db = globalThis.__benchDb ?? createDb();
if (process.env.NODE_ENV !== "production") {
  globalThis.__benchDb = db;
}
