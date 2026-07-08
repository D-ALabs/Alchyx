import * as React from "react";
import { cn } from "./cn";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * VisuallyHidden — visually hides content while keeping it available to screen
 * readers (labels for icon-only controls, live-region text, etc.).
 */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, ...props }, ref) {
    return <span ref={ref} className={cn("alx-visually-hidden", className)} {...props} />;
  },
);
