"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import "./alert.css";

export type AlertVariant = "info" | "signal" | "caution" | "fault";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Status tone. Drives the tint, the left status bar, the default icon, and the
   * live-region politeness (`fault` / `caution` announce assertively via
   * `role="alert"`; `info` / `signal` use `role="status"`). Default "info".
   */
  variant?: AlertVariant;
  /** Optional bold headline rendered above the body. */
  title?: React.ReactNode;
  /**
   * Leading status icon. Omit to use the tone's default glyph; pass `null` to
   * render no icon; pass a node to override.
   */
  icon?: React.ReactNode;
  /** Render a trailing close button that calls `onDismiss`. */
  dismissible?: boolean;
  /** Fired when the close button is activated. */
  onDismiss?: () => void;
  /** Accessible label for the close button. Default "Dismiss". */
  dismissLabel?: string;
}

/** `role="alert"` (assertive) for the two urgent tones, `role="status"` otherwise. */
const ROLE_BY_VARIANT: Record<AlertVariant, "alert" | "status"> = {
  info: "status",
  signal: "status",
  caution: "alert",
  fault: "alert",
};

/**
 * Alert — a callout / inline banner. Consolidates the Twilio Paste Callout tones,
 * the GitHub Primer Flash anatomy, and the Ant Design Alert API (title + body +
 * dismissible) on the D-ALabs status language: a tone-tinted surface with a left
 * status bar mixed from the tone's own colour. Pass `title` + children for the
 * common case, or compose `AlertTitle` / `AlertDescription` yourself.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = "info",
    title,
    icon,
    dismissible = false,
    onDismiss,
    dismissLabel = "Dismiss",
    className,
    children,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const iconNode = icon === undefined ? DEFAULT_ICONS[variant] : icon;

  return (
    <div
      ref={ref}
      role={ROLE_BY_VARIANT[variant]}
      aria-labelledby={title ? titleId : undefined}
      className={cn("alx-alert", `alx-alert--${variant}`, className)}
      {...props}
    >
      {iconNode != null && (
        <span className="alx-alert__icon" aria-hidden="true">
          {iconNode}
        </span>
      )}

      <div className="alx-alert__content">
        {title != null && <AlertTitle id={titleId}>{title}</AlertTitle>}
        {children != null && <AlertDescription>{children}</AlertDescription>}
      </div>

      {dismissible && (
        <button
          type="button"
          className="alx-alert__close"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
});

/** The bold headline line of an Alert. */
export const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return <div ref={ref} className={cn("alx-alert__title", className)} {...props} />;
  },
);

/** The body / description text of an Alert. */
export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AlertDescription({ className, ...props }, ref) {
  return <div ref={ref} className={cn("alx-alert__body", className)} {...props} />;
});

/* -- Default tone glyphs (16px, inherit currentColor from the icon slot). ----- */

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5" strokeLinecap="round" />
      <circle cx="8" cy="4.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.4 8.2 7.2 10l3.4-3.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CautionIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M8 1.9 15 13.6a.9.9 0 0 1-.78 1.35H1.78A.9.9 0 0 1 1 13.6L8 1.9Z"
        strokeLinejoin="round"
      />
      <path d="M8 6.2v3" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FaultIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="m6 6 4 4M10 6l-4 4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

const DEFAULT_ICONS: Record<AlertVariant, React.ReactNode> = {
  info: <InfoIcon />,
  signal: <SignalIcon />,
  caution: <CautionIcon />,
  fault: <FaultIcon />,
};
