import { action, computed, makeAutoObservable, observable } from 'mobx';

import type { Workflow } from '~type/github';
import type { RepositoryStore } from './repositoryStore';
import type { RootStore } from './rootStore';

export class WorkflowStore {
  constructor(rootStore: RootStore) {
    this.repositoryStore = rootStore.repositoryStore;
    makeAutoObservable(this);
  }

  private repositoryStore: RepositoryStore;

  @observable workflows: Workflow[] = [];
  @observable isLoading: boolean = false;
  @observable filter: string = '';

  @computed public get filteredWorkflows() {
    return this.workflows.filter((workflow) => {
      return workflow.name.toLowerCase().includes(this.filter.toLowerCase());
    });
  }

  @action public loadAllWorkflows = async () => {
    if (this.isLoading || !this.repositoryStore.client) {
      return;
    }

    this.setLoading(true);
    const firstResult = await this.repositoryStore.client.getWorkflows(1);
    this.workflows = firstResult.workflows;

    const remainingPages = Math.ceil(firstResult.total_count / 100) - 1;

    const pagePromises = [];
    for (let page = 2; page <= remainingPages + 1; page++) {
      pagePromises.push(this.repositoryStore.client.getWorkflows(page));
    }

    const results = await Promise.all(pagePromises);

    results.forEach((res) => {
      this.workflows.push(...res.workflows);
    });

    this.setLoading(false);
  };

  @action public setFilter = (filter: string) => {
    this.filter = filter;
  };

  @action private setLoading(loading: boolean) {
    this.isLoading = loading;
  }
}
