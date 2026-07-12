import * as React from "react";

/** Reset custom-control state when its owner form dispatches a native reset event. */
export function useFormReset(
  controlRef: React.RefObject<HTMLElement | null>,
  formId: string | undefined,
  onReset: () => void,
) {
  React.useEffect(() => {
    const control = controlRef.current;
    if (!control) return;

    const owner = formId
      ? control.ownerDocument.getElementById(formId)
      : control.closest("form");
    if (!(owner instanceof HTMLFormElement)) return;

    let active = true;
    const handleReset = () => {
      queueMicrotask(() => {
        if (active) onReset();
      });
    };
    owner.addEventListener("reset", handleReset);
    return () => {
      active = false;
      owner.removeEventListener("reset", handleReset);
    };
  }, [controlRef, formId, onReset]);
}
