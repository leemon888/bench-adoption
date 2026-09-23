export type BenchRow = {
  id: number;
  code: string;
  section: string;
  note: string | null;
};

export type AdoptionRow = {
  id: number;
  benchId: number;
  donorName: string;
  message: string | null;
  startDate: string;
  durationMonths: number;
  createdAt: string;
};

export interface Store {
  listBenches(): Promise<BenchRow[]>;
  getBench(id: number): Promise<BenchRow | null>;
  /** Latest adoption per bench, keyed by bench id. */
  latestAdoptions(): Promise<Map<number, AdoptionRow>>;
  latestAdoptionFor(benchId: number): Promise<AdoptionRow | null>;
  insertAdoption(
    benchId: number,
    input: {
      donorName: string;
      message: string | null;
      startDate: string;
      durationMonths: number;
      createdAt: string;
    }
  ): Promise<void>;
}

let storePromise: Promise<Store> | null = null;

export function getStore(): Promise<Store> {
  if (!storePromise) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    storePromise = connectionString
      ? import("./store-postgres").then((m) => m.createPostgresStore(connectionString!))
      : import("./store-sqlite").then((m) => m.createSqliteStore());
  }
  return storePromise;
}
