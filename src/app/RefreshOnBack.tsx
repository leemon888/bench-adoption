"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The browser can restore a page from bfcache on back/forward navigation
 * without re-contacting the server at all, showing a stale snapshot from
 * before an adoption was submitted. Force a fresh server render whenever
 * that happens.
 */
export function RefreshOnBack() {
  const router = useRouter();

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        router.refresh();
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  return null;
}
