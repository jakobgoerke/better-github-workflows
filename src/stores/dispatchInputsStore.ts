import { action, makeAutoObservable, observable } from 'mobx';

import type { Repository } from '~utils/github';
import { cacheStorage } from '~utils/storage';
import type { DispatchInputValues } from '~utils/workflowDispatch';

export const DISPATCH_INPUTS_STORAGE_KEY = 'lastDispatchInputs';
export const MAX_STORED_WORKFLOWS = 50;

export interface DispatchInputsRecord {
  inputs: DispatchInputValues;
  ranAt: string;
}

type DispatchInputsByWorkflow = Record<string, DispatchInputsRecord>;

const buildKey = (repository: Repository, workflowFile: string): string => {
  return `${repository.owner}/${repository.name}:${workflowFile}`;
};

export class DispatchInputsStore {
  constructor() {
    makeAutoObservable(this);
  }

  @observable private records: DispatchInputsByWorkflow = {};

  private loaded: Promise<void> | null = null;

  @action public capture = async (repository: Repository, workflowFile: string, inputs: DispatchInputValues) => {
    if (Object.keys(inputs).length === 0) {
      return;
    }

    await this.load();

    this.setRecord(buildKey(repository, workflowFile), {
      inputs,
      ranAt: new Date().toISOString(),
    });

    await cacheStorage.set(DISPATCH_INPUTS_STORAGE_KEY, this.records).catch((error) => {
      console.error('Failed to store workflow dispatch inputs:', error);
    });
  };

  public getLast = async (repository: Repository, workflowFile: string): Promise<DispatchInputsRecord | undefined> => {
    await this.load();

    return this.records[buildKey(repository, workflowFile)];
  };

  private load = (): Promise<void> => {
    this.loaded ??= cacheStorage
      .get<DispatchInputsByWorkflow>(DISPATCH_INPUTS_STORAGE_KEY)
      .then((records) => {
        this.setRecords(records ?? {});
      })
      .catch((error) => {
        console.error('Failed to load workflow dispatch inputs:', error);
        this.setRecords({});
      });

    return this.loaded;
  };

  @action private setRecords(records: DispatchInputsByWorkflow) {
    this.records = records;
  }

  @action private setRecord(key: string, record: DispatchInputsRecord) {
    const entries = Object.entries({ ...this.records, [key]: record })
      .sort(([, a], [, b]) => b.ranAt.localeCompare(a.ranAt))
      .slice(0, MAX_STORED_WORKFLOWS);

    this.records = Object.fromEntries(entries);
  }
}
