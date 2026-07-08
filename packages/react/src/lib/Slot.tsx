import * as React from "react";
import { useComposedRefs } from "./composeRefs";

/**
 * Slot — powers the `asChild` prop (the Radix/Base-UI pattern). When a component
 * renders `<Slot>{child}</Slot>`, the child element receives the component's
 * props (className/style merged, event handlers chained) and ref, instead of an
 * extra wrapper DOM node. This lets `<Button asChild><a href>…</a></Button>`
 * render a styled anchor.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot(props, forwardedRef) {
  const { children, ...slotProps } = props;
  const child = React.isValidElement(children) ? children : null;
  const childRef = child ? getElementRef(child) : null;
  const ref = useComposedRefs(forwardedRef, childRef);

  if (!child) {
    if (React.Children.count(children) > 1) {
      throw new Error("Alchyx Slot expects a single React element child when `asChild` is set.");
    }
    return null;
  }

  return React.cloneElement(child, {
    ...mergeProps(slotProps, child.props as Record<string, unknown>),
    ref,
  } as Record<string, unknown>);
});

/** Merge the slot's props onto the child's: chain handlers, combine className, spread style. */
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...childProps };

  for (const key in slotProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    const isHandler = /^on[A-Z]/.test(key);

    if (isHandler) {
      if (slotValue && childValue) {
        merged[key] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => unknown)(...args);
          (slotValue as (...a: unknown[]) => unknown)(...args);
        };
      } else {
        merged[key] = slotValue ?? childValue;
      }
    } else if (key === "style") {
      merged[key] = { ...(slotValue as object), ...(childValue as object) };
    } else if (key === "className") {
      merged[key] = [slotValue, childValue].filter(Boolean).join(" ");
    } else {
      merged[key] = slotValue !== undefined ? slotValue : childValue;
    }
  }

  return merged;
}

/** Read a child element's ref across React 18/19 (ref moved to props in 19). */
function getElementRef(element: React.ReactElement): React.Ref<unknown> | null {
  const anyEl = element as unknown as {
    ref?: React.Ref<unknown>;
    props?: { ref?: React.Ref<unknown> };
  };
  return anyEl.props?.ref ?? anyEl.ref ?? null;
}
