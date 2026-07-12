"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import { VisuallyHidden } from "../../lib/VisuallyHidden";
import "./icon-button.css";

export type IconButtonVariant = "primary" | "secondary" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  /** Visual style — mirrors Button's fills. Default "secondary". */
  variant?: IconButtonVariant;
  /** Square control size. Default "md". */
  size?: IconButtonSize;
  /**
   * Required accessible name for the icon-only control. It is rendered as
   * VisuallyHidden text *and* mirrored onto `aria-label`, so the button always
   * has a name for assistive tech regardless of the glyph.
   */
  label: string;
  /**
   * Render as the single child element (merging props + ref) instead of a
   * `<button>` — e.g. `<IconButton asChild><a href>…</a></IconButton>`. In this
   * mode the child owns the icon markup; the accessible name comes from
   * `aria-label` only (no injected VisuallyHidden span).
   */
  asChild?: boolean;
  /** The icon glyph (decorative — the accessible name comes from `label`). */
  children: React.ReactNode;
}

/**
 * IconButton — a square, icon-only action. Mirrors Button's primary / secondary
 * / ghost looks with equal padding on all sides and `--radius-control`. Follows
 * the GitHub Primer + Fluent UI convention of *requiring* an accessible name:
 * pass `label`, which is announced to screen readers and set as `aria-label`.
 * Supports `asChild` (Slot) so it can render as a link or any element.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = "secondary",
    size = "md",
    label,
    asChild = false,
    className,
    children,
    disabled,
    type,
    tabIndex,
    onClick,
    onKeyDown,
    ...props
  },
  ref,
) {
  const Comp: React.ElementType = asChild ? Slot : "button";

  const classes = cn(
    "alx-icon-btn",
    `alx-icon-btn--${variant}`,
    `alx-icon-btn--${size}`,
    className,
  );

  const nativeProps = asChild
    ? { "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : tabIndex }
    : { disabled, type: type ?? "button", tabIndex };

  return (
    <Comp
      ref={ref as never}
      className={classes}
      aria-label={label}
      {...nativeProps}
      {...props}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        (onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        (onKeyDown as React.KeyboardEventHandler<HTMLElement> | undefined)?.(event);
      }}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className="alx-icon-btn__icon" aria-hidden="true">
            {children}
          </span>
          <VisuallyHidden>{label}</VisuallyHidden>
        </>
      )}
    </Comp>
  );
});
