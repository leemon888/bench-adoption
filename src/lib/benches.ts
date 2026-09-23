import { db } from "@/lib/db";

export type Bench = {
  id: number;
  code: string;
  section: string;
  note: string | null;
};

export type Adoption = {
  id: number;
  benchId: number;
  donorName: string;
  message: string | null;
  startDate: string;
  durationMonths: number;
  createdAt: string;
};

export type BenchWithStatus = Bench & {
  adoption: Adoption | null;
  status: "available" | "adopted";
  expiresOn: string | null;
};

const SECTIONS = [
  "Parade Ground",
  "Van Cortlandt Lake",
  "Old Croton Trail",
  "John Kieran Nature Trail",
  "Vault Hill",
  "Tibbetts Brook",
  "Golf Course Perimeter",
  "Woodlawn Road",
  "242nd Street Entrance",
  "Broadway Entrance",
];

const SECTION_PREFIX: Record<string, string> = {
  "Parade Ground": "PG",
  "Van Cortlandt Lake": "VCL",
  "Old Croton Trail": "OCT",
  "John Kieran Nature Trail": "JKT",
  "Vault Hill": "VH",
  "Tibbetts Brook": "TB",
  "Golf Course Perimeter": "GCP",
  "Woodlawn Road": "WR",
  "242nd Street Entrance": "242",
  "Broadway Entrance": "BWY",
};

const BENCH_COUNT = 500;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function seedIfEmpty() {
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM benches")
    .get() as { count: number };
  if (count > 0) return;

  const rand = seededRandom(42);
  const insertBench = db.prepare(
    "INSERT INTO benches (id, code, section, note) VALUES (?, ?, ?, ?)"
  );
  const insertAdoption = db.prepare(
    `INSERT INTO adoptions (bench_id, donor_name, message, start_date, duration_months, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const donors = [
    "The Alvarez Family",
    "Friends of Van Cortlandt Park",
    "Margaret & Owen Petrov",
    "Bronx Runners Club",
    "In memory of Rosa DiMarco",
    "The Chen-Okafor Family",
    "P.S. 95 Fourth Grade Class of 2019",
    "Kingsbridge Heights Association",
    "In honor of Coach Reyes",
    "Anonymous",
  ];

  const perSection = Math.floor(BENCH_COUNT / SECTIONS.length);
  let benchId = 1;
  const txn = db.transaction(() => {
    for (const section of SECTIONS) {
      const prefix = SECTION_PREFIX[section];
      for (let i = 1; i <= perSection; i++) {
        const code = `${prefix}-${String(i).padStart(3, "0")}`;
        insertBench.run(benchId, code, section, null);

        // Roughly a third of benches start out adopted, mixing active
        // and already-expired terms so the "available again" path has
        // real data to demonstrate.
        const roll = rand();
        if (roll < 0.35) {
          const donor = donors[Math.floor(rand() * donors.length)];
          const durationMonths = [12, 24, 36, 60][
            Math.floor(rand() * 4)
          ];
          // startedMonthsAgo ranges 0..48, so some terms have already lapsed.
          const startedMonthsAgo = Math.floor(rand() * 48);
          const start = new Date();
          start.setMonth(start.getMonth() - startedMonthsAgo);
          insertAdoption.run(
            benchId,
            donor,
            null,
            start.toISOString().slice(0, 10),
            durationMonths,
            start.toISOString()
          );
        }
        benchId++;
      }
    }
  });
  txn();
}

function withStatus(bench: Bench, adoption: Adoption | null): BenchWithStatus {
  if (!adoption) {
    return { ...bench, adoption: null, status: "available", expiresOn: null };
  }
  const start = new Date(adoption.startDate);
  const expires = new Date(start);
  expires.setMonth(expires.getMonth() + adoption.durationMonths);
  const active = expires.getTime() > Date.now();
  return {
    ...bench,
    adoption: active ? adoption : null,
    status: active ? "adopted" : "available",
    expiresOn: active ? expires.toISOString().slice(0, 10) : null,
  };
}

function latestAdoptionFor(benchId: number): Adoption | null {
  const row = db
    .prepare(
      `SELECT id, bench_id as benchId, donor_name as donorName, message,
              start_date as startDate, duration_months as durationMonths,
              created_at as createdAt
       FROM adoptions WHERE bench_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(benchId) as Adoption | undefined;
  return row ?? null;
}

export type BenchFilter = "all" | "available" | "adopted";

export function listBenches(opts: {
  filter?: BenchFilter;
  section?: string;
  query?: string;
}): BenchWithStatus[] {
  seedIfEmpty();
  const benches = db
    .prepare("SELECT id, code, section, note FROM benches ORDER BY id")
    .all() as Bench[];

  let withStatuses = benches.map((b) => withStatus(b, latestAdoptionFor(b.id)));

  if (opts.section) {
    withStatuses = withStatuses.filter((b) => b.section === opts.section);
  }
  if (opts.filter === "available" || opts.filter === "adopted") {
    withStatuses = withStatuses.filter((b) => b.status === opts.filter);
  }
  if (opts.query) {
    const q = opts.query.trim().toLowerCase();
    if (q) {
      withStatuses = withStatuses.filter(
        (b) =>
          b.code.toLowerCase().includes(q) ||
          b.adoption?.donorName.toLowerCase().includes(q)
      );
    }
  }
  return withStatuses;
}

export function getBench(id: number): BenchWithStatus | null {
  seedIfEmpty();
  const bench = db
    .prepare("SELECT id, code, section, note FROM benches WHERE id = ?")
    .get(id) as Bench | undefined;
  if (!bench) return null;
  return withStatus(bench, latestAdoptionFor(bench.id));
}

export function getSections(): string[] {
  seedIfEmpty();
  return SECTIONS;
}

export function getSummary() {
  seedIfEmpty();
  const all = listBenches({});
  const adopted = all.filter((b) => b.status === "adopted").length;
  return { total: all.length, adopted, available: all.length - adopted };
}

export class AdoptionError extends Error {}

export function adoptBench(
  benchId: number,
  input: { donorName: string; message?: string; durationMonths: number }
) {
  const bench = getBench(benchId);
  if (!bench) throw new AdoptionError("Bench not found.");
  if (bench.status === "adopted") {
    throw new AdoptionError("This bench is already adopted.");
  }
  const donorName = input.donorName.trim();
  if (!donorName) throw new AdoptionError("Donor name is required.");
  if (!Number.isInteger(input.durationMonths) || input.durationMonths <= 0) {
    throw new AdoptionError("Duration must be a positive number of months.");
  }

  const now = new Date();
  db.prepare(
    `INSERT INTO adoptions (bench_id, donor_name, message, start_date, duration_months, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    benchId,
    donorName,
    input.message?.trim() || null,
    now.toISOString().slice(0, 10),
    input.durationMonths,
    now.toISOString()
  );
}
