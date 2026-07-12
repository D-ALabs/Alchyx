"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import { Portal } from "../../lib/Portal";
import { useComposedRefs } from "../../lib/composeRefs";
import { useControllableState } from "../../lib/useControllableState";
import { useId } from "../../lib/useId";
import { useDismissable } from "../../lib/useDismissable";
import { useIsomorphicLayoutEffect } from "../../lib/useIsomorphicLayoutEffect";
import "./dropdown-menu.css";

/** Where keyboard focus should land when the menu opens. */
type FocusIntent = "first" | "last";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The trigger element — read for positioning + focus restoration. */
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  /** Which item to focus on the next open (set by keyboard opening). */
  intentRef: React.MutableRefObject<FocusIntent>;
  contentId: string;
  triggerId: string;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(part: string): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <DropdownMenu>.`);
  return ctx;
}

/** Enabled menu items, in DOM order, inside the given content element. */
function getEnabledItems(content: HTMLElement): HTMLElement[] {
  return Array.from(
    content.querySelectorAll<HTMLElement>('[role="menuitem"]:not([data-disabled])'),
  );
}

export interface DropdownMenuProps {
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state (uncontrolled). Default false. */
  defaultOpen?: boolean;
  /** Fires with the next open state. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * DropdownMenu — a menu button plus a popup menu (the Radix Primitives / Base UI
 * pattern). Compose `<DropdownMenu>` with `DropdownMenuTrigger`,
 * `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, and
 * `DropdownMenuLabel`. The content portals to the body, positions itself under
 * the trigger's start edge, roves focus with the arrow keys, and dismisses on
 * Escape / outside-press.
 */
export function DropdownMenu({ children, open, defaultOpen, onOpenChange }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const intentRef = React.useRef<FocusIntent>("first");
  const baseId = useId();

  const ctx = React.useMemo<DropdownMenuContextValue>(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      triggerRef,
      intentRef,
      contentId: `${baseId}-content`,
      triggerId: `${baseId}-trigger`,
    }),
    [isOpen, setIsOpen, baseId],
  );

  return <DropdownMenuContext.Provider value={ctx}>{children}</DropdownMenuContext.Provider>;
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child element (merging props + ref) instead of a <button>. */
  asChild?: boolean;
}

/**
 * DropdownMenuTrigger — the button that toggles the menu. Exposes
 * `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`. ArrowDown/ArrowUp
 * open the menu focused on the first / last item.
 */
export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ asChild = false, onClick, onKeyDown, className, ...props }, ref) {
    const { open, setOpen, triggerRef, intentRef, contentId, triggerId } =
      useDropdownMenuContext("DropdownMenuTrigger");

    const setTriggerRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
      },
      [triggerRef],
    );
    const composedRef = useComposedRefs(ref, setTriggerRef);

    const Comp: React.ElementType = asChild ? Slot : "button";

    return (
      <Comp
        ref={composedRef as never}
        id={triggerId}
        className={cn(className)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        data-state={open ? "open" : "closed"}
        {...(asChild ? {} : { type: "button" as const })}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            intentRef.current = event.key === "ArrowUp" ? "last" : "first";
            setOpen(true);
          }
        }}
        {...props}
      />
    );
  },
);

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap in px between the trigger's bottom edge and the menu. Default 6. */
  sideOffset?: number;
}

/**
 * DropdownMenuContent — the popup surface. Portals to the body, renders with
 * `role="menu"`, and is fixed-positioned under the trigger's start edge (read
 * from the trigger's bounding rect on open and on scroll / resize). Handles
 * ArrowUp/ArrowDown/Home/End roving and Tab-to-close; Escape and outside-press
 * are handled by `useDismissable`.
 */
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
    { className, children, style, onKeyDown, sideOffset = 6, ...props },
    ref,
  ) {
    const { open, setOpen, triggerRef, intentRef, contentId, triggerId } =
      useDropdownMenuContext("DropdownMenuContent");
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs<HTMLDivElement>(ref, contentRef, setContentEl);

    const [position, setPosition] = React.useState<{
      top: number;
      left: number;
      minWidth: number;
    } | null>(null);

    // Measure the trigger before paint (no flash) and keep aligned on scroll/resize.
    useIsomorphicLayoutEffect(() => {
      if (!open) {
        setPosition(null);
        return;
      }
      const measure = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        setPosition({ top: rect.bottom + sideOffset, left: rect.left, minWidth: rect.width });
      };
      measure();
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    }, [open, sideOffset, triggerRef]);

    // Move focus into the menu once it is painted (visible), honouring the
    // keyboard open intent (first vs last item).
    React.useEffect(() => {
      if (!open) return;
      const content = contentEl;
      if (!content) return;
      const items = getEnabledItems(content);
      const intent = intentRef.current;
      intentRef.current = "first";
      if (items.length === 0) {
        content.focus();
        return;
      }
      (intent === "last" ? items[items.length - 1] : items[0]).focus();
    }, [open, intentRef, contentEl]);

    useDismissable(contentRef, {
      enabled: open,
      onEscapeKeyDown: () => {
        setOpen(false);
        triggerRef.current?.focus();
      },
      onPointerDownOutside: (event) => {
        // Let the trigger's own click toggle the menu instead of double-firing.
        const trigger = triggerRef.current;
        if (trigger && trigger.contains(event.target as Node)) return;
        setOpen(false);
      },
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const content = contentRef.current;
      if (!content) return;

      if (event.key === "Tab") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const items = getEnabledItems(content);
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const index = active ? items.indexOf(active) : -1;

      let next = -1;
      switch (event.key) {
        case "ArrowDown":
          next = index < 0 ? 0 : (index + 1) % items.length;
          break;
        case "ArrowUp":
          next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = items.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      items[next]?.focus();
    };

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={composedRef}
          role="menu"
          id={contentId}
          aria-labelledby={triggerId}
          aria-orientation="vertical"
          tabIndex={-1}
          data-state="open"
          className={cn("alx-menu", className)}
          style={{
            position: "fixed",
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            minWidth: position?.minWidth,
            visibility: position ? undefined : "hidden",
            ...style,
          }}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

export interface DropdownMenuItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  /** Called when the item is activated (click / Enter / Space). */
  onSelect?: () => void;
}

/**
 * DropdownMenuItem — a selectable row (`role="menuitem"`). Fires `onSelect`, then
 * closes the menu and restores focus to the trigger. Set `disabled` to make it
 * inert and skipped by arrow-key navigation.
 */
export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ className, onSelect, onClick, disabled, children, ...props }, ref) {
    const { setOpen, triggerRef } = useDropdownMenuContext("DropdownMenuItem");
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        data-disabled={disabled || undefined}
        className={cn("alx-menu__item", className)}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          onSelect?.();
          setOpen(false);
          triggerRef.current?.focus();
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/** A visual + semantic divider between groups of items (`role="separator"`). */
export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn("alx-menu__separator", className)}
      {...props}
    />
  );
});

/** A non-interactive, mono-caps section heading inside the menu. */
export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return <div ref={ref} className={cn("alx-menu__label", className)} {...props} />;
});
