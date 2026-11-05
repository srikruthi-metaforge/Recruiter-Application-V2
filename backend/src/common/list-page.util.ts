/**
 * List reads stay arrays when the caller omits page and limit, matching the existing contract.
 * Those reads are capped so a missing query cannot scan an entire collection.
 * Passing page or limit switches to the paged envelope used by the candidate repository.
 */
export const UNPAGED_LIST_CAP = 1000;
export const MAX_PAGE_SIZE = 100;

export interface ListWindow {
  paged: boolean;
  page: number;
  limit: number;
  skip: number;
}

function asNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function resolveListWindow(page?: unknown, limit?: unknown): ListWindow {
  const pageNum = asNumber(page);
  const limitNum = asNumber(limit);
  const paged = (pageNum !== undefined && pageNum > 0) || (limitNum !== undefined && limitNum > 0);
  if (!paged) {
    return { paged: false, page: 1, limit: UNPAGED_LIST_CAP, skip: 0 };
  }
  const safePage = Math.max(1, pageNum && pageNum > 0 ? Math.floor(pageNum) : 1);
  const safeLimit = Math.max(1, Math.min(MAX_PAGE_SIZE, limitNum && limitNum > 0 ? Math.floor(limitNum) : 25));
  return { paged: true, page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export function listResult<T>(window: ListWindow, items: T[], total: number) {
  if (!window.paged) return items;
  return {
    items,
    total,
    page: window.page,
    limit: window.limit,
    totalPages: Math.ceil(total / window.limit) || 0,
  };
}
