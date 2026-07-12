"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import { VisuallyHidden } from "../../lib/VisuallyHidden";
import "./stat.css";

/** Direction of the delta signal — colors the change accordingly. */
export type StatTrend = "up" | "down" | "flat";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mono-caps caption naming the metric (e.g. "Components"). */
  label: React.ReactNode;
  /** The headline figure, rendered as the big display numeral. */
  value: string | number;
  /** Optional change chip beside the value, e.g. `"+12%"`. */
  delta?: string;
  /**
   * Direction of the delta, which tints it: `up` → signal (green),
   * `down` → fault (red), `flat` → faint. Also exposes the direction to
   * assistive tech. When omitted, `delta` renders in a neutral tone with no arrow.
   */
  trend?: StatTrend;
  /** Optional small sub text below the value. */
  hint?: React.ReactNode;
}

/** Glyph shown before the delta for each trend direction. */
const TREND_GLYPH: Record<StatTrend, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

/** Screen-reader label announcing the trend direction. */
const TREND_LABEL: Record<StatTrend, string> = {
  up: "Trending up",
  down: "Trending down",
  flat: "No change",
};

/**
 * Stat — a single statistic block: mono-caps label, a big display numeral in the
 * dedicated `--stat` hue, and an optional trend-colored delta plus hint. Distills
 * the Ant Design `Statistic` anatomy and the Fluent UI metric tile into the
 * D-ALabs type system. Renders a labelled `role="group"` so screen readers read
 * the metric name, figure, and change as one unit.
 */
export const Stat = React.forwardRef<HTMLDivElement, StatProps>(function Stat(
  {
    label,
    value,
    delta,
    trend,
    hint,
    className,
    id,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    ...props
  },
  ref,
) {
  const autoId = useId(id);
  const labelId = `${autoId}-label`;
  const hintId = `${autoId}-hint`;

  const describedBy =
    [ariaDescribedby, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div
      ref={ref}
      id={autoId}
      role="group"
      aria-labelledby={ariaLabelledby ?? labelId}
      aria-describedby={describedBy}
      className={cn("alx-stat", className)}
      {...props}
    >
      <span className="alx-stat__label" id={labelId}>
        {label}
      </span>
      <div className="alx-stat__body">
        <span className="alx-stat__value">{value}</span>
        {delta && (
          <span
            className={cn("alx-stat__delta", trend && `alx-stat__delta--${trend}`)}
            data-trend={trend || undefined}
          >
            {trend && (
              <>
                <span className="alx-stat__arrow" aria-hidden="true">
                  {TREND_GLYPH[trend]}
                </span>
                <VisuallyHidden>{TREND_LABEL[trend]}</VisuallyHidden>
              </>
            )}
            {delta}
          </span>
        )}
      </div>
      {hint && (
        <span className="alx-stat__hint" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
});
