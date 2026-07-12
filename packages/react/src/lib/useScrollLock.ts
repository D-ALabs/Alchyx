import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

function lockDocumentScroll() {
  const { body, documentElement } = document;
  if (lockCount === 0) {
    originalOverflow = body.style.overflow;
    originalPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = originalPaddingRight
        ? `calc(${originalPaddingRight} + ${scrollbarWidth}px)`
        : `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function unlockDocumentScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0) return;
  document.body.style.overflow = originalOverflow;
  document.body.style.paddingRight = originalPaddingRight;
}

/**
 * useScrollLock — while `active`, prevents body scroll and compensates for the
 * scrollbar width so the page doesn't shift. Used by modal overlays.
 */
export function useScrollLock(active: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!active || typeof document === "undefined") return;
    lockDocumentScroll();
    return unlockDocumentScroll;
  }, [active]);
}
