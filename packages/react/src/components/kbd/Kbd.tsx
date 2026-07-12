"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./kbd.css";

export type KbdSize = "sm" | "md";

export interface KbdProps extends React.ComponentPropsWithoutRef<"kbd"> {
  /** Cap size — `sm` sits inline in prose, `md` stands alone in shortcut rows. Default "md". */
  size?: KbdSize;
}

/**
 * Kbd — a single printed keyboard key. Renders a native `<kbd>` element styled
 * as a physical keycap: mono caps on a translucent inset well, a hairline
 * border, and a subtle inset shadow. Modeled on GitHub Primer's Kbd.
 *
 * Compose a multi-key shortcut by placing several keys side by side with a
 * separator, e.g. `<Kbd>⌘</Kbd> + <Kbd>K</Kbd>`.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { size = "md", className, children, ...props },
  ref,
) {
  return (
    <kbd ref={ref} className={cn("alx-kbd", `alx-kbd--${size}`, className)} {...props}>
      {children}
    </kbd>
  );
});
