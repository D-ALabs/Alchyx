"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import { useDismissable } from "../../lib/useDismissable";
import "./tooltip.css";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** The tip's message. Rendered in the bubble and wired to the trigger via aria-describedby. */
  content: React.ReactNode;
  /** Which edge of the trigger the bubble anchors to. No collision flipping. Default "top". */
  side?: TooltipSide;
  /** How long, in ms, to wait after hover / focus before showing the bubble. Default 200. */
  delay?: number;
  /**
   * The single trigger element. It is cloned to attach the hover / focus
   * handlers and `aria-describedby`, so it must accept those props and a ref is
   * not required.
   */
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  /** Extra class for the positioning wrapper (`span.alx-tooltip`). */
  className?: string;
}

/**
 * Tooltip — a hover + keyboard-focus hint following the Radix Primitives / Base
 * UI tooltip pattern. It wraps a single trigger, shows a small deep-band bubble
 * after `delay`, and dismisses on leave / blur / Escape. The bubble is always in
 * the DOM with `role="tooltip"` and linked by `aria-describedby`, so assistive
 * tech announces it whenever the trigger is focused. Positioning is transform-
 * based per `side` with no collision detection.
 */
export function Tooltip({ content, side = "top", delay = 200, children, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const tipId = useId();

  const clear = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const show = React.useCallback(() => {
    clear();
    timeoutRef.current = window.setTimeout(() => setOpen(true), delay);
  }, [clear, delay]);

  const hide = React.useCallback(() => {
    clear();
    setOpen(false);
  }, [clear]);

  // Clear any pending timer if the component unmounts mid-delay.
  React.useEffect(() => clear, [clear]);

  useDismissable(wrapperRef, {
    enabled: open,
    onEscapeKeyDown: hide,
    blocksParentFocusTrap: false,
  });

  // Nothing to describe — pass the trigger through untouched.
  if (content == null || content === false) return children;

  const childProps = children.props;
  const describedBy = [childProps["aria-describedby"], tipId].filter(Boolean).join(" ");

  const trigger = React.cloneElement(children, {
    "aria-describedby": describedBy,
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      show();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      hide();
    },
  });

  return (
    <span ref={wrapperRef} className={cn("alx-tooltip", className)}>
      {trigger}
      <span
        id={tipId}
        role="tooltip"
        className={cn("alx-tooltip__bubble", `alx-tooltip__bubble--${side}`)}
        data-state={open ? "open" : "closed"}
      >
        {content}
        <span className="alx-tooltip__arrow" aria-hidden="true" />
      </span>
    </span>
  );
}
