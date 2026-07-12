"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useComposedRefs } from "../../lib/composeRefs";
import { useControllableState } from "../../lib/useControllableState";
import { useIsomorphicLayoutEffect } from "../../lib/useIsomorphicLayoutEffect";
import { useFormReset } from "../../lib/useFormReset";
import "./checkbox.css";

export type CheckboxSize = "sm" | "md";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "checked" | "defaultChecked" | "onChange" | "size" | "type"
  > {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state (uncontrolled). */
  defaultChecked?: boolean;
  /** Fires with the next checked value. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Show the partial / mixed state (a dash instead of a check). Also mirrored
   * onto the native input's `.indeterminate` DOM property so assistive tech
   * announces "mixed". Purely visual — the input's `checked` value is unchanged.
   */
  indeterminate?: boolean;
  /** Box + label scale. Default "md". */
  size?: CheckboxSize;
  /** Clickable label rendered after the box. */
  label?: React.ReactNode;
}

/**
 * Checkbox — a custom-styled checkbox that keeps a real, visually-hidden
 * `input[type=checkbox]` for native keyboard, focus, and form semantics (the
 * Radix Primitives / Base UI approach). The accent box fills with a spring
 * scale-in check; `indeterminate` renders a dash and sets the input's
 * `.indeterminate` property. Controllable or uncontrolled via
 * `useControllableState`.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    size = "md",
    label,
    className,
    style,
    disabled,
    form,
    ...props
  },
  ref,
) {
  const [on, setOn] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);
  const reset = React.useCallback(() => {
    if (checked === undefined) setOn(defaultChecked);
  }, [checked, defaultChecked, setOn]);
  useFormReset(inputRef, form, reset);

  // `.indeterminate` is a DOM property with no React prop; sync it via a ref.
  useIsomorphicLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate, on]);

  const state = indeterminate ? "indeterminate" : on ? "checked" : "unchecked";

  return (
    <label
      className={cn("alx-checkbox", `alx-checkbox--${size}`, className)}
      style={style}
      data-state={state}
      data-disabled={disabled || undefined}
    >
      <input
        ref={composedRef}
        type="checkbox"
        className="alx-checkbox__input"
        checked={on}
        disabled={disabled}
        form={form}
        onChange={(event) => setOn(event.currentTarget.checked)}
        {...props}
      />
      <span className="alx-checkbox__box" aria-hidden="true">
        <svg className="alx-checkbox__check" viewBox="0 0 24 24">
          <path d="M6 12l4 4 8-8" />
        </svg>
        <span className="alx-checkbox__dash" />
      </span>
      {label != null && <span className="alx-checkbox__label">{label}</span>}
    </label>
  );
});
