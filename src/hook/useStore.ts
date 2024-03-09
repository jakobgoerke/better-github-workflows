import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import type { AppStore } from 'store';

type Stores = {
  appStore: AppStore;
};

const useStore = (): Stores => useContext(MobXProviderContext as any);

export { useStore };
export type { Stores };
