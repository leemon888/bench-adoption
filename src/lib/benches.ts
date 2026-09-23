import { getStore } from "@/lib/store";
import type { AdoptionRow, BenchRow } from "@/lib/store";
import { SECTIONS } from "@/lib/seed-data";

export type Bench = BenchRow;
export type Adoption = AdoptionRow;

export type BenchWithStatus = Bench & {
  adoption: Adoption | null;
  status: "available" | "adopted";
  expiresOn: string | null;
};

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

export type BenchFilter = "all" | "available" | "adopted";

export async function listBenches(opts: {
  filter?: BenchFilter;
  section?: string;
  query?: string;
}): Promise<BenchWithStatus[]> {
  const store = await getStore();
  const [benches, adoptions] = await Promise.all([
    store.listBenches(),
    store.latestAdoptions(),
  ]);

  let withStatuses = benches.map((b) => withStatus(b, adoptions.get(b.id) ?? null));

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

export async function getBench(id: number): Promise<BenchWithStatus | null> {
  const store = await getStore();
  const bench = await store.getBench(id);
  if (!bench) return null;
  const adoption = await store.latestAdoptionFor(bench.id);
  return withStatus(bench, adoption);
}

export function getSections(): string[] {
  return [...SECTIONS];
}

export async function getSummary() {
  const all = await listBenches({});
  const adopted = all.filter((b) => b.status === "adopted").length;
  return { total: all.length, adopted, available: all.length - adopted };
}

export class AdoptionError extends Error {}

export async function adoptBench(
  benchId: number,
  input: { donorName: string; message?: string; durationMonths: number }
) {
  const bench = await getBench(benchId);
  if (!bench) throw new AdoptionError("Bench not found.");
  if (bench.status === "adopted") {
    throw new AdoptionError("This bench is already adopted.");
  }
  const donorName = input.donorName.trim();
  if (!donorName) throw new AdoptionError("Donor name is required.");
  if (!Number.isInteger(input.durationMonths) || input.durationMonths <= 0) {
    throw new AdoptionError("Duration must be a positive number of months.");
  }

  const store = await getStore();
  const now = new Date();
  await store.insertAdoption(benchId, {
    donorName,
    message: input.message?.trim() || null,
    startDate: now.toISOString().slice(0, 10),
    durationMonths: input.durationMonths,
    createdAt: now.toISOString(),
  });
}
