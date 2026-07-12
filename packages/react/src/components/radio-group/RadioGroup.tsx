"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useControllableState } from "../../lib/useControllableState";
import { useComposedRefs } from "../../lib/composeRefs";
import { useId } from "../../lib/useId";
import { useIsomorphicLayoutEffect } from "../../lib/useIsomorphicLayoutEffect";
import { useFormReset } from "../../lib/useFormReset";
import "./radio-group.css";

export type RadioGroupOrientation = "vertical" | "horizontal";

interface RadioGroupContextValue {
  /** The selected value, or "" when nothing is selected. */
  value: string;
  /** Commit a new selected value. */
  setValue: (value: string) => void;
  /** Arrow-key axis + layout. */
  orientation: RadioGroupOrientation;
  /** Disables every item in the group. */
  disabled: boolean;
  /**
   * The value holding the single roving tab stop: the checked item when it is
   * enabled, otherwise the first enabled item. Keeps the group reachable with
   * one Tab press even when the selected value is disabled or unrendered.
   */
  tabStop: string | undefined;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(part: string): RadioGroupContextValue {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <RadioGroup>.`);
  return ctx;
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value (uncontrolled). */
  defaultValue?: string;
  /** Fires with the newly-selected value. */
  onValueChange?: (value: string) => void;
  /** Layout + arrow-key axis. Default "vertical". */
  orientation?: RadioGroupOrientation;
  /** Disable every item in the group. */
  disabled?: boolean;
  /** Form field name used to submit the selected item value. */
  name?: string;
  /** Require a selection before the owner form can submit. */
  required?: boolean;
  /** Id of an associated form when the group is rendered outside it. */
  form?: string;
}

/**
 * RadioGroup — an accessible single-choice composite following the Radix
 * Primitives / Base UI radio-group pattern. Compose
 * `<RadioGroup><RadioGroupItem value="…" label="…" /></RadioGroup>`.
 *
 * Selection is controllable (`value` / `defaultValue` / `onValueChange`) via
 * useControllableState. Keyboard behaviour is roving tabindex: exactly one item
 * is in the Tab sequence (the checked item when enabled, otherwise the first
 * enabled one), and the Arrow keys move focus **and** select the next enabled
 * item, wrapping at the ends.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      value,
      defaultValue,
      onValueChange,
      orientation = "vertical",
      disabled = false,
      name,
      required,
      form,
      className,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const [selected, setSelected] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange: onValueChange,
    });

    const rootRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, rootRef);
    const [tabStop, setTabStop] = React.useState<string | undefined>(undefined);
    const reset = React.useCallback(() => {
      if (value === undefined) setSelected(defaultValue ?? "");
    }, [value, defaultValue, setSelected]);
    useFormReset(rootRef, form, reset);

    // Determine the single roving tab stop: the checked item when it is enabled,
    // otherwise the first enabled item in DOM order. This keeps the group Tab-
    // reachable even when the selected value is disabled or maps to no rendered
    // item. React bails out when the value is unchanged, so re-running after each
    // render is cheap and self-settling.
    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const target =
        root.querySelector<HTMLElement>(
          '[role="radio"][data-state="checked"]:not([data-disabled])',
        ) ?? root.querySelector<HTMLElement>('[role="radio"]:not([data-disabled])');
      setTabStop(target?.dataset.value);
    });

    const ctx = React.useMemo<RadioGroupContextValue>(
      () => ({ value: selected, setValue: setSelected, orientation, disabled, tabStop }),
      [selected, setSelected, orientation, disabled, tabStop],
    );

    return (
      <RadioGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          aria-orientation={orientation}
          data-orientation={orientation}
          className={cn("alx-radio-group", `alx-radio-group--${orientation}`, className)}
          {...props}
        >
          {children}
          {(name || required) && (
            <input
              type="text"
              className="alx-visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              name={name}
              value={selected}
              required={required}
              disabled={disabled}
              form={form}
              onChange={() => undefined}
              onInvalid={(event) => {
                if (event.defaultPrevented) return;
                event.preventDefault();
                const root = rootRef.current;
                const target =
                  root?.querySelector<HTMLButtonElement>(
                    '[role="radio"][data-state="checked"]:not([disabled])',
                  ) ?? root?.querySelector<HTMLButtonElement>('[role="radio"]:not([disabled])');
                target?.focus();
              }}
            />
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

export interface RadioGroupItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** The value this item selects. Required and unique within the group. */
  value: string;
  /** The visible, accessible label. Falls back to `children` when omitted. */
  label?: React.ReactNode;
}

/**
 * RadioGroupItem — one option inside a {@link RadioGroup}. Renders a real
 * `<button role="radio">` with `aria-checked`, a custom dot that fills with the
 * accent when selected, and roving-tabindex wiring. Set `disabled` to skip it in
 * both the Tab sequence and Arrow-key navigation.
 */
export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  function RadioGroupItem(
    { value, label, className, disabled, id, children, onClick, onKeyDown, ...props },
    ref,
  ) {
    const ctx = useRadioGroupContext("RadioGroupItem");
    const autoId = useId(id);
    const checked = ctx.value !== "" && ctx.value === value;
    const isDisabled = Boolean(disabled) || ctx.disabled;
    // Roving tabindex: exactly one item holds the tab stop — the checked item
    // when enabled, otherwise the first enabled item — so the whole group costs
    // one Tab press. A disabled item is never focusable, so never the tab stop.
    const tabbable = !isDisabled && ctx.tabStop === value;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const group = event.currentTarget.closest('[role="radiogroup"]');
      if (!group) return;
      const items = Array.from(
        group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([data-disabled])'),
      );
      const index = items.indexOf(event.currentTarget);
      if (index === -1) return;

      const horizontal = ctx.orientation === "horizontal";
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
      let target = -1;
      if (event.key === nextKey) target = (index + 1) % items.length;
      else if (event.key === prevKey) target = (index - 1 + items.length) % items.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = items.length - 1;

      if (target >= 0) {
        event.preventDefault();
        const el = items[target];
        el.focus();
        el.click(); // moving focus also selects, per the radio-group pattern
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        id={autoId}
        data-value={value}
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={isDisabled || undefined}
        disabled={isDisabled}
        tabIndex={tabbable ? 0 : -1}
        className={cn("alx-radio-item", className)}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          ctx.setValue(value);
        }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className="alx-radio-item__dot" aria-hidden="true" />
        <span className="alx-radio-item__label">{label ?? children}</span>
      </button>
    );
  },
);
