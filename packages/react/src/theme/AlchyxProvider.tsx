import * as React from "react";
import { cn } from "../lib/cn";

export type Skin = "lab" | "dark" | "ark";
export type Accent =
  | "monochrome"
  | "paper"
  | "gold"
  | "mint"
  | "blue"
  | "amber"
  | "ivory"
  | "bronze";

export interface AlchyxContextValue {
  skin: Skin;
  accent: Accent | undefined;
  setSkin: (skin: Skin) => void;
  setAccent: (accent: Accent | undefined) => void;
}

const AlchyxContext = React.createContext<AlchyxContextValue | null>(null);

/** Read the active skin/accent and setters. Throws if used outside a provider. */
export function useAlchyx(): AlchyxContextValue {
  const ctx = React.useContext(AlchyxContext);
  if (!ctx) {
    throw new Error("useAlchyx must be used within an <AlchyxProvider>.");
  }
  return ctx;
}

export interface AlchyxProviderProps {
  children: React.ReactNode;
  /** Controlled skin. */
  skin?: Skin;
  /** Initial skin in uncontrolled mode. Default "lab". */
  defaultSkin?: Skin;
  /** Controlled accent. `undefined` = each skin's default accent. */
  accent?: Accent;
  /** Initial accent in uncontrolled mode. */
  defaultAccent?: Accent;
  onSkinChange?: (skin: Skin) => void;
  onAccentChange?: (accent: Accent | undefined) => void;
  /**
   * How to apply the theme:
   *  - "wrapper" (default): render a div with data-theme + the .alx-root paint.
   *  - "html": set the attributes on <html> (whole document re-tints).
   */
  as?: "wrapper" | "html";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AlchyxProvider — sets `data-theme` (Lab/Dark/Ark) and optional `data-accent`,
 * and exposes them via context. Everything downstream reads CSS variables, so a
 * skin/accent change re-tints the whole subtree. Wrap your app once.
 */
export function AlchyxProvider({
  children,
  skin: controlledSkin,
  defaultSkin = "lab",
  accent: controlledAccent,
  defaultAccent,
  onSkinChange,
  onAccentChange,
  as = "wrapper",
  className,
  style,
}: AlchyxProviderProps) {
  const [uncontrolledSkin, setUncontrolledSkin] = React.useState<Skin>(defaultSkin);
  const [uncontrolledAccent, setUncontrolledAccent] = React.useState<Accent | undefined>(
    defaultAccent,
  );

  const skin = controlledSkin ?? uncontrolledSkin;
  const accent = controlledAccent ?? uncontrolledAccent;

  const setSkin = React.useCallback(
    (next: Skin) => {
      if (controlledSkin === undefined) setUncontrolledSkin(next);
      onSkinChange?.(next);
    },
    [controlledSkin, onSkinChange],
  );

  const setAccent = React.useCallback(
    (next: Accent | undefined) => {
      if (controlledAccent === undefined) setUncontrolledAccent(next);
      onAccentChange?.(next);
    },
    [controlledAccent, onAccentChange],
  );

  // When applying to <html>, drive the document attributes via effect.
  React.useEffect(() => {
    if (as !== "html" || typeof document === "undefined") return;
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");
    const prevAccent = root.getAttribute("data-accent");
    root.setAttribute("data-theme", skin);
    if (accent) root.setAttribute("data-accent", accent);
    else root.removeAttribute("data-accent");
    return () => {
      if (prevTheme) root.setAttribute("data-theme", prevTheme);
      else root.removeAttribute("data-theme");
      if (prevAccent) root.setAttribute("data-accent", prevAccent);
      else root.removeAttribute("data-accent");
    };
  }, [as, skin, accent]);

  const value = React.useMemo<AlchyxContextValue>(
    () => ({ skin, accent, setSkin, setAccent }),
    [skin, accent, setSkin, setAccent],
  );

  return (
    <AlchyxContext.Provider value={value}>
      {as === "wrapper" ? (
        <div
          className={cn("alx-root", className)}
          data-theme={skin}
          data-accent={accent}
          style={style}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </AlchyxContext.Provider>
  );
}
