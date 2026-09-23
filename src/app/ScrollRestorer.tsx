"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { consumePendingScroll } from "./scroll-store";

/**
 * Next's built-in scroll-preserving navigation (Link scroll={false},
 * router.push scroll:false) doesn't reliably hold position here, so we
 * capture and restore it ourselves whenever the query string changes.
 */
export function ScrollRestorer() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const y = consumePendingScroll();
    if (y !== null) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  return null;
}
