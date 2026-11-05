import { listResult, resolveListWindow, UNPAGED_LIST_CAP } from './list-page.util';

describe('list-page.util', () => {
  it('keeps the array contract when page and limit are omitted', () => {
    const window = resolveListWindow(undefined, undefined);
    expect(window.paged).toBe(false);
    expect(window.limit).toBe(UNPAGED_LIST_CAP);
    expect(listResult(window, [{ id: 'a' }], 0)).toEqual([{ id: 'a' }]);
  });

  it('returns the paged envelope when limit is sent', () => {
    const window = resolveListWindow('2', '10');
    expect(window).toMatchObject({ paged: true, page: 2, limit: 10, skip: 10 });
    expect(listResult(window, [{ id: 'a' }], 25)).toEqual({
      items: [{ id: 'a' }],
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });

  it('caps an explicit page size at 100', () => {
    expect(resolveListWindow(1, 500).limit).toBe(100);
  });
});
