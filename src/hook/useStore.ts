import { createContext, useContext } from 'react';

import { AppStore } from '~store';

type Stores = {
  appStore: AppStore;
};

const rootStore: Stores = {
  appStore: new AppStore()
};

const StoreContext = createContext(rootStore);
const useStore = (): Stores => useContext(StoreContext);

export { useStore, rootStore };
export type { Stores };
