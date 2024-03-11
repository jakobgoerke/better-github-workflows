import { action, computed, makeAutoObservable, observable, runInAction } from 'mobx';

import { GithubClient } from '~client/githubClient';
import type { Workflow } from '~type/github';
import { getRepositoryFromUrl, type Repository } from '~util/github';
import { Routes, router } from '~util/router';
import { storage } from '~util/storage';

export const TOKEN_STORAGE_KEY = 'githubToken';

export class AppStore {
  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  client: GithubClient = null;

  @observable token: string = '';
  @observable repository: Repository = getRepositoryFromUrl();
  
  @observable filter: string = '';
  @observable totalPages: number = 1;
  @observable doneLoading: boolean = false;

  @observable workflows: Workflow[] = [];
  @observable error: boolean = false;
  
  @action init = async () => {
    this.token = await storage.get(TOKEN_STORAGE_KEY);

    if (this.token) {
      router.navigate(Routes.Workflows);
    }
  }

  @action setToken = (token: string) => {
    this.token = token;
    storage.setItem(TOKEN_STORAGE_KEY, token);
  }

  @action setupClient = () => {
    this.client = new GithubClient(this.token, this.repository);
  };

  @action loadFirstPage = async () => {
    if (this.doneLoading) return;

    if (!this.client) {
      this.setupClient();
    }

    this.workflows = [];
    const firstPage = await this.client.getWorkflows(1);

    runInAction(() => {
      this.workflows = firstPage.workflows;
      this.totalPages = Math.floor(firstPage.total_count / 100) || 1;

      if (this.totalPages === 1) {
        this.doneLoading = true;
      }
    });
  };

  @action loadRemainingPages = async (): Promise<void> => {
    if (this.doneLoading) {
      return;
    }

    const remainingPages = Array.from({ length: this.totalPages - 1 }, (_, i) => i + 2);
    const pages = await Promise.all(remainingPages.map((page) => this.client.getWorkflows(page)));

    runInAction(() => {
      this.workflows = pages.reduce((acc, page) => acc.concat(page.workflows), this.workflows);
      this.doneLoading = true;
    });
  };

  @action setFilter = async (filter: string) => {
    await this.loadRemainingPages();

    runInAction(() => {
      this.filter = filter;
    });
  }

  @computed get filteredWorkflows() {
    return this.workflows.filter((workflow) => {
      return workflow.name.toLowerCase().includes(this.filter.toLowerCase());
    });
  }
}
