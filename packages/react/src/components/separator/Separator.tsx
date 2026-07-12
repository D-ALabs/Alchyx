"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./separator.css";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Line direction. Default "horizontal". */
  orientation?: SeparatorOrientation;
  /**
   * When true (the default) the separator is purely visual: it is removed from
   * the accessibility tree (`role="none"` + `aria-hidden`). Set `false` when the
   * rule carries meaning (e.g. it delimits list sections) so it is exposed as a
   * `role="separator"` with the matching `aria-orientation`.
   */
  decorative?: boolean;
  /**
   * Optional label rendered centred between two rules (e.g. `"OR"`). Only honoured
   * for `orientation="horizontal"`; ignored on vertical separators.
   */
  label?: React.ReactNode;
}

/**
 * Separator — a divider between content or groups of controls. Follows the Radix
 * Primitives separator contract (decorative vs. semantic `role="separator"`) and
 * adds the Twilio Paste labelled-rule affordance for "OR"-style dividers. Draws a
 * 1px `--bd` line in either orientation.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", decorative = true, label, className, ...props },
  ref,
) {
  const hasLabel = orientation === "horizontal" && label != null;

  const a11yProps: React.HTMLAttributes<HTMLDivElement> = decorative
    ? { role: "none", "aria-hidden": true }
    : { role: "separator", "aria-orientation": orientation };

  return (
    <div
      ref={ref}
      className={cn(
        "alx-separator",
        `alx-separator--${orientation}`,
        hasLabel && "alx-separator--labelled",
        className,
      )}
      {...a11yProps}
      {...props}
    >
      {hasLabel && (
        <>
          <span className="alx-separator__line" aria-hidden="true" />
          <span className="alx-separator__label">{label}</span>
          <span className="alx-separator__line" aria-hidden="true" />
        </>
      )}
    </div>
  );
});
