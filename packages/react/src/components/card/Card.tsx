"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/Slot";
import "./card.css";

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Make the whole card a hover target: adds a pointer cursor, a hover lift +
   * shadow, and a keyboard focus ring. Pair with `asChild` to wrap a real
   * <a>/<button> so the surface gets correct semantics.
   */
  interactive?: boolean;
  /**
   * Render as the single child element (merging props + ref) instead of a
   * <div>. Use `<Card asChild><a href>…</a></Card>` to turn the whole card
   * into a link.
   */
  asChild?: boolean;
}

export type CardHeaderProps = React.ComponentPropsWithoutRef<"div">;
export type CardTitleProps = React.ComponentPropsWithoutRef<"h3">;
export type CardDescriptionProps = React.ComponentPropsWithoutRef<"p">;
export type CardContentProps = React.ComponentPropsWithoutRef<"div">;
export type CardFooterProps = React.ComponentPropsWithoutRef<"div">;

/**
 * Card — a surface container that groups related content on a `--surface`
 * panel. Consolidates the shadcn/ui slot anatomy (Header / Title / Description /
 * Content / Footer) with the Twilio Paste card ergonomics. `interactive` turns
 * the whole surface into a focusable hover target; `asChild` lets it render as a
 * link or any element.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, asChild = false, className, tabIndex, children, ...props },
  ref,
) {
  const Comp: React.ElementType = asChild ? Slot : "div";
  const resolvedTabIndex = tabIndex ?? (interactive && !asChild ? 0 : undefined);

  return (
    <Comp
      ref={ref as never}
      className={cn("alx-card", interactive && "alx-card--interactive", className)}
      data-interactive={interactive || undefined}
      tabIndex={resolvedTabIndex}
      {...props}
    >
      {children}
    </Comp>
  );
});

/** Top slot of a card — stacks the title above the description. */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("alx-card__header", className)} {...props} />;
});

/** Card heading. Renders a real <h3> in the display font. */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...props },
  ref,
) {
  return <h3 ref={ref} className={cn("alx-card__title", className)} {...props} />;
});

/** Muted supporting line beneath the title. Renders a <p>. */
export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn("alx-card__description", className)} {...props} />;
  },
);

/** Main body slot of a card. */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("alx-card__content", className)} {...props} />;
});

/** Bottom slot of a card — a row for actions/metadata, pinned to the base. */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("alx-card__footer", className)} {...props} />;
});
