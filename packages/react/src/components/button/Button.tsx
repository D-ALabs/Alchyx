import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import "./button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `inverse` is for deep/dark bands. Default "primary". */
  variant?: ButtonVariant;
  /** Control padding + type scale. Default "md". */
  size?: ButtonSize;
  /**
   * Render as the single child element (merging props + ref) instead of a
   * <button>. Use for `<Button asChild><a href>…</a></Button>`. The loading
   * spinner is not injected in `asChild` mode.
   */
  asChild?: boolean;
  /** Show a spinner and mark the control busy + disabled. */
  loading?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
}

/**
 * Button — the workhorse action. Consolidates the shadcn variant/size API, the
 * Twilio Paste/Astryx ergonomics, and the D-ALabs BT-01…BT-05 recipes. Supports
 * `asChild` (Radix Slot) so it can render as a link or any element.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    asChild = false,
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  const classes = cn(
    "alx-btn",
    `alx-btn--${variant}`,
    `alx-btn--${size}`,
    fullWidth && "alx-btn--block",
    className,
  );

  const nativeProps = asChild
    ? { "aria-disabled": isDisabled || undefined }
    : { disabled: isDisabled, type: type ?? "button" };

  return (
    <Comp
      ref={ref as never}
      className={classes}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      {...nativeProps}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <span className="alx-btn__spinner" aria-hidden="true" />}
          <span className="alx-btn__label">{children}</span>
        </>
      )}
    </Comp>
  );
});
