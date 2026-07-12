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
import "./dialog.css";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descId: string;
  triggerId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(part: string): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Dialog>.`);
  return ctx;
}

export interface DialogProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Fires with the next open state. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dialog — a modal overlay (Radix / Base UI pattern) composed of Dialog ·
 * DialogTrigger · DialogContent · DialogTitle · DialogDescription · DialogClose.
 * DialogContent portals to the body, traps focus, locks scroll, and dismisses on
 * Escape / outside-press.
 */
export function Dialog({ children, open, defaultOpen, onOpenChange }: DialogProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const baseId = useId();

  const ctx = React.useMemo<DialogContextValue>(
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

  return <DialogContext.Provider value={ctx}>{children}</DialogContext.Provider>;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child element instead of a <button>. */
  asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ asChild = false, onClick, className, ...props }, ref) {
    const { open, setOpen, contentId, triggerId } = useDialogContext("DialogTrigger");
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

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max panel width in px. Default 520. */
  width?: number;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, style, width = 520, ...props }, ref) {
    const { open } = useDialogContext("DialogContent");

    if (!open) return null;

    return (
      <Portal>
        <DialogPanel forwardedRef={ref} className={className} style={style} width={width} {...props}>
          {children}
        </DialogPanel>
      </Portal>
    );
  },
);

interface DialogPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  width: number;
}

/**
 * DialogPanel — internal panel rendered INSIDE <Portal> so its focus-trap /
 * scroll-lock / dismiss effects run in the same commit its DOM node mounts
 * (Portal mounts children a commit later via a `mounted` flag). Not exported.
 */
function DialogPanel({ forwardedRef, className, children, style, width, ...props }: DialogPanelProps) {
  const { setOpen, contentId, titleId, descId } = useDialogContext("DialogContent");
  const panelRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, panelRef);

  useScrollLock(true);
  useFocusTrap(panelRef, true);
  useDismissable(panelRef, {
    enabled: true,
    onEscapeKeyDown: () => setOpen(false),
    onPointerDownOutside: () => setOpen(false),
  });

  return (
    <div className="alx-dialog__overlay" data-state="open">
      <div
        ref={composedRef}
        role="dialog"
        aria-modal="true"
        id={contentId}
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        data-state="open"
        className={cn("alx-dialog__panel", className)}
        style={{ maxWidth: width, ...style }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("alx-dialog__header", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("alx-dialog__footer", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function DialogTitle({ className, ...props }, ref) {
    const { titleId } = useDialogContext("DialogTitle");
    return <h2 ref={ref} id={titleId} className={cn("alx-dialog__title", className)} {...props} />;
  },
);

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function DialogDescription({ className, ...props }, ref) {
  const { descId } = useDialogContext("DialogDescription");
  return <p ref={ref} id={descId} className={cn("alx-dialog__desc", className)} {...props} />;
});

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ asChild = false, onClick, className, ...props }, ref) {
    const { setOpen } = useDialogContext("DialogClose");
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
