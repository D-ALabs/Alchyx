"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useControllableState } from "../../lib/useControllableState";
import { useComposedRefs } from "../../lib/composeRefs";
import { useFormReset } from "../../lib/useFormReset";
import { useId } from "../../lib/useId";
import "./switch.css";

export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "defaultChecked" | "value" | "onInvalid"
  > {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state (uncontrolled). */
  defaultChecked?: boolean;
  /** Fires with the next checked value. */
  onCheckedChange?: (checked: boolean) => void;
  /** Knob + track scale. Default "md". */
  size?: SwitchSize;
  /** Optional inline label rendered after the track. */
  label?: React.ReactNode;
  /** Form field name. Checked switches submit `value`; unchecked switches are omitted. */
  name?: string;
  /** Submitted value when checked. Default "on". */
  value?: string;
  /** Require the switch to be checked before its owner form can submit. */
  required?: boolean;
  /** Fires from the native form proxy when required validation fails. */
  onInvalid?: React.FormEventHandler<HTMLInputElement>;
}

/**
 * Switch — a toggle following the Radix / Base UI switch pattern: a real button
 * with role="switch" and aria-checked, controllable or uncontrolled via
 * useControllableState. The knob rides a spring easing.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    size = "md",
    label,
    className,
    disabled,
    id,
    onClick,
    name,
    value = "on",
    required,
    form,
    onInvalid,
    ...props
  },
  ref,
) {
  const [on, setOn] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const autoId = useId(id);
  const labelId = `${autoId}-label`;
  const controlRef = React.useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(ref, controlRef);
  const reset = React.useCallback(() => {
    if (checked === undefined) setOn(defaultChecked);
  }, [checked, defaultChecked, setOn]);
  useFormReset(controlRef, form, reset);

  const control = (
    <button
      ref={composedRef}
      type="button"
      role="switch"
      id={autoId}
      aria-checked={on}
      aria-required={required || undefined}
      aria-labelledby={label ? labelId : undefined}
      data-state={on ? "checked" : "unchecked"}
      disabled={disabled}
      className={cn("alx-switch", `alx-switch--${size}`, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOn((prev) => !prev);
      }}
      {...props}
    >
      <span className="alx-switch__track" aria-hidden="true">
        <span className="alx-switch__thumb" />
      </span>
    </button>
  );

  const formControl = (name || required) && (
    <input
      type="checkbox"
      className="alx-visually-hidden"
      tabIndex={-1}
      aria-hidden="true"
      name={name}
      value={value}
      checked={on}
      required={required}
      disabled={disabled}
      form={form}
      readOnly
      onInvalid={(event) => {
        onInvalid?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        controlRef.current?.focus();
      }}
    />
  );

  if (!label) return <>{control}{formControl}</>;

  return (
    <span className="alx-switch-row">
      {control}
      <label className="alx-switch-row__label" id={labelId} htmlFor={autoId}>
        {label}
      </label>
      {formControl}
    </span>
  );
});
