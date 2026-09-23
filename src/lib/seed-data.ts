export const SECTIONS = [
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
] as const;

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

const DONORS = [
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

const BENCH_COUNT = 500;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export type SeedAdoption = {
  donorName: string;
  message: string | null;
  startDate: string;
  durationMonths: number;
  createdAt: string;
};

export type SeedBench = {
  id: number;
  code: string;
  section: string;
  note: string | null;
  adoption: SeedAdoption | null;
};

/**
 * Deterministic seed data (same seed => same output every run), so the
 * sqlite and postgres backends produce an identical starting dataset.
 */
export function generateSeedData(): SeedBench[] {
  const rand = seededRandom(42);
  const perSection = Math.floor(BENCH_COUNT / SECTIONS.length);
  const benches: SeedBench[] = [];

  let benchId = 1;
  for (const section of SECTIONS) {
    const prefix = SECTION_PREFIX[section];
    for (let i = 1; i <= perSection; i++) {
      const code = `${prefix}-${String(i).padStart(3, "0")}`;

      // Roughly a third of benches start out adopted, mixing active and
      // already-expired terms so the "available again" path has real
      // data to demonstrate.
      let adoption: SeedAdoption | null = null;
      if (rand() < 0.35) {
        const donor = DONORS[Math.floor(rand() * DONORS.length)];
        const durationMonths = [12, 24, 36, 60][Math.floor(rand() * 4)];
        // startedMonthsAgo ranges 0..48, so some terms have already lapsed.
        const startedMonthsAgo = Math.floor(rand() * 48);
        const start = new Date();
        start.setMonth(start.getMonth() - startedMonthsAgo);
        adoption = {
          donorName: donor,
          message: null,
          startDate: start.toISOString().slice(0, 10),
          durationMonths,
          createdAt: start.toISOString(),
        };
      }

      benches.push({ id: benchId, code, section, note: null, adoption });
      benchId++;
    }
  }

  return benches;
}
