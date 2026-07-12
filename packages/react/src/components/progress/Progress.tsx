"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import "./progress.css";

export type ProgressSize = "sm" | "md";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value on the `0…max` scale. Ignored while `indeterminate`. Default 0. */
  value?: number;
  /** Upper bound of the scale. Default 100. */
  max?: number;
  /**
   * Render an animated, unbounded sweep instead of a measured fill. Use when the
   * remaining work can't be quantified. Omits `aria-valuenow`.
   */
  indeterminate?: boolean;
  /** Bar thickness. Default "md". */
  size?: ProgressSize;
  /** Optional caption rendered above the bar, paired with a live percentage. */
  label?: React.ReactNode;
}

/**
 * Progress — a linear progress bar consolidating the Radix Primitives value/max
 * model, the Fluent UI determinate/indeterminate split, and Ant Design's labelled
 * percentage. Renders `role="progressbar"` with the ARIA value range wired up;
 * the accent fill rides the Alchyx expo easing and the indeterminate sweep pauses
 * under reduced-motion.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, max = 100, indeterminate = false, size = "md", label, className, ...props },
  ref,
) {
  const labelId = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((clamped / max) * 100) : 0;

  return (
    <div
      ref={ref}
      className={cn("alx-progress", `alx-progress--${size}`, className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuetext={indeterminate ? undefined : `${percent}%`}
      aria-labelledby={label ? labelId : undefined}
      data-indeterminate={indeterminate || undefined}
      {...props}
    >
      {label && (
        <div className="alx-progress__header">
          <span className="alx-progress__label" id={labelId}>
            {label}
          </span>
          {!indeterminate && <span className="alx-progress__value">{percent}%</span>}
        </div>
      )}
      <div className="alx-progress__track">
        <div
          className="alx-progress__fill"
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
});
