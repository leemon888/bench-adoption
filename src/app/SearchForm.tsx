"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { captureScroll } from "./scroll-store";

export function SearchForm({
  filter,
  query,
  section,
  sections,
}: {
  filter: string;
  query: string | undefined;
  section: string | undefined;
  sections: string[];
}) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    captureScroll();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const hasActiveFilters = Boolean(query || section || filter !== "all");

  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4"
    >
      <input type="hidden" name="filter" value={filter} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
          Search
        </label>
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M20 20l-3.2-3.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Bench code, area, or donor name"
            className="w-64 rounded-md border border-[var(--border)] bg-white py-2 pl-8 pr-3 text-sm"
          />
        </div>
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
      <button
        type="submit"
        className="rounded-md bg-[var(--forest-700)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--forest-600)]"
      >
        Search
      </button>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push("/", { scroll: false })}
          className="text-sm text-[var(--ink-faint)] underline underline-offset-2"
        >
          Clear
        </button>
      )}
    </form>
  );
}
