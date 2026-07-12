"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useControllableState } from "../../lib/useControllableState";
import { useId } from "../../lib/useId";
import "./accordion.css";

/* ---------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------- */

interface AccordionContextValue {
  isItemOpen: (value: string) => boolean;
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext(part: string): AccordionContextValue {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Accordion>.`);
  return ctx;
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext(part: string): AccordionItemContextValue {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <AccordionItem>.`);
  return ctx;
}

/** Normalise a single value or a list into the internal array of open values. */
function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

/** One-open-at-a-time accordion. `value` / `defaultValue` are a single string. */
export interface AccordionSingleProps {
  /** Only one item open at a time (default). */
  type?: "single";
  /** Controlled open item value (`""` = all collapsed). */
  value?: string;
  /** Initially open item value (uncontrolled). */
  defaultValue?: string;
  /** Fires with the newly open item value (`""` when collapsed). */
  onValueChange?: (value: string) => void;
  /** Allow closing the open item so none remains open. Single mode only. */
  collapsible?: boolean;
}

/** Multi-open accordion. `value` / `defaultValue` are a list of strings. */
export interface AccordionMultipleProps {
  /** Any number of items may be open at once. */
  type: "multiple";
  /** Controlled list of open item values. */
  value?: string[];
  /** Initially open item values (uncontrolled). */
  defaultValue?: string[];
  /** Fires with the next list of open item values. */
  onValueChange?: (value: string[]) => void;
  /** Not applicable in multiple mode. */
  collapsible?: never;
}

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) &
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">;

/**
 * Accordion — a disclosure composite in the Radix Primitives / Base UI shape,
 * with Ant Design's `single` / `multiple` accordion modes. Compose
 * `<Accordion><AccordionItem><AccordionTrigger/><AccordionContent/></AccordionItem></Accordion>`.
 * Controllable or uncontrolled via `value` / `defaultValue` / `onValueChange`
 * (a string in `single` mode, a string[] in `multiple` mode).
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    type = "single",
    value,
    defaultValue,
    onValueChange,
    collapsible = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const handleChange = React.useCallback(
    (next: string[]) => {
      if (type === "multiple") {
        (onValueChange as ((v: string[]) => void) | undefined)?.(next);
      } else {
        (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? "");
      }
    },
    [type, onValueChange],
  );

  const [openValues, setOpenValues] = useControllableState<string[]>({
    value: value === undefined ? undefined : toArray(value),
    defaultValue: toArray(defaultValue),
    onChange: handleChange,
  });

  const isItemOpen = React.useCallback(
    (itemValue: string) => openValues.includes(itemValue),
    [openValues],
  );

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      setOpenValues((prev) => {
        const open = prev.includes(itemValue);
        if (type === "multiple") {
          return open ? prev.filter((v) => v !== itemValue) : [...prev, itemValue];
        }
        if (open) return collapsible ? [] : prev;
        return [itemValue];
      });
    },
    [setOpenValues, type, collapsible],
  );

  const ctx = React.useMemo<AccordionContextValue>(
    () => ({ isItemOpen, toggleItem }),
    [isItemOpen, toggleItem],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div ref={ref} className={cn("alx-accordion", className)} data-type={type} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

/* ---------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique key that ties this item's trigger and content together. */
  value: string;
  /** Disable the whole item — its trigger is not focusable or activatable. */
  disabled?: boolean;
}

/** A single disclosure. Provides the trigger/content pairing context. */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ value, disabled = false, className, children, ...props }, ref) {
    const { isItemOpen } = useAccordionContext("AccordionItem");
    const open = isItemOpen(value);
    const baseId = useId();

    const ctx = React.useMemo<AccordionItemContextValue>(
      () => ({
        value,
        open,
        disabled,
        triggerId: `${baseId}-trigger`,
        contentId: `${baseId}-content`,
      }),
      [value, open, disabled, baseId],
    );

    return (
      <AccordionItemContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn("alx-accordion__item", className)}
          data-state={open ? "open" : "closed"}
          data-disabled={disabled || undefined}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);

/* ---------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------- */

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Heading level of the wrapping `<h*>` element. Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * The header button that toggles its item. Rendered inside a heading element so
 * assistive tech can navigate by heading. Enter/Space toggle; ArrowUp/ArrowDown
 * (and Home/End) move focus between the accordion's triggers.
 */
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { headingLevel = 3, className, children, disabled, onClick, onKeyDown, ...props },
    ref,
  ) {
    const { toggleItem } = useAccordionContext("AccordionTrigger");
    const {
      value,
      open,
      disabled: itemDisabled,
      triggerId,
      contentId,
    } = useAccordionItemContext("AccordionTrigger");
    const isDisabled = disabled || itemDisabled;
    const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const { key } = event;
      if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
      const root = event.currentTarget.closest(".alx-accordion");
      if (!root) return;
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>(".alx-accordion__trigger:not([disabled])"),
      ).filter((t) => t.closest(".alx-accordion") === root);
      const idx = triggers.indexOf(event.currentTarget);
      if (idx === -1) return;
      let next: number;
      if (key === "ArrowDown") next = (idx + 1) % triggers.length;
      else if (key === "ArrowUp") next = (idx - 1 + triggers.length) % triggers.length;
      else if (key === "Home") next = 0;
      else next = triggers.length - 1;
      event.preventDefault();
      triggers[next]?.focus();
    };

    return (
      <Heading className="alx-accordion__header">
        <button
          ref={ref}
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={contentId}
          disabled={isDisabled}
          data-state={open ? "open" : "closed"}
          className={cn("alx-accordion__trigger", className)}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            toggleItem(value);
          }}
          onKeyDown={handleKeyDown}
          {...props}
        >
          <span className="alx-accordion__trigger-label">{children}</span>
          <svg
            className="alx-accordion__chevron"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Heading>
    );
  },
);

/* ---------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------- */

export type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * The collapsible region for an item. `role="region"`, labelled by its trigger,
 * removed from the accessibility tree while collapsed, and revealed with a calm
 * fade-in when it opens.
 */
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, children, ...props }, ref) {
    const { open, triggerId, contentId } = useAccordionItemContext("AccordionContent");
    return (
      <div
        ref={ref}
        role="region"
        id={contentId}
        aria-labelledby={triggerId}
        hidden={!open}
        data-state={open ? "open" : "closed"}
        className={cn("alx-accordion__content", className)}
        {...props}
      >
        <div className="alx-accordion__content-inner">{children}</div>
      </div>
    );
  },
);
