import { makeAutoObservable } from 'mobx';

import { DEFAULT_GROUPING_SETTINGS, type GroupingSettings, migrateGroupingSettings } from '~utils/grouping';
import { cacheStorage, storage } from '~utils/storage';

export const GROUPING_STORAGE_KEY = 'grouping';
export const COLLAPSED_GROUPS_STORAGE_KEY = 'collapsedGroups';

export class GroupingStore {
  constructor() {
    makeAutoObservable(this);
    this.loaded = this.init();
  }

  settings: GroupingSettings = DEFAULT_GROUPING_SETTINGS;
  collapsed: string[] = [];

  public loaded: Promise<void>;

  private init = async () => {
    const [settings, collapsed] = await Promise.all([
      storage.get<GroupingSettings>(GROUPING_STORAGE_KEY).catch((error) => {
        console.error('Failed to load grouping settings:', error);
        return undefined;
      }),
      cacheStorage.get<string[]>(COLLAPSED_GROUPS_STORAGE_KEY).catch((error) => {
        console.error('Failed to load collapsed groups:', error);
        return undefined;
      }),
    ]);

    this.setLoaded(migrateGroupingSettings(settings), collapsed ?? []);
  };

  public setSettings = async (settings: GroupingSettings) => {
    this.settings = settings;

    await storage.set(GROUPING_STORAGE_KEY, settings).catch((error) => {
      console.error('Failed to store grouping settings:', error);
    });
  };

  public isCollapsed = (key: string): boolean => {
    return this.collapsed.includes(key);
  };

  public toggleCollapsed = async (key: string) => {
    this.collapsed = this.isCollapsed(key) ? this.collapsed.filter((entry) => entry !== key) : [...this.collapsed, key];

    await cacheStorage.set(COLLAPSED_GROUPS_STORAGE_KEY, this.collapsed).catch((error) => {
      console.error('Failed to store collapsed groups:', error);
    });
  };

  private setLoaded(settings: GroupingSettings, collapsed: string[]) {
    this.settings = settings;
    this.collapsed = collapsed;
  }
}
