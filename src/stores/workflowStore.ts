import { action, computed, makeAutoObservable, observable } from 'mobx';

import type { RepositoryStore } from './repositoryStore';
import type { RootStore } from './rootStore';
import type { Workflow } from '~clients/githubClient';

export class WorkflowStore {
  constructor(rootStore: RootStore) {
    this.repositoryStore = rootStore.repositoryStore;
    makeAutoObservable(this);
  }

  private repositoryStore: RepositoryStore;

  @observable workflows: Workflow[] = [];
  @observable filter: string = '';
  @observable isLoading: boolean = false;

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

    if (this.isLoading) {
      console.warn('Workflows are already being loaded.');
      return;
    }

    this.setLoading(true);

    const firstResult = await this.repositoryStore.githubClient
      .getWorkflows(1) //
      .catch((error) => {
        console.error('Failed to load workflows:', error);
      });

    if (!firstResult) {
      console.warn('No workflows found or failed to fetch workflows.');
      this.setLoading(false);
      return;
    }

    this.setWorkflows(firstResult.workflows);

    const remainingPages = Math.ceil(firstResult.total_count / 100);

    const pagePromises = [];
    for (let page = 2; page <= remainingPages; page++) {
      pagePromises.push(
        this.repositoryStore.githubClient.getWorkflows(page).catch((error) => {
          console.error(`Failed to load workflows for page ${page}:`, error);
          return { workflows: [] };
        }),
      );
    }

    const results = await Promise.all(pagePromises);

    results.forEach((res) => {
      this.addWorkflows(res.workflows);
    });

    this.setLoading(false);
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

  @action private setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }
}
