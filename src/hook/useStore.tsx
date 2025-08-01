import React, { createContext, useContext, type PropsWithChildren } from 'react';

import { RootStore } from '~store/rootStore';

let rootStore: RootStore;
const StoreContext = createContext<RootStore | undefined>(undefined);
const useStore = (): RootStore => useContext(StoreContext);

const RootStoreProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const root = rootStore ?? new RootStore();

  return <StoreContext.Provider value={root}>{children}</StoreContext.Provider>;
};

export { rootStore, RootStoreProvider, useStore };
