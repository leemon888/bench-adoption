"use client";

import Link from "next/link";
import type { BenchFilter } from "@/lib/benches";
import { captureScroll } from "./scroll-store";

const FILTER_TABS: { value: BenchFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "adopted", label: "Adopted" },
];

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/?${qs}` : "/";
}

export function FilterTabs({
  filter,
  section,
  query,
}: {
  filter: BenchFilter;
  section: string | undefined;
  query: string | undefined;
}) {
  return (
    <div className="mb-6 inline-flex rounded-lg border border-[var(--border)] bg-[var(--paper)] p-1">
      {FILTER_TABS.map((tab) => (
        <Link
          key={tab.value}
          href={buildHref({
            filter: tab.value === "all" ? undefined : tab.value,
            section,
            q: query,
          })}
          scroll={false}
          onClick={captureScroll}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === tab.value
              ? "bg-[var(--forest-700)] text-white"
              : "text-[var(--ink-soft)] hover:bg-[var(--leaf-100)]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
