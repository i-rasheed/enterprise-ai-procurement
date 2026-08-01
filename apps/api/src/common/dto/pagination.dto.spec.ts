import { buildCursorPagination, buildOffsetPagination } from './pagination.dto';

describe('pagination utils', () => {
  it('builds offset pagination', () => {
    const result = buildOffsetPagination(['a', 'b'], 10, 1, 2);
    expect(result.totalPages).toBe(5);
    expect(result.items).toHaveLength(2);
  });

  it('builds cursor pagination with no more pages', () => {
    const items = [{ id: '1' }];
    const result = buildCursorPagination(items, 5);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});
