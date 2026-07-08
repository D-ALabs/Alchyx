import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * useScrollLock — while `active`, prevents body scroll and compensates for the
 * scrollbar width so the page doesn't shift. Used by modal overlays.
 */
export function useScrollLock(active: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!active || typeof document === "undefined") return;
    const { body, documentElement } = document;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [active]);
}
