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
  const bench = Number.isFinite(benchId) ? getBench(benchId) : null;
  if (!bench) notFound();

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-[#6b6350] underline underline-offset-2"
      >
        &larr; Back to all benches
      </Link>

      <div className="mt-4 rounded-lg border border-[#d8d0bc] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-mono text-2xl font-semibold text-[#2f3b26]">
              {bench.code}
            </h1>
            <p className="mt-1 text-[#4a4536]">{bench.section}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              bench.status === "adopted"
                ? "bg-[#e4d9b8] text-[#6b5a1f]"
                : "bg-[#dbe8d4] text-[#33622f]"
            }`}
          >
            {bench.status === "adopted" ? "Adopted" : "Available"}
          </span>
        </div>

        {bench.adoption ? (
          <div className="mt-6 rounded-md bg-[#f6f3ec] p-4">
            <p className="text-sm text-[#6b6350]">Dedicated by</p>
            <p className="text-lg font-semibold text-[#2f3b26]">
              {bench.adoption.donorName}
            </p>
            {bench.adoption.message && (
              <p className="mt-2 italic text-[#4a4536]">
                &ldquo;{bench.adoption.message}&rdquo;
              </p>
            )}
            <p className="mt-3 text-sm text-[#6b6350]">
              Adopted since {bench.adoption.startDate} &middot; through{" "}
              {bench.expiresOn}
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-[#2f3b26]">
              Adopt this bench
            </h2>
            <AdoptForm benchId={bench.id} />
          </div>
        )}
      </div>
    </div>
  );
}
