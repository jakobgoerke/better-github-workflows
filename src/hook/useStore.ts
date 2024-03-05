import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import type { AuthStore, GithubStore } from 'store';

interface Stores {
  authStore: AuthStore;
  githubStore: GithubStore;
}

const useStore = (): Stores => useContext(MobXProviderContext as any);

export { useStore };
export type { Stores };
