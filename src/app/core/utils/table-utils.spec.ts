import { applyFilter, applyPagination, applySort } from './table-utils';

describe('table-utils', () => {
  const rows = [
    { id: 1, name: 'Alpha', location: 'Berlin', status: 'OK', score: 90 },
    { id: 2, name: 'Bravo', location: 'Bucharest', status: 'WARN', score: 70 },
    { id: 3, name: 'Charlie', location: 'Cluj', status: 'ERROR', score: 80 },
    { id: 4, name: 'Alpha', location: 'Prague', status: 'OK', score: 95 }
  ];

  describe('applyFilter', () => {
    it('filters rows by name, location, or status (case-insensitive)', () => {
      expect(applyFilter(rows, 'alpha').map((r) => r.id)).toEqual([1, 4]);
      expect(applyFilter(rows, 'bucharest').map((r) => r.id)).toEqual([2]);
      expect(applyFilter(rows, 'warn').map((r) => r.id)).toEqual([2]);
      expect(applyFilter(rows, 'unknown')).toEqual([]);
    });
  });

  describe('applySort', () => {
    it('sorts ascending/descending while keeping stability for equal values', () => {
      const asc = applySort(rows, 'name', 'asc').map((r) => r.id);
      expect(asc).toEqual([1, 4, 2, 3]);

      const desc = applySort(rows, 'score', 'desc').map((r) => r.id);
      expect(desc).toEqual([4, 1, 3, 2]);

      // stable ordering: both id 1 and 4 have same name "Alpha"
      const stableCheck = applySort(rows, 'name', 'asc')
        .filter((r) => r.name === 'Alpha')
        .map((r) => r.id);
      expect(stableCheck).toEqual([1, 4]);
    });
  });

  describe('applyPagination', () => {
    it('returns the requested slice based on page and size', () => {
      expect(applyPagination(rows, 0, 2).map((r) => r.id)).toEqual([1, 2]);
      expect(applyPagination(rows, 1, 2).map((r) => r.id)).toEqual([3, 4]);
      expect(applyPagination(rows, 2, 2)).toEqual([]);
    });
  });
});
