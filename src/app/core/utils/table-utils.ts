import type { WritableSignal } from '@angular/core';
import { signal } from '@angular/core';

export type SortDirection = 'asc' | 'desc';

export interface TableState<T> {
  page: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  sortKey: WritableSignal<keyof T | null>;
  sortDir: WritableSignal<SortDirection>;
  filterText: WritableSignal<string>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (key: keyof T) => void;
  setFilterText: (text: string) => void;
}

export function applyFilter<T extends { name?: string; location?: string; status?: string }>(
  rows: ReadonlyArray<T>,
  filterText: string
): T[] {
  const trimmed = filterText.trim().toLowerCase();
  if (!trimmed) {
    return [...rows];
  }

  return rows.filter((row) => {
    const haystack = `${row.name ?? ''} ${row.location ?? ''} ${row.status ?? ''}`.toLowerCase();
    return haystack.includes(trimmed);
  });
}

export function applySort<T>(
  rows: ReadonlyArray<T>,
  sortKey: keyof T | null,
  sortDir: SortDirection = 'asc'
): T[] {
  if (!sortKey) {
    return [...rows];
  }

  const direction = sortDir === 'asc' ? 1 : -1;

  return [...rows]
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const aValue = a.row[sortKey];
      const bValue = b.row[sortKey];

      if (aValue === bValue) {
        return a.index - b.index; // stable sort fallback
      }

      if (aValue == null) {
        return -1 * direction;
      }

      if (bValue == null) {
        return 1 * direction;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      return aString.localeCompare(bString) * direction;
    })
    .map(({ row }) => row);
}

export function applyPagination<T>(rows: ReadonlyArray<T>, page: number, pageSize: number): T[] {
  const safePageSize = Math.max(1, pageSize);
  const safePage = Math.max(0, page);
  const start = safePage * safePageSize;
  return rows.slice(start, start + safePageSize);
}

export function createTableState<T>(): TableState<T> {
  const page = signal(0);
  const pageSize = signal(10);
  const sortKey = signal<keyof T | null>(null);
  const sortDir = signal<SortDirection>('asc');
  const filterText = signal('');

  const setPage = (nextPage: number) => {
    page.set(Math.max(0, nextPage));
  };

  const setPageSize = (size: number) => {
    pageSize.set(Math.max(1, size));
    page.set(0);
  };

  const setSort = (key: keyof T) => {
    if (sortKey() === key) {
      sortDir.set(sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      sortKey.set(key);
      sortDir.set('asc');
    }
  };

  const setFilterText = (text: string) => {
    filterText.set(text);
    page.set(0);
  };

  return { page, pageSize, sortKey, sortDir, filterText, setPage, setPageSize, setSort, setFilterText };
}
