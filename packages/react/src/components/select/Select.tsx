"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import "./select.css";

export type SelectSize = "sm" | "md" | "lg";

/** A single option for the data-driven `options` prop. */
export interface SelectOption {
  /** Human-readable text shown in the list. */
  label: string;
  /** The value submitted with the form. */
  value: string;
  /** Disable just this option. */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Control padding + type scale. Default "md". */
  size?: SelectSize;
  /** Visually + programmatically mark the field invalid. */
  invalid?: boolean;
  /** Optional field label rendered above the control (wired via htmlFor/id). */
  label?: React.ReactNode;
  /** Helper text below the control, referenced by aria-describedby. */
  hint?: React.ReactNode;
  /** Error text below the control. When set, the field is treated as invalid. */
  error?: React.ReactNode;
  /**
   * Options as data. Rendered as `<option>` elements after the placeholder.
   * Ignored when `children` are supplied (use one or the other).
   */
  options?: SelectOption[];
  /**
   * Placeholder text. Rendered as a disabled, hidden first option that is
   * selected by default while the value is empty — so it can never be
   * re-selected or submitted.
   */
  placeholder?: string;
  /** Class applied to the outer wrapper (className goes to the <select>). */
  wrapperClassName?: string;
}

/**
 * Select — a styled *native* `<select>` wrapped in the Twilio Paste / GitHub
 * Primer field anatomy (label · control · hint/error) with a custom chevron
 * adornment overlaid on the control. Because it drives a real `<select>`, the
 * OS-native option list, keyboard interaction, and typeahead come for free and
 * work with every assistive technology — no custom listbox to maintain.
 *
 * Provide options either as `<option>` children or via the `options` prop.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = "md",
    invalid,
    label,
    hint,
    error,
    options,
    placeholder,
    className,
    wrapperClassName,
    id,
    disabled,
    value,
    defaultValue,
    children,
    "aria-describedby": ariaDescribedby,
    ...props
  },
  ref,
) {
  const autoId = useId(id);
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;
  const isInvalid = invalid || Boolean(error);

  const describedBy =
    [ariaDescribedby, hint && !error ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // When a placeholder is set and the consumer left the field uncontrolled with
  // no default, select the (disabled) placeholder option by default.
  const isControlled = value !== undefined;
  const usePlaceholderDefault =
    placeholder != null && !isControlled && defaultValue === undefined;
  const valueProps: Pick<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue"> =
    isControlled ? { value } : { defaultValue: usePlaceholderDefault ? "" : defaultValue };

  return (
    <div className={cn("alx-field", wrapperClassName)}>
      {label && (
        <label className="alx-field__label" htmlFor={autoId}>
          {label}
        </label>
      )}
      <div
        className={cn(
          "alx-select",
          `alx-select--${size}`,
          isInvalid && "alx-select--invalid",
          disabled && "alx-select--disabled",
        )}
        data-invalid={isInvalid || undefined}
      >
        <select
          ref={ref}
          id={autoId}
          className={cn("alx-select__field", className)}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          {...valueProps}
          {...props}
        >
          {placeholder != null && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="alx-select__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      {hint && !error && (
        <span className="alx-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="alx-field__error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
});
