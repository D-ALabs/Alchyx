"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useId } from "../../lib/useId";
import { useComposedRefs } from "../../lib/composeRefs";
import { useIsomorphicLayoutEffect } from "../../lib/useIsomorphicLayoutEffect";
import "./textarea.css";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  /** Control padding + type scale. Default "md". */
  size?: TextareaSize;
  /** Visually + programmatically mark the field invalid. */
  invalid?: boolean;
  /** Optional field label rendered above the control (wired via htmlFor/id). */
  label?: React.ReactNode;
  /** Helper text below the control, referenced by aria-describedby. */
  hint?: React.ReactNode;
  /** Error text below the control. When set, the field is treated as invalid. */
  error?: React.ReactNode;
  /**
   * Grow the textarea to fit its content instead of scrolling. The element's
   * height is measured from `scrollHeight` on input (and once on mount), so the
   * native resize handle + scrollbar are suppressed while it is on.
   */
  autoResize?: boolean;
  /** Class applied to the outer field wrapper (className goes to the <textarea>). */
  wrapperClassName?: string;
}

/**
 * Textarea — a multiline text field mirroring Input's field anatomy (label ·
 * control · hint/error) from Twilio Paste / shadcn/ui. Renders a real
 * <textarea> wired with aria-invalid / aria-describedby via useId, and adds an
 * `autoResize` mode that grows the control to fit its content using a composed
 * ref measured with useIsomorphicLayoutEffect.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = "md",
    invalid,
    label,
    hint,
    error,
    autoResize = false,
    className,
    wrapperClassName,
    id,
    rows = 3,
    disabled,
    value,
    defaultValue,
    onInput,
    "aria-describedby": ariaDescribedby,
    ...props
  },
  ref,
) {
  const autoId = useId(id);
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;
  const isInvalid = invalid || Boolean(error);

  const innerRef = React.useRef<HTMLTextAreaElement>(null);
  const composedRef = useComposedRefs(ref, innerRef);

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Size once on mount and whenever the value / mode changes; re-measure on
  // viewport resize since wrapping (and therefore height) is width-dependent.
  useIsomorphicLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (!autoResize) {
      el.style.height = "";
      return;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [autoResize, resize, value, defaultValue]);

  const describedBy =
    [ariaDescribedby, hint && !error ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("alx-textarea-field", wrapperClassName)}>
      {label && (
        <label className="alx-textarea-field__label" htmlFor={autoId}>
          {label}
        </label>
      )}
      <div
        className={cn(
          "alx-textarea",
          `alx-textarea--${size}`,
          isInvalid && "alx-textarea--invalid",
          disabled && "alx-textarea--disabled",
        )}
        data-invalid={isInvalid || undefined}
      >
        <textarea
          ref={composedRef}
          id={autoId}
          className={cn("alx-textarea__field", className)}
          rows={rows}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          data-auto-resize={autoResize || undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          onInput={(event) => {
            onInput?.(event);
            if (event.defaultPrevented) return;
            if (autoResize) resize();
          }}
          {...props}
        />
      </div>
      {hint && !error && (
        <span className="alx-textarea-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="alx-textarea-field__error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
});
