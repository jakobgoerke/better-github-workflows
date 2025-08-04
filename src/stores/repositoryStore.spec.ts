import { describe, it, vi } from 'vitest';

import { RepositoryStore, TOKEN_STORAGE_KEY } from './repositoryStore';
import type { Repository } from '~utils/github';
import { router } from '~utils/router';
import { Routes } from '~utils/routes';
import { storage } from '~utils/storage';

describe('repositoryStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const TOKEN = 'test-token';
  const REPOSITORY: Repository = {
    owner: 'owner',
    name: 'repo',
  };

  it('should set repository on init', async () => {
    // given
    mockToken(TOKEN);
    mockWindowLocation(`/${REPOSITORY.owner}/${REPOSITORY.name}/actions`);

    // when
    const store = await new RepositoryStore();

    // then
    expect(store.token).toBe(TOKEN);
    expect(store.repository).toStrictEqual(REPOSITORY);
  });

  it('should re-initialize repository on turbo:load event', async () => {
    // given
    const otherRepository: Repository = {
      owner: 'other-owner',
      name: 'other-repo',
    };
    mockToken(TOKEN);
    mockWindowLocation(`/${REPOSITORY.owner}/${REPOSITORY.name}/actions`);

    // when
    const store = await new RepositoryStore();
    expect(store.repository).toStrictEqual(REPOSITORY);
    dispatchLoadEvent(`https://github.com/${otherRepository.owner}/${otherRepository.name}/issues`);

    // then
    expect(store.repository).toStrictEqual(otherRepository);
  });

  it('should navigate to settings page when token is missing', async () => {
    // given
    mockToken('');
    const navigateSpy = vi.spyOn(router, 'navigate');

    // when
    await new RepositoryStore();

    // then
    expect(navigateSpy).toHaveBeenCalledWith(Routes.Setup);
  });

  it('setToken', async () => {
    // given
    mockToken(TOKEN);
    mockWindowLocation(`/${REPOSITORY.owner}/${REPOSITORY.name}/actions`);
    const storageSpy = vi.spyOn(storage, 'setItem');

    // when
    const store = await new RepositoryStore();
    store.setToken(TOKEN);

    // then
    expect(store.token).toBe(TOKEN);
    expect(storageSpy).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, TOKEN);
  });

  // helper
  const mockToken = (token: string) => {
    return vi.spyOn(storage, 'get').mockResolvedValue(token);
  };

  const mockWindowLocation = (pathname: string) => {
    // @ts-expect-error
    window.location = { pathname };
  };

  const dispatchLoadEvent = (url: string) => {
    const loadEvent = new CustomEvent('turbo:load', {
      detail: { url },
    });
    window.dispatchEvent(loadEvent);
  };
});
