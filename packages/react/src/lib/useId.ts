import * as React from "react";

/**
 * useId — a stable id for ARIA wiring. Wraps React.useId and strips the ":"
 * characters (invalid in querySelector) so ids compose into `aria-*` targets.
 * Pass an explicit id to short-circuit.
 */
export function useId(deterministicId?: string): string {
  const reactId = React.useId();
  return deterministicId ?? `alx-${reactId.replace(/:/g, "")}`;
}
