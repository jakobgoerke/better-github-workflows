import { action, computed, makeAutoObservable, observable } from 'mobx';

import type { Workflow } from '~types/github';
import type { RepositoryStore } from './repositoryStore';
import type { RootStore } from './rootStore';

export class WorkflowStore {
  constructor(rootStore: RootStore) {
    this.repositoryStore = rootStore.repositoryStore;
    makeAutoObservable(this);
  }

  private repositoryStore: RepositoryStore;

  @observable workflows: Workflow[] = [];
  @observable filter: string = '';

  @computed public get filteredWorkflows() {
    return this.workflows.filter((workflow) => {
      return workflow.name.toLowerCase().includes(this.filter.toLowerCase());
    });
  }

  @action public loadAllWorkflows = async () => {
    if (!this.repositoryStore.githubClient) {
      console.warn('GitHub client is not initialized. Cannot load workflows.');
      return;
    }

    const firstResult = await this.repositoryStore.githubClient.getWorkflows(1);
    this.setWorkflows(firstResult.workflows);

    const remainingPages = Math.ceil(firstResult.total_count / 100);

    const pagePromises = [];
    for (let page = 2; page <= remainingPages; page++) {
      pagePromises.push(this.repositoryStore.githubClient.getWorkflows(page));
    }

    const results = await Promise.all(pagePromises);

    results.forEach((res) => {
      this.addWorkflows(res.workflows);
    });
  };

  @action public setFilter = (filter: string) => {
    this.filter = filter;
  };

  @action private setWorkflows(workflows: Workflow[]) {
    this.workflows = workflows;
  }

  @action private addWorkflows(workflows: Workflow[]) {
    this.workflows.push(...workflows);
  }
}
