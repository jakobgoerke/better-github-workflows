import { action, computed, makeAutoObservable, observable, runInAction } from 'mobx';

import { GithubClient } from '~client/githubClient';
import type { Workflow } from '~type/github';
import { getRepositoryFromPath, type Repository } from '~util/github';
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
  
  @observable repository: Repository = getRepositoryFromPath(window.location.pathname);
  @observable filter: string = '';
  @observable workflows: Workflow[] = [];
  @observable isLoading: boolean = false;
  @observable error: boolean = false;
  
  @action init = async () => {
    this.token = await storage.get(TOKEN_STORAGE_KEY);
    if (this.token) {
      router.navigate(Routes.Workflows);
    }

    setInterval(() => {
      console.log('still alive')
    }, 1000);

    window.addEventListener('turbo:load', (e) => {
      // @ts-ignore
      const url = new URL(e.detail.url);
      this.setRepository(getRepositoryFromPath(url.pathname));
    });
  }

  @action setRepository = (repository: Repository) => {
    this.repository = repository;
    this.setupClient();
  }

  @action setToken = (token: string) => {
    this.token = token;
    storage.setItem(TOKEN_STORAGE_KEY, token);
    this.setupClient();
  }

  @action loadWorkflows = async (page: number = 1) => {
    if (this.isLoading || !this.client) {
      return;
    }

    if (page === 1) {
      this.workflows = [];
    }

    this.isLoading = true;
    try {
      const response = await this.client.getWorkflows(page);

      runInAction(() => {
        this.isLoading = false;
        this.workflows.push(...response.workflows);
        if (response.total_count >= (page * 100)) {
          this.loadWorkflows(page + 1);
        }
        this.error = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = true;
      });
    }
  };

  @action setFilter = (filter: string) => {
    this.filter = filter;
  }

  @computed get filteredWorkflows() {
    return this.workflows.filter((workflow) => {
      return workflow.name.toLowerCase().includes(this.filter.toLowerCase());
    });
  }

  private setupClient = () => {
    this.client = new GithubClient(this.token, this.repository);
  };
}
