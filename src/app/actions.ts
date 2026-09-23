"use server";

import { revalidatePath } from "next/cache";
import { adoptBench, AdoptionError } from "@/lib/benches";

export type AdoptState = { error: string | null; success: boolean };

export async function adoptBenchAction(
  benchId: number,
  _prev: AdoptState,
  formData: FormData
): Promise<AdoptState> {
  const donorName = String(formData.get("donorName") ?? "");
  const message = String(formData.get("message") ?? "");
  const durationValue = Number(formData.get("durationValue"));
  const durationUnit = String(formData.get("durationUnit"));
  const durationMonths =
    durationUnit === "years" ? durationValue * 12 : durationValue;

  try {
    adoptBench(benchId, { donorName, message, durationMonths });
  } catch (err) {
    if (err instanceof AdoptionError) {
      return { error: err.message, success: false };
    }
    return { error: "Something went wrong. Please try again.", success: false };
  }

  revalidatePath("/");
  revalidatePath(`/${benchId}`);
  return { error: null, success: true };
}
