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
  const summary = getSummary();
  const results = listBenches({ filter, section, query });

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#2f3b26]">
          Adopt a bench
        </h1>
        <p className="mt-2 max-w-2xl text-[#4a4536]">
          Van Cortlandt Park has {summary.total} benches across ten sections.
          {" "}
          {summary.available} are currently available to adopt, and{" "}
          {summary.adopted} are dedicated by donors. Browse below, or search
          for a bench by code or dedication.
        </p>
      </div>

      <form
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-[#d8d0bc] bg-white p-4"
        action="/"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[#6b6350]">
            Search
          </label>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Bench code or donor name"
            className="w-56 rounded border border-[#c9c1a8] px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[#6b6350]">
            Section
          </label>
          <select
            name="section"
            defaultValue={section ?? ""}
            className="rounded border border-[#c9c1a8] px-3 py-2 text-sm"
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
          <label className="text-xs font-medium uppercase tracking-wide text-[#6b6350]">
            Status
          </label>
          <select
            name="filter"
            defaultValue={filter}
            className="rounded border border-[#c9c1a8] px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="adopted">Adopted</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-[#2f3b26] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d4c32]"
        >
          Filter
        </button>
        {(query || section || filter !== "all") && (
          <Link
            href="/"
            className="text-sm text-[#6b6350] underline underline-offset-2"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="mb-3 text-sm text-[#6b6350]">
        {results.length} bench{results.length === 1 ? "" : "es"} match
        {results.length === 1 ? "es" : ""}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((bench) => (
          <Link
            key={bench.id}
            href={`/${bench.id}`}
            className="rounded-lg border border-[#d8d0bc] bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-sm font-semibold text-[#2f3b26]">
                {bench.code}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  bench.status === "adopted"
                    ? "bg-[#e4d9b8] text-[#6b5a1f]"
                    : "bg-[#dbe8d4] text-[#33622f]"
                }`}
              >
                {bench.status === "adopted" ? "Adopted" : "Available"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#4a4536]">{bench.section}</p>
            {bench.adoption && (
              <p className="mt-2 text-sm text-[#6b6350]">
                Dedicated by {bench.adoption.donorName} &middot; through{" "}
                {bench.expiresOn}
              </p>
            )}
          </Link>
        ))}
      </div>

      {pageItems.length === 0 && (
        <p className="mt-8 text-center text-[#6b6350]">
          No benches match those filters.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ filter, section, q: query, page: String(p) })}
              className={`rounded px-3 py-1 ${
                p === page
                  ? "bg-[#2f3b26] text-white"
                  : "border border-[#d8d0bc] text-[#4a4536] hover:bg-white"
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
