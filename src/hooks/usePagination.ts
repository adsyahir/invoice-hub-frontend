import { useEffect, useMemo, useState } from "react";

/**
 * Client-side pagination for an in-memory list (used by the mock-data tables).
 * Returns the current page slice plus the props for <DataTablePagination />.
 * Page resets to 1 when the list shrinks below the current page (e.g. on filter).
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return { page, setPage, pageItems, total, pageSize };
}
