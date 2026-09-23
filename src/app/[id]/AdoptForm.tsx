"use client";

import { useActionState } from "react";
import { adoptBenchAction, type AdoptState } from "@/app/actions";

const initialState: AdoptState = { error: null, success: false };

export function AdoptForm({ benchId }: { benchId: number }) {
  const action = adoptBenchAction.bind(null, benchId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-[#bcd8b3] bg-[#eef6ea] p-4 text-[#33622f]">
        Thank you! This bench has been adopted. Reload the page to see it
        reflected.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded border border-[#e3b3ab] bg-[#fbeceb] px-3 py-2 text-sm text-[#8a2c22]">
          {state.error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-[#2f3b26]">
          Your name or dedication
        </label>
        <input
          name="donorName"
          required
          maxLength={120}
          placeholder="e.g. The Alvarez Family, or In memory of..."
          className="w-full rounded border border-[#c9c1a8] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#2f3b26]">
          Message (optional)
        </label>
        <textarea
          name="message"
          maxLength={280}
          rows={2}
          className="w-full rounded border border-[#c9c1a8] px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#2f3b26]">
            Adoption length
          </label>
          <input
            name="durationValue"
            type="number"
            min={1}
            required
            defaultValue={1}
            className="w-24 rounded border border-[#c9c1a8] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#2f3b26]">
            Unit
          </label>
          <select
            name="durationUnit"
            defaultValue="years"
            className="rounded border border-[#c9c1a8] px-3 py-2 text-sm"
          >
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#2f3b26] px-5 py-2 text-sm font-medium text-white hover:bg-[#3d4c32] disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Adopt this bench"}
      </button>
      <p className="text-xs text-[#6b6350]">
        No payment is collected here. Adoption is confirmed immediately for
        this demo; the production version would route to payment first.
      </p>
    </form>
  );
}
