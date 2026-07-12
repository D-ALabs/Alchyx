"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./tag.css";

export type TagVariant = "neutral" | "accent";
export type TagSize = "sm" | "md";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style. `accent` tints the chip with the single brand accent. Default "neutral". */
  variant?: TagVariant;
  /** Control padding + type scale. Default "md". */
  size?: TagSize;
  /**
   * When provided, a trailing close button is rendered. Fires on click / Enter /
   * Space. The button stops propagation so a selectable tag's own `onClick` does
   * not also fire when the chip is dismissed.
   */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Decorative adornment rendered before the label (e.g. a status dot or icon). */
  leading?: React.ReactNode;
  /**
   * Accessible name for the remove button. Defaults to `Remove <label>` when the
   * label is a string, otherwise `"Remove"`.
   */
  removeLabel?: string;
  /** The tag label. */
  children?: React.ReactNode;
}

/**
 * Tag — a compact, optionally removable chip/token for filters, categories, and
 * selections. Consolidates the Ant Design `Tag` closable API and the Twilio Paste
 * `Chip` dismiss ergonomics on the D-ALabs pill language: one accent, tight pill
 * radius, calm motion. Renders an inline `<span>`; the dismiss affordance is a
 * real `<button>` with an accessible name.
 */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = "neutral", size = "md", onRemove, leading, removeLabel, className, children, ...props },
  ref,
) {
  const removable = Boolean(onRemove);
  const computedRemoveLabel =
    removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");

  return (
    <span
      ref={ref}
      className={cn(
        "alx-tag",
        `alx-tag--${variant}`,
        `alx-tag--${size}`,
        removable && "alx-tag--removable",
        className,
      )}
      {...props}
    >
      {leading != null && (
        <span className="alx-tag__lead" aria-hidden="true">
          {leading}
        </span>
      )}
      <span className="alx-tag__label">{children}</span>
      {onRemove && (
        <button
          type="button"
          className="alx-tag__remove"
          aria-label={computedRemoveLabel}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(event);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
});
