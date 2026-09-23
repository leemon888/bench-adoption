"use client";

import { useActionState } from "react";
import { adoptBenchAction, type AdoptState } from "@/app/actions";

const initialState: AdoptState = { error: null, success: false };

export function AdoptForm({ benchId }: { benchId: number }) {
  const action = adoptBenchAction.bind(null, benchId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--leaf-700)]/30 bg-[var(--leaf-100)] p-4 text-[var(--leaf-700)]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M8 12.5l2.5 2.5L16 9.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p>
          Thank you! This bench has been adopted. Reload the page to see it
          reflected.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md border border-[var(--brick-700)]/30 bg-[var(--brick-100)] px-3 py-2 text-sm text-[var(--brick-700)]">
          {state.error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--forest-700)]">
          Your name or dedication
        </label>
        <input
          name="donorName"
          required
          maxLength={120}
          placeholder="e.g. The Alvarez Family, or In memory of..."
          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--forest-700)]">
          Message (optional)
        </label>
        <textarea
          name="message"
          maxLength={280}
          rows={2}
          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--forest-700)]">
            Adoption length
          </label>
          <input
            name="durationValue"
            type="number"
            min={1}
            required
            defaultValue={1}
            className="w-24 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--forest-700)]">
            Unit
          </label>
          <select
            name="durationUnit"
            defaultValue="years"
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--forest-700)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--forest-600)] disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Adopt this bench"}
      </button>
      <p className="text-xs text-[var(--ink-faint)]">
        No payment is collected here. Adoption is confirmed immediately for
        this demo; the production version would route to payment first.
      </p>
    </form>
  );
}
