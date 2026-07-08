import * as React from "react";

export interface UseControllableStateParams<T> {
  /** Controlled value. When defined, the component is controlled. */
  value?: T | undefined;
  /** Initial value in uncontrolled mode. */
  defaultValue?: T | undefined;
  /** Called on every change with the resolved next value. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * useControllableState — the standard controlled/uncontrolled state hook (as in
 * Radix, Base UI, Astryx). Returns `[value, setValue]`; `setValue` accepts a
 * value or an updater. In controlled mode it never writes internal state, only
 * calls `onChange`.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: React.SetStateAction<T>) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue as T);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : uncontrolled;

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const currentRef = React.useRef(current);
  currentRef.current = current;

  const setValue = React.useCallback(
    (next: React.SetStateAction<T>) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(currentRef.current)
          : next;
      if (!isControlled) {
        setUncontrolled(resolved);
      }
      if (!Object.is(resolved, currentRef.current)) {
        onChangeRef.current?.(resolved);
      }
    },
    [isControlled],
  );

  return [current, setValue];
}
