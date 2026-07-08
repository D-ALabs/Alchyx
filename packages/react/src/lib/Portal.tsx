import * as React from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  children: React.ReactNode;
  /** Where to render. Defaults to document.body. */
  container?: Element | DocumentFragment | null;
}

/**
 * Portal — renders children into `container` (default document.body) once
 * mounted on the client. Used by overlays (Dialog, Tooltip, Toast) so they
 * escape parent overflow/stacking contexts.
 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  return target ? createPortal(children, target) : null;
}
