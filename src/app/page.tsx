import Link from "next/link";
import { getSections, getSummary, listBenches, type BenchFilter } from "@/lib/benches";

export const metadata = { title: "Adopt a bench" };

const PAGE_SIZE = 40;

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/?${qs}` : "/";
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--paper)] px-5 py-4">
      <p className="font-display text-3xl font-semibold text-[var(--forest-700)]">
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-sm text-[var(--ink-faint)]">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: "available" | "adopted" }) {
  const adopted = status === "adopted";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        adopted
          ? "bg-[var(--gold-100)] text-[var(--gold-700)]"
          : "bg-[var(--leaf-100)] text-[var(--leaf-700)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          adopted ? "bg-[var(--gold-700)]" : "bg-[var(--leaf-700)]"
        }`}
      />
      {adopted ? "Adopted" : "Available"}
    </span>
  );
}

export default async function BenchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const filter = (typeof sp.filter === "string" ? sp.filter : "all") as BenchFilter;
  const section = typeof sp.section === "string" ? sp.section : undefined;
  const query = typeof sp.q === "string" ? sp.q : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const sections = getSections();
  const [summary, results] = await Promise.all([
    getSummary(),
    listBenches({ filter, section, query }),
  ]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <section className="mb-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--forest-700)] px-6 py-10 text-[var(--cream)] sm:px-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-100)]">
          Van Cortlandt Park Conservancy
        </p>
        <h1 className="font-display mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
          Give a bench, leave a legacy in the park.
        </h1>
        <p className="mt-4 max-w-xl text-[var(--leaf-100)]">
          Browse all {summary.total} benches across the park&rsquo;s ten
          sections, see who has already dedicated one, and adopt an
          available bench for your own family, memory, or organization.
        </p>
      </section>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Total benches" value={summary.total} />
        <StatTile label="Available" value={summary.available} />
        <StatTile label="Adopted" value={summary.adopted} />
      </div>

      <form
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4"
        action="/"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Search
          </label>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Bench code or donor name"
            className="w-56 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Section
          </label>
          <select
            name="section"
            defaultValue={section ?? ""}
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Status
          </label>
          <select
            name="filter"
            defaultValue={filter}
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="adopted">Adopted</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--forest-700)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--forest-600)]"
        >
          Filter
        </button>
        {(query || section || filter !== "all") && (
          <Link
            href="/"
            className="text-sm text-[var(--ink-faint)] underline underline-offset-2"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="mb-3 text-sm text-[var(--ink-faint)]">
        {results.length} bench{results.length === 1 ? "" : "es"} match
        {results.length === 1 ? "es" : ""}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((bench) => (
          <Link
            key={bench.id}
            href={`/${bench.id}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--forest-500)] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-sm font-semibold text-[var(--forest-700)]">
                {bench.code}
              </span>
              <StatusPill status={bench.status} />
            </div>
            <p className="mt-1.5 text-sm text-[var(--ink-soft)]">{bench.section}</p>
            {bench.adoption && (
              <p className="mt-2 border-t border-[var(--border)] pt-2 text-sm text-[var(--ink-faint)]">
                Dedicated by {bench.adoption.donorName} &middot; through{" "}
                {bench.expiresOn}
              </p>
            )}
          </Link>
        ))}
      </div>

      {pageItems.length === 0 && (
        <p className="mt-8 text-center text-[var(--ink-faint)]">
          No benches match those filters.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ filter, section, q: query, page: String(p) })}
              className={`rounded-md px-3 py-1 ${
                p === page
                  ? "bg-[var(--forest-700)] text-white"
                  : "border border-[var(--border)] text-[var(--ink-soft)] hover:bg-white"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
