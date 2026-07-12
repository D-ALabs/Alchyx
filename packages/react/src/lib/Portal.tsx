import * as React from "react";
import { createPortal } from "react-dom";

interface PortalScopeValue {
  container?: Element | DocumentFragment | null;
  theme?: string;
  accent?: string;
  scoped: boolean;
}

const PortalScopeContext = React.createContext<PortalScopeValue | null>(null);

export interface PortalScopeProviderProps extends PortalScopeValue {
  children: React.ReactNode;
}

/** Internal theme bridge used by AlchyxProvider for content portalled outside its DOM subtree. */
export function PortalScopeProvider({
  children,
  container,
  theme,
  accent,
  scoped,
}: PortalScopeProviderProps) {
  const context = React.useMemo<PortalScopeValue>(
    () => ({ container, theme, accent, scoped }),
    [container, theme, accent, scoped],
  );
  return <PortalScopeContext.Provider value={context}>{children}</PortalScopeContext.Provider>;
}

const subscribeToClient = () => () => undefined;

export interface PortalProps {
  children: React.ReactNode;
  /** Where to render. Defaults to document.body. */
  container?: Element | DocumentFragment | null;
}

/**
 * Portal — renders children into `container` (default document.body) once
 * mounted on the client. Used by overlays (Dialog, Tooltip, Toast) so they
 * escape parent overflow/stacking contexts.
 */
export function Portal({ children, container }: PortalProps) {
  const scope = React.useContext(PortalScopeContext);
  const mounted = React.useSyncExternalStore(subscribeToClient, () => true, () => false);
  if (!mounted) return null;

  const target = container ?? scope?.container ?? document.body;
  if (!target) return null;

  const content = scope?.scoped ? (
    <div
      className="alx-root alx-portal-scope"
      data-theme={scope.theme}
      data-accent={scope.accent}
      style={{ display: "contents" }}
    >
      {children}
    </div>
  ) : (
    children
  );

  return createPortal(content, target);
}
