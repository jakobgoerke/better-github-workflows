import { makeAutoObservable } from 'mobx';

import type { GroupingStore } from './groupingStore';
import type { RepositoryStore } from './repositoryStore';
import type { RootStore } from './rootStore';
import type { GithubClient, Workflow } from '~clients/githubClient';
import { buildWorkflowTree, parseSplitChars, type WorkflowTree } from '~utils/grouping';

export class WorkflowStore {
  constructor(rootStore: RootStore) {
    this.repositoryStore = rootStore.repositoryStore;
    this.groupingStore = rootStore.groupingStore;
    makeAutoObservable(this);
  }

  private repositoryStore: RepositoryStore;
  private groupingStore: GroupingStore;
  private loadingClient: GithubClient | null = null;

  workflows: Workflow[] = [];
  filter: string = '';
  isLoading: boolean = false;

  public get filteredWorkflows() {
    const terms = this.filter.toLowerCase().split(/\s+/).filter(Boolean);
    return this.workflows.filter((workflow) => {
      const name = workflow.name.toLowerCase();
      return terms.every((term) => name.includes(term));
    });
  }

  public get isFiltering() {
    return this.filter.trim() !== '';
  }

  public get workflowTree(): WorkflowTree | null {
    const { settings } = this.groupingStore;

    if (!settings.enabled || settings.groups.length === 0 || parseSplitChars(settings.splitChars).length === 0) {
      return null;
    }

    return buildWorkflowTree(this.filteredWorkflows, settings);
  }

  public loadAllWorkflows = async () => {
    const githubClient = this.repositoryStore.githubClient;

    if (!githubClient) {
      console.warn('GitHub client is not initialized. Cannot load workflows.');
      return;
    }

    if (this.isLoading && this.loadingClient === githubClient) {
      console.warn('Workflows are already being loaded.');
      return;
    }

    this.loadingClient = githubClient;
    this.setLoading(true);

    const firstResult = await githubClient
      .getWorkflows(1) //
      .catch((error) => {
        console.error('Failed to load workflows:', error);
      });

    if (this.loadingClient !== githubClient) {
      return;
    }

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
        githubClient.getWorkflows(page).catch((error) => {
          console.error(`Failed to load workflows for page ${page}:`, error);
          return { workflows: [] };
        }),
      );
    }

    const results = await Promise.all(pagePromises);

    if (this.loadingClient !== githubClient) {
      return;
    }

    results.forEach((res) => {
      this.addWorkflows(res.workflows);
    });

    this.setLoading(false);
  };

  public setFilter = (filter: string) => {
    this.filter = filter;
  };

  private setWorkflows(workflows: Workflow[]) {
    this.workflows = workflows;
  }

  private addWorkflows(workflows: Workflow[]) {
    this.workflows.push(...workflows);
  }

  private setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }
}
