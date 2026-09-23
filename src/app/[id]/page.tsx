import Link from "next/link";
import { notFound } from "next/navigation";
import { getBench } from "@/lib/benches";
import { AdoptForm } from "./AdoptForm";

export default async function BenchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const benchId = Number(id);
  const bench = Number.isFinite(benchId) ? await getBench(benchId) : null;
  if (!bench) notFound();

  const adopted = bench.status === "adopted";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--ink-faint)] underline underline-offset-2"
      >
        &larr; Back to all benches
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--paper)]">
        <div className="border-b border-[var(--border)] bg-[var(--forest-700)] px-6 py-6 text-[var(--cream)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-100)]">
            {bench.section}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <h1 className="font-display font-mono text-2xl font-semibold">
              {bench.code}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
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
          </div>
        </div>

        <div className="px-6 py-6">
          {bench.adoption ? (
            <div>
              <p className="text-sm text-[var(--ink-faint)]">Dedicated by</p>
              <p className="font-display mt-1 text-xl font-semibold text-[var(--forest-700)]">
                {bench.adoption.donorName}
              </p>
              {bench.adoption.message && (
                <p className="mt-3 italic text-[var(--ink-soft)]">
                  &ldquo;{bench.adoption.message}&rdquo;
                </p>
              )}
              <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm text-[var(--ink-faint)]">
                Adopted since {bench.adoption.startDate} &middot; through{" "}
                {bench.expiresOn}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-display mb-4 text-lg font-semibold text-[var(--forest-700)]">
                Adopt this bench
              </h2>
              <AdoptForm benchId={bench.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
