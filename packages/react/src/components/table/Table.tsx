"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./table.css";

export interface TableProps extends React.ComponentPropsWithoutRef<"table"> {
  /**
   * Class applied to the scrollable, bordered container that wraps the
   * `<table>` (the `radius-card` surface). Use it to constrain width or height,
   * e.g. `containerClassName` with a `max-height` for a sticky-header table.
   */
  containerClassName?: string;
}

export type TableHeaderProps = React.ComponentPropsWithoutRef<"thead">;
export type TableBodyProps = React.ComponentPropsWithoutRef<"tbody">;
export type TableHeadProps = React.ComponentPropsWithoutRef<"th">;
export type TableCellProps = React.ComponentPropsWithoutRef<"td">;

export interface TableRowProps extends React.ComponentPropsWithoutRef<"tr"> {
  /**
   * Add a subtle `--surface2` hover fill (opt-in, for scannable body rows).
   * Leave off for header rows or static tables.
   */
  hover?: boolean;
}

/**
 * Table — styled primitives that are thin wrappers over the native table
 * elements, so semantics, sorting hooks, and `colSpan`/`scope` all pass
 * straight through. Consolidates the GitHub Primer border/hairline anatomy, the
 * Ant Design column ergonomics, and the Twilio Paste scroll-container pattern.
 *
 * Compose `<Table><TableHeader><TableRow><TableHead/></TableRow></TableHeader>
 * <TableBody><TableRow><TableCell/></TableRow></TableBody></Table>`. The root
 * wraps the `<table>` in a horizontally scrollable, bordered `radius-card`
 * surface so wide tables never blow out the page width.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, containerClassName, ...props },
  ref,
) {
  return (
    <div className={cn("alx-table", containerClassName)}>
      <table ref={ref} className={cn("alx-table__table", className)} {...props} />
    </div>
  );
});

/** Table head section (`<thead>`) — groups the column-header row(s). */
export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ className, ...props }, ref) {
    return <thead ref={ref} className={cn("alx-table__header", className)} {...props} />;
  },
);

/** Table body section (`<tbody>`) — holds the data rows and their dividers. */
export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...props }, ref) {
    return <tbody ref={ref} className={cn("alx-table__body", className)} {...props} />;
  },
);

/** Table row (`<tr>`). Pass `hover` for a subtle hover fill on body rows. */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { hover = false, className, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cn("alx-table__row", hover && "alx-table__row--hover", className)}
      {...props}
    />
  );
});

/**
 * Column header cell (`<th>`) — the mono-caps, left-aligned header on a
 * `--surface2` band. Consumers should keep the native `scope="col"` (default
 * for a `<th>` in a `<thead>` row) for screen-reader column association.
 */
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, ...props },
  ref,
) {
  return <th ref={ref} className={cn("alx-table__head", className)} {...props} />;
});

/** Data cell (`<td>`). */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, ...props },
  ref,
) {
  return <td ref={ref} className={cn("alx-table__cell", className)} {...props} />;
});
