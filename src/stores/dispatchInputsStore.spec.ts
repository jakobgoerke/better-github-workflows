import { afterEach, describe, expect, it, vi } from 'vitest';

import { DISPATCH_INPUTS_STORAGE_KEY, DispatchInputsStore, MAX_STORED_WORKFLOWS } from './dispatchInputsStore';
import type { Repository } from '~utils/github';
import { cacheStorage } from '~utils/storage';

describe('dispatchInputsStore', () => {
  const REPOSITORY: Repository = {
    owner: 'owner',
    name: 'repo',
  };
  const WORKFLOW_FILE = 'e2e-test.yml';
  const INPUTS = { message: 'weeeeeeeeee', verbose: 'true' };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should capture the inputs of a run and persist them', async () => {
    // given
    mockStoredRecords({});
    const setSpy = vi.spyOn(cacheStorage, 'set').mockResolvedValue(undefined);
    const store = new DispatchInputsStore();

    // when
    await store.capture(REPOSITORY, WORKFLOW_FILE, INPUTS);

    // then
    const record = await store.getLast(REPOSITORY, WORKFLOW_FILE);
    expect(record.inputs).toStrictEqual(INPUTS);
    expect(setSpy).toHaveBeenCalledWith(DISPATCH_INPUTS_STORAGE_KEY, {
      [`${REPOSITORY.owner}/${REPOSITORY.name}:${WORKFLOW_FILE}`]: record,
    });
  });

  it('should keep the inputs of every workflow apart', async () => {
    // given
    mockStoredRecords({});
    vi.spyOn(cacheStorage, 'set').mockResolvedValue(undefined);
    const store = new DispatchInputsStore();

    // when
    await store.capture(REPOSITORY, WORKFLOW_FILE, INPUTS);

    // then
    expect(await store.getLast(REPOSITORY, 'other.yml')).toBeUndefined();
    expect(await store.getLast({ owner: 'other', name: 'repo' }, WORKFLOW_FILE)).toBeUndefined();
  });

  it('should not capture a run without inputs', async () => {
    // given
    mockStoredRecords({});
    const setSpy = vi.spyOn(cacheStorage, 'set').mockResolvedValue(undefined);
    const store = new DispatchInputsStore();

    // when
    await store.capture(REPOSITORY, WORKFLOW_FILE, {});

    // then
    expect(setSpy).not.toHaveBeenCalled();
    expect(await store.getLast(REPOSITORY, WORKFLOW_FILE)).toBeUndefined();
  });

  it('should drop the least recently used workflows', async () => {
    // given
    mockStoredRecords(buildStoredRecords(MAX_STORED_WORKFLOWS));
    vi.spyOn(cacheStorage, 'set').mockResolvedValue(undefined);
    const store = new DispatchInputsStore();

    // when
    await store.capture(REPOSITORY, WORKFLOW_FILE, INPUTS);

    // then
    expect(await store.getLast(REPOSITORY, WORKFLOW_FILE)).toBeDefined();
    expect(await store.getLast(REPOSITORY, 'workflow-0.yml')).toBeUndefined();
    expect(await store.getLast(REPOSITORY, `workflow-${MAX_STORED_WORKFLOWS - 1}.yml`)).toBeDefined();
  });

  // helper
  const mockStoredRecords = (records: object) => {
    return vi.spyOn(cacheStorage, 'get').mockResolvedValue(records);
  };

  const buildStoredRecords = (amount: number) => {
    return Object.fromEntries(
      Array.from({ length: amount }, (_, index) => [
        `${REPOSITORY.owner}/${REPOSITORY.name}:workflow-${index}.yml`,
        { inputs: INPUTS, ranAt: new Date(2020, 0, index + 1).toISOString() },
      ]),
    );
  };
});
