"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./avatar.css";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "signal" | "caution" | "fault";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. When omitted or it fails to load, initials from `name` show instead. */
  src?: string;
  /** Person / entity name — the accessible label and the source of the initials fallback. */
  name: string;
  /** Diameter + type scale. Default "md". */
  size?: AvatarSize;
  /** Presence dot rendered in the lower-right corner. */
  status?: AvatarStatus;
  /**
   * Accessible label for the status dot, appended to the avatar name. Defaults to
   * the capitalized status token (e.g. "Signal").
   */
  statusLabel?: string;
}

const STATUS_FALLBACK: Record<AvatarStatus, string> = {
  signal: "Signal",
  caution: "Caution",
  fault: "Fault",
};

/** Derive up to two initials from a name: first letter of the first + last word. */
function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0] ?? "";
  if (words.length === 1) return first.toUpperCase();
  const last = Array.from(words[words.length - 1])[0] ?? "";
  return (first + last).toUpperCase();
}

/**
 * Avatar — a circular representation of a person or entity, consolidating the
 * GitHub Primer / Fluent UI presence anatomy with Ant Design's grouping. Renders
 * an image when `src` loads; otherwise falls back to initials derived from `name`
 * on the neutral `--av-*` ramp. An optional `status` dot marks presence.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = "md", status, statusLabel, className, ...props },
  ref,
) {
  const [errored, setErrored] = React.useState(false);

  // Retry the image whenever the src changes.
  React.useEffect(() => {
    setErrored(false);
  }, [src]);

  const showImage = Boolean(src) && !errored;
  const statusText = status ? statusLabel ?? STATUS_FALLBACK[status] : undefined;
  const label = statusText ? `${name}, ${statusText}` : name;

  return (
    <span
      ref={ref}
      role="img"
      aria-label={label || undefined}
      className={cn("alx-avatar", `alx-avatar--${size}`, className)}
      {...props}
    >
      {showImage ? (
        // Portable design-system primitive: a plain <img> (no Next.js coupling).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="alx-avatar__img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="alx-avatar__initials" aria-hidden="true">
          {initialsFrom(name)}
        </span>
      )}
      {status && (
        <span
          className={cn("alx-avatar__status", `alx-avatar__status--${status}`)}
          aria-hidden="true"
        />
      )}
    </span>
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to render. When the child count exceeds this, the
   * remainder collapses into a trailing "+N" avatar.
   */
  max?: number;
  /** Size applied to every child avatar (and the "+N" overflow). Default "md". */
  size?: AvatarSize;
}

/**
 * AvatarGroup — overlaps its `Avatar` children into a stack (Ant Design's
 * `Avatar.Group`, Primer's `AvatarStack`). Set `max` to collapse the overflow
 * into a "+N" bubble. `size` cascades to children that don't set their own.
 */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ max, size = "md", className, children, ...props }, ref) {
    const items = React.Children.toArray(children).filter(
      React.isValidElement,
    ) as React.ReactElement<AvatarProps>[];

    const limit = max != null && max < items.length ? max : items.length;
    const shown = items.slice(0, limit);
    const overflow = items.length - limit;

    return (
      <div
        ref={ref}
        role="group"
        className={cn("alx-avatar-group", `alx-avatar-group--${size}`, className)}
        {...props}
      >
        {shown.map((child, i) =>
          React.cloneElement(child, {
            key: child.key ?? i,
            size: child.props.size ?? size,
          }),
        )}
        {overflow > 0 && (
          <span
            className={cn("alx-avatar", `alx-avatar--${size}`, "alx-avatar-group__overflow")}
            role="img"
            aria-label={`${overflow} more`}
          >
            <span className="alx-avatar__initials" aria-hidden="true">
              +{overflow}
            </span>
          </span>
        )}
      </div>
    );
  },
);
