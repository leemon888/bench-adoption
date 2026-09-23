let pendingScrollY: number | null = null;

/** Record the current scroll position before triggering a client navigation. */
export function captureScroll() {
  pendingScrollY = window.scrollY;
}

/** Read and clear the pending scroll position, if one was captured. */
export function consumePendingScroll(): number | null {
  const value = pendingScrollY;
  pendingScrollY = null;
  return value;
}
