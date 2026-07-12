"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import "./input.css";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Control padding + type scale. Default "md". */
  size?: InputSize;
  /** Visually + programmatically mark the field invalid. */
  invalid?: boolean;
  /** Optional field label rendered above the control (wired via htmlFor/id). */
  label?: React.ReactNode;
  /** Helper text below the control, referenced by aria-describedby. */
  hint?: React.ReactNode;
  /** Error text below the control. When set, the field is treated as invalid. */
  error?: React.ReactNode;
  /** Adornment rendered inside the control, before the input. */
  leading?: React.ReactNode;
  /** Adornment rendered inside the control, after the input. */
  trailing?: React.ReactNode;
  /** Class applied to the outer wrapper (className goes to the <input>). */
  wrapperClassName?: string;
}

/**
 * Input — a text field consolidating the Twilio Paste / GitHub Primer field
 * anatomy (label, control, help/error) with shadcn ergonomics. Renders a real
 * <input>; label + hint + error are wired with aria-describedby / aria-invalid
 * via useId. Supports leading/trailing adornments.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    invalid,
    label,
    hint,
    error,
    leading,
    trailing,
    className,
    wrapperClassName,
    id,
    disabled,
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

  return (
    <div className={cn("alx-field", wrapperClassName)}>
      {label && (
        <label className="alx-field__label" htmlFor={autoId}>
          {label}
        </label>
      )}
      <div
        className={cn(
          "alx-input",
          `alx-input--${size}`,
          isInvalid && "alx-input--invalid",
          disabled && "alx-input--disabled",
        )}
        data-invalid={isInvalid || undefined}
      >
        {leading && (
          <span className="alx-input__adorn alx-input__adorn--lead" aria-hidden="true">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={autoId}
          className={cn("alx-input__field", className)}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {trailing && (
          <span className="alx-input__adorn alx-input__adorn--trail">{trailing}</span>
        )}
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
