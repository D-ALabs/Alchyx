"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { VisuallyHidden } from "../../lib/VisuallyHidden";
import "./spinner.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Diameter + stroke of the ring. Default "md". */
  size?: SpinnerSize;
  /**
   * Text announced by assistive technology, rendered in a visually-hidden node
   * so the spinner has an accessible name without adding visible copy. Default
   * "Loading".
   */
  label?: string;
}

/**
 * Spinner — an indeterminate loading indicator: an accent ring with a
 * transparent top segment rotating on the global `alx-spin` keyframe. Folds the
 * Fluent UI Spinner sizing and the Twilio Paste `role="status"` live-region
 * pattern onto the D-ALabs accent language. The visible ring is decorative; the
 * `label` is exposed to screen readers via a `polite` live region.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn("alx-spinner", `alx-spinner--${size}`, className)}
      {...props}
    >
      <span className="alx-spinner__ring" aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
});
