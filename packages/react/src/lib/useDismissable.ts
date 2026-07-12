import * as React from "react";
import { isTopmostOverlayLayer, registerOverlayLayer } from "./overlayStack";

export interface UseDismissableOptions {
  enabled?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** Whether this layer temporarily owns focus handling over a parent focus trap. Default true. */
  blocksParentFocusTrap?: boolean;
}

/**
 * useDismissable — closes a layer on Escape and on pointer-down outside its
 * element. Handlers are read from refs, so passing inline callbacks does not
 * re-subscribe the listeners on every render.
 */
export function useDismissable(
  ref: React.RefObject<HTMLElement | null>,
  {
    enabled = true,
    onEscapeKeyDown,
    onPointerDownOutside,
    blocksParentFocusTrap = true,
  }: UseDismissableOptions,
) {
  const layerId = React.useRef(Symbol("alchyx-overlay-layer"));
  const escRef = React.useRef(onEscapeKeyDown);
  const outsideRef = React.useRef(onPointerDownOutside);
  React.useEffect(() => {
    escRef.current = onEscapeKeyDown;
    outsideRef.current = onPointerDownOutside;
  });

  React.useEffect(() => {
    if (!enabled) return;
    return registerOverlayLayer({ id: layerId.current, ref, blocksParentFocusTrap });
  }, [enabled, ref, blocksParentFocusTrap]);

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTopmostOverlayLayer(layerId.current)) {
        escRef.current?.(event);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!isTopmostOverlayLayer(layerId.current)) return;
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        outsideRef.current?.(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Defer the outside listener a tick so the same click that opened the layer
    // does not immediately dismiss it.
    const raf = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, ref]);
}
