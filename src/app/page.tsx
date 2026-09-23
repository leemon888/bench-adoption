import Link from "next/link";
import Image from "next/image";
import { getSections, getSummary, listBenches, type BenchFilter } from "@/lib/benches";
import { SearchForm } from "./SearchForm";
import { FilterTabs } from "./FilterTabs";
import benchPathImg from "@/assets/park/bench-path.webp";
import benchReaderImg from "@/assets/park/bench-reader.webp";
import lakeCanoesImg from "@/assets/park/lake-canoes.webp";
import golfAerialImg from "@/assets/park/golf-aerial.webp";

export const metadata = { title: "Adopt a bench" };
export const dynamic = "force-dynamic";

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
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
        {label}
      </p>
    </div>
  );
}

const GALLERY = [
  {
    src: benchReaderImg,
    alt: "A visitor reading on an adopted bench under the trees",
    caption: "A quiet moment on a park bench",
  },
  {
    src: lakeCanoesImg,
    alt: "Canoes on Van Cortlandt Lake in autumn",
    caption: "Van Cortlandt Lake",
  },
  {
    src: golfAerialImg,
    alt: "Aerial view of the Van Cortlandt Park golf course",
    caption: "The Golf Course Perimeter, from above",
  },
];

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
      <section className="mb-10 grid gap-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--forest-700)] px-6 py-10 text-[var(--cream)] sm:px-10 sm:py-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sky-100)]">
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
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <Image
            src={benchPathImg}
            alt="A tree-lined path with several benches in Van Cortlandt Park"
            className="h-full w-full object-cover"
            placeholder="blur"
            priority
          />
        </div>
      </section>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Benches" value={summary.total} />
        <StatTile label="Available" value={summary.available} />
        <StatTile label="Adopted" value={summary.adopted} />
      </div>

      <SearchForm
        filter={filter}
        query={query}
        section={section}
        sections={sections}
      />

      <FilterTabs filter={filter} section={section} query={query} />

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
            {bench.adoption ? (
              <div className="mt-2 border-t border-[var(--border)] pt-2">
                <p className="text-sm text-[var(--ink-faint)]">
                  Dedicated by {bench.adoption.donorName} &middot; through{" "}
                  {bench.expiresOn}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--forest-700)]">
                  View dedication
                  <span className="transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </span>
              </div>
            ) : (
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--forest-700)]">
                Adopt this bench
                <span className="transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </span>
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

      <section className="mt-14 border-t border-[var(--border)] pt-10">
        <h2 className="font-display text-xl font-semibold text-[var(--forest-700)]">
          Scenes from the park
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {GALLERY.map((item) => (
            <figure
              key={item.caption}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--paper)]"
            >
              <Image
                src={item.src}
                alt={item.alt}
                className="h-40 w-full object-cover"
                placeholder="blur"
              />
              <figcaption className="px-3 py-2 text-sm text-[var(--ink-soft)]">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
