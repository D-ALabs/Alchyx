"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import "./breadcrumbs.css";

interface BreadcrumbsContextValue {
  /** The default glyph rendered by each `<BreadcrumbSeparator>`. */
  separator: React.ReactNode;
}

const BreadcrumbsContext = React.createContext<BreadcrumbsContextValue>({ separator: "/" });

export interface BreadcrumbsProps extends React.ComponentPropsWithoutRef<"nav"> {
  /**
   * The glyph placed between crumbs by `<BreadcrumbSeparator>` when it has no
   * children of its own. A `<BreadcrumbSeparator>` can still override it locally.
   * Default `"/"`.
   */
  separator?: React.ReactNode;
}

/**
 * Breadcrumbs — a navigation trail showing the path to the current page.
 * Consolidates the GitHub Primer, Ant Design, and Twilio Paste APIs. Renders a
 * `<nav aria-label="Breadcrumb">` wrapping an ordered list; compose it from
 * `<BreadcrumbItem>`, `<BreadcrumbLink>`, and `<BreadcrumbSeparator>`.
 */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { separator = "/", className, children, ...props },
  ref,
) {
  const ctx = React.useMemo<BreadcrumbsContextValue>(() => ({ separator }), [separator]);

  return (
    <BreadcrumbsContext.Provider value={ctx}>
      <nav ref={ref} aria-label="Breadcrumb" className={cn("alx-breadcrumbs", className)} {...props}>
        <ol className="alx-breadcrumbs__list">{children}</ol>
      </nav>
    </BreadcrumbsContext.Provider>
  );
});

export type BreadcrumbItemProps = React.ComponentPropsWithoutRef<"li">;

/** One crumb in the trail — a list item wrapping a link (or current page). */
export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return <li ref={ref} className={cn("alx-breadcrumbs__item", className)} {...props} />;
  },
);

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  /**
   * Render the single child element (merging props + ref) instead of an `<a>`,
   * so the crumb can wrap a router `<Link>`. See `Slot`.
   */
  asChild?: boolean;
  /**
   * Mark this crumb as the current page: renders non-interactive text with
   * `aria-current="page"` instead of a link. Use it for the last crumb.
   */
  current?: boolean;
}

/**
 * A crumb link. Renders an `<a>` by default; the current/last crumb (`current`)
 * renders as static text with `aria-current="page"`. `asChild` lets it wrap a
 * framework link component.
 */
export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ asChild = false, current = false, className, children, ...props }, ref) {
    const Comp: React.ElementType = asChild ? Slot : current ? "span" : "a";

    return (
      <Comp
        ref={ref as never}
        className={cn(
          "alx-breadcrumbs__link",
          current && "alx-breadcrumbs__link--current",
          className,
        )}
        aria-current={current ? "page" : undefined}
        data-current={current || undefined}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

export type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<"li">;

/**
 * The visual divider between crumbs — a mono glyph, hidden from assistive tech.
 * Falls back to the root's `separator` prop when it has no children.
 */
export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ className, children, ...props }, ref) {
    const { separator } = React.useContext(BreadcrumbsContext);

    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("alx-breadcrumbs__separator", className)}
        {...props}
      >
        {children ?? separator}
      </li>
    );
  },
);
