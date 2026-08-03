import React, { createContext, type PropsWithChildren, useContext } from 'react';

import { RootStore } from '~stores/rootStore';

let rootStore: RootStore;
const StoreContext = createContext<RootStore | undefined>(undefined);
const useStore = (): RootStore => useContext(StoreContext);

const RootStoreProvider: React.FC<PropsWithChildren> = ({ children }) => {
  rootStore ??= new RootStore();

  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};

export { RootStoreProvider, useStore };
