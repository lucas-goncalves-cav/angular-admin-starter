import { PageRequest, PagedResult } from '../models';

export function paginate<T>(
  source: T[],
  request: PageRequest,
  sortValue: (item: T, key: string) => string | number
): PagedResult<T> {
  const sorted = request.sortBy
    ? [...source].sort((left, right) => compare(sortValue(left, request.sortBy!), sortValue(right, request.sortBy!)))
    : [...source];

  if (request.sortDescending) {
    sorted.reverse();
  }

  const pageSize = Math.max(1, request.pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(1, request.page), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    totalItems: sorted.length,
    page,
    pageSize,
    totalPages
  };
}

function compare(left: string | number, right: string | number): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right));
}
