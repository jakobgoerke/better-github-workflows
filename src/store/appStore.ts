import { ApiClient } from 'api/apiClient';
import { action, computed, makeAutoObservable, observable } from 'mobx';
import type { Workflow } from 'type/github';
import { getRepositoryFromUrl, type Repository } from 'util/github';
import { router } from 'util/router';
import { storage } from 'util/storage';

export const TOKEN_STORAGE_KEY = 'githubToken';

export class AppStore {
  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  client: ApiClient = null;

  @observable token: string = '';
  @observable repository: Repository = getRepositoryFromUrl();
  
  @observable filter: string = '';
  @observable workflows: Workflow[] = [];
  @observable error: boolean = false;
  
  @action init = async () => {
    this.token = await storage.get(TOKEN_STORAGE_KEY);

    if (this.token) {
      router.navigate('/workflows');
    }

    storage.watch({
      [TOKEN_STORAGE_KEY]: (change) => {
        this.token = change.newValue;
      }
    });
  }

  @action setupClient = () => {
    this.client = new ApiClient(this.token, this.repository);
  };

  @action loadWorkflows = async () => {
    if (!this.client) {
      this.setupClient();
    }

    try {
      this.workflows = (await this.client.getWorkflows(1)).workflows;
    } catch (error) {
      this.error = true;
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
}
