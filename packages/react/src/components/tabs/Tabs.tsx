"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useControllableState } from "../../lib/useControllableState";
import { useId } from "../../lib/useId";
import "./tabs.css";

type Orientation = "horizontal" | "vertical";

interface TabItem {
  value: string;
  disabled: boolean;
}

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  orientation: Orientation;
  /** Ordered registry of triggers (mutated in place; identity is stable). */
  items: TabItem[];
  register: (item: TabItem) => void;
  unregister: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(part: string): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Tabs>.`);
  return ctx;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled active tab value. */
  value?: string;
  /** Initial active tab value (uncontrolled). */
  defaultValue?: string;
  /** Fires with the newly-selected value. */
  onValueChange?: (value: string) => void;
  /** Layout + arrow-key axis. Default "horizontal". */
  orientation?: Orientation;
}

/**
 * Tabs — an accessible tabs composite (Radix / Base UI pattern). Compose
 * `<Tabs><TabsList><TabsTrigger/></TabsList><TabsContent/></Tabs>`. Roving
 * tabindex + arrow/Home/End keys move focus and activate (automatic activation).
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, orientation = "horizontal", className, children, ...props },
  ref,
) {
  const [active, setActive] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const baseId = useId();

  // Ordered registry of triggers, so exactly one tab is always a tab stop even
  // when no trigger matches the active value. The canonical ordered list lives
  // in a ref (mutated in place by register/unregister, which only run in
  // effects); a render-safe snapshot is mirrored into state for consumers.
  const itemsRef = React.useRef<TabItem[]>([]);
  const [items, setItems] = React.useState<TabItem[]>([]);

  const register = React.useCallback((item: TabItem) => {
    const list = itemsRef.current;
    const i = list.findIndex((it) => it.value === item.value);
    if (i >= 0) {
      if (list[i].disabled === item.disabled) return;
      list[i] = item;
    } else {
      list.push(item);
    }
    setItems(list.slice());
  }, []);

  const unregister = React.useCallback((value: string) => {
    const list = itemsRef.current;
    const i = list.findIndex((it) => it.value === value);
    if (i < 0) return;
    list.splice(i, 1);
    setItems(list.slice());
  }, []);

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      value: active,
      setValue: setActive,
      baseId,
      orientation,
      items,
      register,
      unregister,
    }),
    [active, setActive, baseId, orientation, items, register, unregister],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cn("alx-tabs", `alx-tabs--${orientation}`, className)}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the tablist. */
  "aria-label"?: string;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, ...props },
  ref,
) {
  const { orientation } = useTabsContext("TabsList");
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cn("alx-tabs__list", className)}
      {...props}
    />
  );
});

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The value this tab selects. */
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ value, className, disabled, onClick, onKeyDown, children, ...props }, ref) {
    const { value: active, setValue, baseId, orientation, items, register, unregister } =
      useTabsContext("TabsTrigger");
    const selected = active === value;
    const isDisabled = Boolean(disabled);

    React.useEffect(() => {
      register({ value, disabled: isDisabled });
      return () => unregister(value);
    }, [value, isDisabled, register, unregister]);

    // Guarantee exactly one tab stop: the selected trigger, or — when no trigger
    // matches the active value — the first non-disabled trigger.
    const noneSelected = !items.some((it) => it.value === active);
    const isFirstEnabled = items.find((it) => !it.disabled)?.value === value;
    const isTabStop = selected || (noneSelected && isFirstEnabled);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const list = event.currentTarget.closest('[role="tablist"]');
      if (!list) return;
      const tabs = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      );
      const idx = tabs.indexOf(event.currentTarget);
      if (idx === -1) return;
      const horizontal = orientation === "horizontal";
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
      let target = -1;
      if (event.key === nextKey) target = (idx + 1) % tabs.length;
      else if (event.key === prevKey) target = (idx - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = tabs.length - 1;
      if (target >= 0) {
        event.preventDefault();
        const el = tabs[target];
        el.focus();
        el.click();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${baseId}-tab-${value}`}
        aria-selected={selected}
        aria-controls={`${baseId}-panel-${value}`}
        tabIndex={isTabStop ? 0 : -1}
        data-state={selected ? "active" : "inactive"}
        disabled={disabled}
        className={cn("alx-tabs__trigger", className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setValue(value);
        }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The value that activates this panel. */
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ value, className, children, ...props }, ref) {
    const { value: active, baseId } = useTabsContext("TabsContent");
    const selected = active === value;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        hidden={!selected}
        tabIndex={0}
        data-state={selected ? "active" : "inactive"}
        className={cn("alx-tabs__content", className)}
        {...props}
      >
        {selected ? children : null}
      </div>
    );
  },
);
