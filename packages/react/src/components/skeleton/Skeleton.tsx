"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./skeleton.css";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Placeholder shape. `text` is a pill-rounded line, `circle` an avatar/dot, `rect` a media block. Default "text". */
  variant?: SkeletonVariant;
  /** Explicit width. A number is treated as pixels; a string is used verbatim (e.g. "60%"). Falls back to the variant default. */
  width?: string | number;
  /** Explicit height. A number is treated as pixels; a string is used verbatim. Falls back to the variant default. */
  height?: string | number;
}

/**
 * Skeleton — a loading placeholder that shimmers while content is fetched,
 * reducing layout shift and perceived latency. Follows the Ant Design Skeleton
 * composition model and the Fluent UI shimmer treatment: a calm, accent-free
 * gradient that sweeps a `--bd-hov` band across a `--bd2` base and pauses under
 * reduced-motion. It is `aria-hidden` so assistive tech announces the resolved
 * content, not the placeholder — compose several to mirror the incoming layout.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = "text", width, height, className, style, ...props },
  ref,
) {
  const mergedStyle: React.CSSProperties = { ...style };
  if (width !== undefined) mergedStyle.width = width;
  if (height !== undefined) mergedStyle.height = height;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("alx-skeleton", `alx-skeleton--${variant}`, className)}
      style={mergedStyle}
      {...props}
    />
  );
});
