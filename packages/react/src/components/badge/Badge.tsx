"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import "./badge.css";

export type BadgeVariant = "neutral" | "accent" | "signal" | "caution" | "fault";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Semantic tone. `neutral` is a quiet chip; `accent` picks up the one brand
   * accent; `signal` / `caution` / `fault` map to the fixed status hues. Each
   * paints a low-alpha tinted background from its own colour. Default "neutral".
   */
  variant?: BadgeVariant;
  /** Compact or default padding + type scale. Default "md". */
  size?: BadgeSize;
  /**
   * Show a leading status dot in the badge's tone. Purely decorative
   * (aria-hidden) — keep the text meaningful. Not injected in `asChild` mode.
   */
  dot?: boolean;
  /**
   * Render as the single child element (merging props + ref) instead of a
   * <span> — e.g. `<Badge asChild><a href>…</a></Badge>`. The status dot is not
   * injected in `asChild` mode; include your own if needed.
   */
  asChild?: boolean;
}

/**
 * Badge — a small status label / pill. Consolidates the GitHub Primer Label
 * tones and the Ant Design Tag/Badge API onto the D-ALabs mono-caps chip: pill
 * radius, uppercase Space Mono, and a subtly tinted background mixed from the
 * relevant colour at low alpha. Supports `asChild` (Slot) so it can render as a
 * link or any element.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", size = "md", dot = false, asChild = false, className, children, ...props },
  ref,
) {
  const Comp: React.ElementType = asChild ? Slot : "span";

  const classes = cn(
    "alx-badge",
    `alx-badge--${variant}`,
    `alx-badge--${size}`,
    className,
  );

  return (
    <Comp ref={ref as never} className={classes} data-variant={variant} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {dot && <span className="alx-badge__dot" aria-hidden="true" />}
          {children}
        </>
      )}
    </Comp>
  );
});
