import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/** Merge several refs into one callback ref. */
export function composeRefs<T>(...refs: PossibleRef<T>[]): (node: T) => void {
  return (node: T) => refs.forEach((ref) => setRef(ref, node));
}

/** Hook form of {@link composeRefs}, memoized for the component-library use case. */
export function useComposedRefs<T>(
  first: PossibleRef<T>,
  second?: PossibleRef<T>,
  third?: PossibleRef<T>,
): (node: T) => void {
  return React.useCallback(
    (node: T) => {
      setRef(first, node);
      setRef(second, node);
      setRef(third, node);
    },
    [first, second, third],
  );
}
