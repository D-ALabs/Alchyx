"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import "./pagination.css";

/** A rendered slot in the page strip: a real page number, or an ellipsis gap. */
type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** The current page, 1-based. */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Fires with the newly-requested page (already clamped to `1…count`). */
  onPageChange: (page: number) => void;
  /**
   * How many page buttons to show on each side of the current page before
   * collapsing into an ellipsis. Default 1.
   */
  siblingCount?: number;
  /** Accessible label for the Previous control. Default "Previous page". */
  prevLabel?: string;
  /** Accessible label for the Next control. Default "Next page". */
  nextLabel?: string;
}

function range(start: number, end: number): number[] {
  const length = Math.max(end - start + 1, 0);
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * Compute the visible window: always the first and last page, the current page
 * with `siblingCount` neighbours on each side, and an ellipsis wherever a run of
 * pages is collapsed. Mirrors the Ant Design / Fluent UI windowing rules.
 */
function getPaginationItems(
  page: number,
  count: number,
  siblingCount: number,
): PaginationItem[] {
  const boundaryCount = 1;

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (["start-ellipsis"] as PaginationItem[])
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["end-ellipsis"] as PaginationItem[])
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

/**
 * Pagination — a controlled page navigator. The parent owns `page` and updates
 * it in `onPageChange`. Renders a `<nav aria-label="Pagination">` with a
 * Previous control, a windowed strip of numbered pages (ellipses for gaps), and
 * a Next control. Consolidates the Ant Design windowing API with the Fluent UI
 * accessibility model.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    count,
    onPageChange,
    siblingCount = 1,
    prevLabel = "Previous page",
    nextLabel = "Next page",
    className,
    "aria-label": ariaLabel = "Pagination",
    ...props
  },
  ref,
) {
  const totalCount = Math.max(0, Math.floor(count));
  const siblings = Math.max(0, Math.floor(siblingCount));
  const items = getPaginationItems(page, totalCount, siblings);

  const isFirst = page <= 1;
  const isLast = page >= totalCount;

  const goTo = (next: number) => {
    const target = Math.min(Math.max(next, 1), totalCount);
    if (target !== page) onPageChange(target);
  };

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn("alx-pagination", className)}
      {...props}
    >
      <ul className="alx-pagination__list">
        <li className="alx-pagination__item">
          <button
            type="button"
            className="alx-pagination__nav"
            aria-label={prevLabel}
            disabled={isFirst}
            onClick={() => goTo(page - 1)}
          >
            <ChevronLeftIcon />
          </button>
        </li>

        {items.map((item) => {
          if (item === "start-ellipsis" || item === "end-ellipsis") {
            return (
              <li key={item} className="alx-pagination__item" aria-hidden="true">
                <span className="alx-pagination__ellipsis">…</span>
              </li>
            );
          }
          const current = item === page;
          return (
            <li key={item} className="alx-pagination__item">
              <button
                type="button"
                className={cn(
                  "alx-pagination__page",
                  current && "alx-pagination__page--active",
                )}
                aria-current={current ? "page" : undefined}
                aria-label={current ? `Page ${item}` : `Go to page ${item}`}
                onClick={() => goTo(item)}
              >
                {item}
              </button>
            </li>
          );
        })}

        <li className="alx-pagination__item">
          <button
            type="button"
            className="alx-pagination__nav"
            aria-label={nextLabel}
            disabled={isLast}
            onClick={() => goTo(page + 1)}
          >
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </nav>
  );
});

function ChevronLeftIcon() {
  return (
    <svg
      className="alx-pagination__icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="alx-pagination__icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
