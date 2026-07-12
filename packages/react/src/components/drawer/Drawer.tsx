"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import { Portal } from "../../lib/Portal";
import { useComposedRefs } from "../../lib/composeRefs";
import { useControllableState } from "../../lib/useControllableState";
import { useId } from "../../lib/useId";
import { useFocusTrap } from "../../lib/useFocusTrap";
import { useScrollLock } from "../../lib/useScrollLock";
import { useDismissable } from "../../lib/useDismissable";
import "./drawer.css";

/** Edge the sheet slides in from. */
export type DrawerSide = "left" | "right" | "top" | "bottom";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descId: string;
  triggerId: string;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext(part: string): DrawerContextValue {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Drawer>.`);
  return ctx;
}

export interface DrawerProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Fires with the next open state. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Drawer — a modal side sheet (the Ant Design Drawer / Base UI overlay pattern)
 * composed of Drawer · DrawerTrigger · DrawerContent · DrawerHeader ·
 * DrawerTitle · DrawerDescription · DrawerFooter · DrawerClose. It reuses the
 * Dialog primitive stack — DrawerContent portals to the body, traps focus, locks
 * scroll, and dismisses on Escape / outside-press — but slides in from an edge.
 */
export function Drawer({ children, open, defaultOpen, onOpenChange }: DrawerProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const baseId = useId();

  const ctx = React.useMemo<DrawerContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      contentId: `${baseId}-content`,
      titleId: `${baseId}-title`,
      descId: `${baseId}-desc`,
      triggerId: `${baseId}-trigger`,
    }),
    [isOpen, setIsOpen, baseId],
  );

  return <DrawerContext.Provider value={ctx}>{children}</DrawerContext.Provider>;
}

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child element instead of a <button>. */
  asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger({ asChild = false, onClick, className, ...props }, ref) {
    const { open, setOpen, contentId, triggerId } = useDrawerContext("DrawerTrigger");
    const Comp: React.ElementType = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as never}
        id={triggerId}
        className={cn(className)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        data-state={open ? "open" : "closed"}
        {...(asChild ? {} : { type: "button" as const })}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
        {...props}
      />
    );
  },
);

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which edge the sheet slides in from. Default "right". */
  side?: DrawerSide;
  /**
   * Sheet thickness in px — width for left/right, height for top/bottom.
   * Default 380.
   */
  size?: number;
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(
    { className, children, style, side = "right", size = 380, ...props },
    ref,
  ) {
    const { open, setOpen, contentId, titleId, descId } = useDrawerContext("DrawerContent");

    if (!open) return null;

    return (
      <Portal>
        <DrawerPanel
          forwardedRef={ref}
          className={className}
          style={style}
          side={side}
          size={size}
          setOpen={setOpen}
          contentId={contentId}
          titleId={titleId}
          descId={descId}
          {...props}
        >
          {children}
        </DrawerPanel>
      </Portal>
    );
  },
);

interface DrawerPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  side: DrawerSide;
  size: number;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descId: string;
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}

/**
 * DrawerPanel — the mounted overlay + sheet. Rendered inside <Portal> so its
 * own DOM node exists in the same commit its effects run; the focus-trap /
 * scroll-lock / dismiss hooks therefore see a live panel ref (unlike an effect
 * on DrawerContent, whose ref stays null until Portal mounts a commit later).
 */
function DrawerPanel({
  className,
  children,
  style,
  side,
  size,
  setOpen,
  contentId,
  titleId,
  descId,
  forwardedRef,
  ...props
}: DrawerPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, panelRef);

  useScrollLock(true);
  useFocusTrap(panelRef, true);
  useDismissable(panelRef, {
    enabled: true,
    onEscapeKeyDown: () => setOpen(false),
    onPointerDownOutside: () => setOpen(false),
  });

  const isHorizontal = side === "left" || side === "right";
  const sizeStyle: React.CSSProperties = isHorizontal ? { width: size } : { height: size };

  return (
    <div className="alx-drawer__overlay" data-state="open">
      <div
        ref={composedRef}
        role="dialog"
        aria-modal="true"
        id={contentId}
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        data-state="open"
        data-side={side}
        className={cn("alx-drawer__panel", `alx-drawer__panel--${side}`, className)}
        style={{ ...sizeStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("alx-drawer__header", className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("alx-drawer__footer", className)} {...props} />;
}

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function DrawerTitle({ className, ...props }, ref) {
  const { titleId } = useDrawerContext("DrawerTitle");
  return <h2 ref={ref} id={titleId} className={cn("alx-drawer__title", className)} {...props} />;
});

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function DrawerDescription({ className, ...props }, ref) {
  const { descId } = useDrawerContext("DrawerDescription");
  return <p ref={ref} id={descId} className={cn("alx-drawer__desc", className)} {...props} />;
});

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child element instead of a <button>. */
  asChild?: boolean;
}

export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  function DrawerClose({ asChild = false, onClick, className, ...props }, ref) {
    const { setOpen } = useDrawerContext("DrawerClose");
    const Comp: React.ElementType = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as never}
        className={cn(className)}
        {...(asChild ? {} : { type: "button" as const })}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  },
);
