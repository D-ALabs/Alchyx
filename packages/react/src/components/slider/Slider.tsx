"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { useControllableState } from "../../lib/useControllableState";
import { useComposedRefs } from "../../lib/composeRefs";
import { useFormReset } from "../../lib/useFormReset";
import "./slider.css";

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  /** Controlled value. */
  value?: number;
  /** Initial value (uncontrolled). Defaults to `min`. */
  defaultValue?: number;
  /** Fires with the next snapped, clamped value. */
  onValueChange?: (value: number) => void;
  /** Lower bound. Default 0. */
  min?: number;
  /** Upper bound. Default 100. */
  max?: number;
  /** Granularity the value snaps to. Default 1. */
  step?: number;
  /** Disable interaction and remove the thumb from the tab order. */
  disabled?: boolean;
  /** Form field name used to submit the numeric value. */
  name?: string;
  /** Id of an associated form when rendered outside it. */
  form?: string;
  /** Marks the always-valued slider as required for form and ARIA semantics. */
  required?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Number of decimals implied by `step`, so snapping never drifts (0.1 + 0.2 …). */
function decimalsOf(step: number): number {
  const s = String(step);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

/** Snap `value` to the nearest step from `min`, then clamp into range. */
function snapToStep(value: number, min: number, max: number, step: number): number {
  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;
  const decimals = decimalsOf(step);
  const rounded = decimals > 0 ? Number(snapped.toFixed(decimals)) : snapped;
  return clamp(rounded, min, max);
}

/**
 * Slider — a single-thumb range input following the Radix Primitives / Base UI
 * slider pattern. The thumb is the interactive element (role="slider" with the
 * aria-value* trio); the track supports click + drag via pointer events. Value
 * is controllable or uncontrolled through useControllableState, always snapped
 * to `step` and clamped into `[min, max]`.
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    name,
    form,
    required,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState<number>({
    value: valueProp,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });

  const trackRef = React.useRef<HTMLSpanElement>(null);
  const thumbRef = React.useRef<HTMLSpanElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const [dragging, setDragging] = React.useState(false);
  const reset = React.useCallback(() => {
    if (valueProp === undefined) {
      setValue(snapToStep(defaultValue ?? min, min, max, step));
    }
  }, [valueProp, defaultValue, min, max, step, setValue]);
  useFormReset(rootRef, form, reset);

  // Keep the latest value readable from event handlers without re-subscribing.
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  /** Map a pointer clientX onto a snapped, clamped value. */
  const valueFromPointer = React.useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return valueRef.current;
      const rect = track.getBoundingClientRect();
      const ratio = rect.width > 0 ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0;
      return snapToStep(min + ratio * (max - min), min, max, step);
    },
    [min, max, step],
  );

  // While dragging, follow the pointer anywhere on the page and end on release.
  React.useEffect(() => {
    if (!dragging) return;
    const handleMove = (event: PointerEvent) => {
      setValue(valueFromPointer(event.clientX));
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging, valueFromPointer, setValue]);

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    setValue(valueFromPointer(event.clientX));
    thumbRef.current?.focus();
    setDragging(true);
  };

  const handleThumbKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const largeStep = step * 10;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step;
        break;
      case "PageUp":
        next = value + largeStep;
        break;
      case "PageDown":
        next = value - largeStep;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    setValue(snapToStep(next, min, max, step));
  };

  const clampedValue = clamp(value, min, max);
  const percent = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  return (
    <div
      ref={composedRef}
      className={cn("alx-slider", className)}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      {...props}
    >
      <span
        ref={trackRef}
        className="alx-slider__track"
        onPointerDown={handleTrackPointerDown}
      >
        <span className="alx-slider__range" style={{ width: `${percent}%` }} />
        <span
          ref={thumbRef}
          className="alx-slider__thumb"
          role="slider"
          tabIndex={disabled ? undefined : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-orientation="horizontal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-disabled={disabled || undefined}
          data-disabled={disabled || undefined}
          style={{ left: `${percent}%` }}
          onKeyDown={handleThumbKeyDown}
        />
      </span>
      {(name || required) && (
        <input
          type="text"
          inputMode="decimal"
          className="alx-visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={clampedValue}
          required={required}
          disabled={disabled}
          form={form}
          onChange={() => undefined}
        />
      )}
    </div>
  );
});
