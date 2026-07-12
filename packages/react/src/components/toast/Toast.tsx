"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Portal } from "../../lib/Portal";
import { useId } from "../../lib/useId";
import "./toast.css";

const DEFAULT_DURATION = 4000;
/** Time the exit animation runs before the record is removed from the queue. */
const EXIT_MS = 220;

/**
 * Monotonic clock in ms. Uses `performance.now()` when available (guarded so it
 * is safe in restricted runtimes); falls back to `0`, which keeps pause/resume
 * from ever subtracting more than the elapsed time. Deliberately avoids
 * `Date.now`, which is unavailable in this runtime.
 */
function nowMs(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : 0;
}

/** Status ramp for a toast. `info` uses the accent; the rest map to status hues. */
export type ToastVariant = "info" | "signal" | "caution" | "fault";

/** The options accepted by `toast(...)`. `id` is assigned by the provider. */
export interface ToastOptions {
  /** Bold headline line — the announced message. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Status ramp. Default "info". */
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. `0` (or non-finite) keeps it until dismissed. Default 4000. */
  duration?: number;
}

/** A resolved toast held in the provider queue. */
export interface ToastRecord {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

/** The value returned by `useToast()`. */
export interface ToastContextValue {
  /** Enqueue a toast; returns its generated id (for programmatic `dismiss`). */
  toast: (opts: ToastOptions) => number;
  /** Dismiss a toast by id (plays the exit animation, then removes it). */
  dismiss: (id: number) => void;
}

interface InternalToast extends ToastRecord {
  /** Drives the enter/exit animation via the `data-state` attribute. */
  state: "open" | "closed";
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * ToastProvider — wraps a subtree, keeps the toast queue in state, and renders a
 * portalled viewport pinned to the bottom-right of the window. Consolidates the
 * Radix Primitives imperative model, the Sonner queue/auto-dismiss ergonomics,
 * and the Fluent UI status ramp. Read the queue with the {@link useToast} hook.
 *
 * Ids are generated from a monotonic ref counter (no Math.random / Date.now, so
 * it is safe in restricted runtimes), and every pending timer is cleared on
 * unmount.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const baseId = useId();
  const idRef = React.useRef(0);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());
  /**
   * Auto-dismiss bookkeeping per toast: `remaining` ms left on the countdown and
   * the `start` clock reading of the currently running timer. Present only while
   * a toast has a live auto-dismiss timer (sticky toasts are absent).
   */
  const durations = React.useRef(new Map<number, { remaining: number; start: number }>());
  const [items, setItems] = React.useState<InternalToast[]>([]);

  const clearTimer = React.useCallback((id: number) => {
    const handle = timers.current.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = React.useCallback(
    (id: number) => {
      clearTimer(id);
      durations.current.delete(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, state: "closed" } : item)),
      );
      const exit = setTimeout(() => {
        timers.current.delete(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, EXIT_MS);
      timers.current.set(id, exit);
    },
    [clearTimer],
  );

  const toast = React.useCallback(
    (opts: ToastOptions) => {
      const id = idRef.current;
      idRef.current += 1;

      const duration = opts.duration ?? DEFAULT_DURATION;
      const record: InternalToast = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "info",
        duration,
        state: "open",
      };
      setItems((prev) => [...prev, record]);

      if (Number.isFinite(duration) && duration > 0) {
        durations.current.set(id, { remaining: duration, start: nowMs() });
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  /**
   * Pause a toast's auto-dismiss countdown (on hover/focus): stop the timer and
   * bank the remaining ms based on how long it had been running. No-op for
   * sticky toasts, toasts already dismissing, or an already-paused toast.
   */
  const pause = React.useCallback((id: number) => {
    const meta = durations.current.get(id);
    if (!meta) return;
    const handle = timers.current.get(id);
    if (handle === undefined) return;
    clearTimeout(handle);
    timers.current.delete(id);
    meta.remaining = Math.max(0, meta.remaining - (nowMs() - meta.start));
  }, []);

  /**
   * Resume a paused auto-dismiss countdown (on unhover/blur): re-arm the timer
   * for the banked remaining ms. No-op for sticky/dismissing toasts or a toast
   * whose timer is already running.
   */
  const resume = React.useCallback(
    (id: number) => {
      const meta = durations.current.get(id);
      if (!meta) return;
      if (timers.current.has(id)) return;
      meta.start = nowMs();
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), meta.remaining),
      );
    },
    [dismiss],
  );

  // Clear every pending timer on unmount.
  React.useEffect(() => {
    const map = timers.current;
    const meta = durations.current;
    return () => {
      map.forEach((handle) => clearTimeout(handle));
      map.clear();
      meta.clear();
    };
  }, []);

  const value = React.useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <ol
          className="alx-toast__viewport"
          aria-label="Notifications"
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions text"
        >
          {items.map((item) => (
            <ToastItem
              key={item.id}
              baseId={baseId}
              toast={item}
              onDismiss={() => dismiss(item.id)}
              onPause={() => pause(item.id)}
              onResume={() => resume(item.id)}
            />
          ))}
        </ol>
      </Portal>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  baseId: string;
  toast: InternalToast;
  onDismiss: () => void;
  /** Pause the auto-dismiss countdown while the toast is hovered/focused. */
  onPause: () => void;
  /** Resume the auto-dismiss countdown when the pointer/focus leaves. */
  onResume: () => void;
}

function ToastItem({ baseId, toast, onDismiss, onPause, onResume }: ToastItemProps) {
  const titleId = `${baseId}-${toast.id}-title`;
  const descId = toast.description ? `${baseId}-${toast.id}-desc` : undefined;

  // Pause while the toast is hovered OR focused; only resume once BOTH are gone,
  // so a blur (e.g. leaving the Dismiss button) can't re-arm the countdown while
  // the pointer is still hovering. onPause/onResume are idempotent.
  const interaction = React.useRef({ hover: false, focus: false });
  const sync = React.useCallback(() => {
    if (interaction.current.hover || interaction.current.focus) onPause();
    else onResume();
  }, [onPause, onResume]);

  return (
    <li
      aria-labelledby={titleId}
      aria-describedby={descId}
      data-state={toast.state}
      className={cn("alx-toast", `alx-toast--${toast.variant}`)}
      onMouseEnter={() => {
        interaction.current.hover = true;
        sync();
      }}
      onMouseLeave={() => {
        interaction.current.hover = false;
        sync();
      }}
      onFocus={() => {
        interaction.current.focus = true;
        sync();
      }}
      onBlur={() => {
        interaction.current.focus = false;
        sync();
      }}
    >
      <span className="alx-toast__accent" aria-hidden="true" />
      <div className="alx-toast__body">
        <p id={titleId} className="alx-toast__title">
          {toast.title}
        </p>
        {toast.description ? (
          <p id={descId} className="alx-toast__desc">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="alx-toast__close"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M3.5 3.5l7 7M10.5 3.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}

/**
 * useToast — read the toast API from the nearest {@link ToastProvider}. Returns
 * `{ toast, dismiss }`. Throws if called outside a provider.
 */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>.");
  return ctx;
}
