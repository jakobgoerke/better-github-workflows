import { afterEach, describe, expect, it, vi } from 'vitest';

import { COLLAPSED_GROUPS_STORAGE_KEY, GROUPING_STORAGE_KEY, GroupingStore } from './groupingStore';
import { DEFAULT_GROUPING_SETTINGS, type GroupingSettings } from '~utils/grouping';
import { cacheStorage, storage } from '~utils/storage';

describe('groupingStore', () => {
  const SETTINGS: GroupingSettings = {
    enabled: true,
    splitChars: '-, __',
    groups: [{ id: '1', name: 'tool', children: [] }],
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load settings and collapsed groups from storage', async () => {
    // given
    vi.spyOn(storage, 'get').mockResolvedValue(SETTINGS);
    vi.spyOn(cacheStorage, 'get').mockResolvedValue(['tool']);

    // when
    const store = new GroupingStore();
    await store.loaded;

    // then
    expect(store.settings).toStrictEqual(SETTINGS);
    expect(store.isCollapsed('tool')).toBe(true);
  });

  it('should fall back to defaults when nothing is stored', async () => {
    // given
    vi.spyOn(storage, 'get').mockResolvedValue(undefined);
    vi.spyOn(cacheStorage, 'get').mockRejectedValue(new Error('broken'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // when
    const store = new GroupingStore();
    await store.loaded;

    // then
    expect(store.settings).toStrictEqual(DEFAULT_GROUPING_SETTINGS);
    expect(store.collapsed).toStrictEqual([]);
  });

  it('should persist settings', async () => {
    // given
    vi.spyOn(storage, 'get').mockResolvedValue(undefined);
    vi.spyOn(cacheStorage, 'get').mockResolvedValue(undefined);
    const setSpy = vi.spyOn(storage, 'set').mockResolvedValue(undefined);
    const store = new GroupingStore();
    await store.loaded;

    // when
    await store.setSettings(SETTINGS);

    // then
    expect(store.settings).toStrictEqual(SETTINGS);
    expect(setSpy).toHaveBeenCalledWith(GROUPING_STORAGE_KEY, SETTINGS);
  });

  it('should toggle and persist collapsed groups', async () => {
    // given
    vi.spyOn(storage, 'get').mockResolvedValue(undefined);
    vi.spyOn(cacheStorage, 'get').mockResolvedValue(undefined);
    const setSpy = vi.spyOn(cacheStorage, 'set').mockResolvedValue(undefined);
    const store = new GroupingStore();
    await store.loaded;

    // when
    await store.toggleCollapsed('tool/infra');

    // then
    expect(store.isCollapsed('tool/infra')).toBe(true);
    expect(setSpy).toHaveBeenLastCalledWith(COLLAPSED_GROUPS_STORAGE_KEY, ['tool/infra']);

    // when
    await store.toggleCollapsed('tool/infra');

    // then
    expect(store.isCollapsed('tool/infra')).toBe(false);
    expect(setSpy).toHaveBeenLastCalledWith(COLLAPSED_GROUPS_STORAGE_KEY, []);
  });
});
