import { action, makeAutoObservable, observable } from 'mobx';

import { GithubClient } from '~client/githubClient';
import { getRepositoryFromPath, type Repository } from '~util/github';
import { Routes, router } from '~util/router';
import { storage } from '~util/storage';

export const TOKEN_STORAGE_KEY = 'githubToken';

export class RepositoryStore {
  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  public client: GithubClient | null = null;

  @observable token: string = '';
  @observable repository: Repository;

  @action private init = async () => {
    this.token = await storage.get(TOKEN_STORAGE_KEY);
    this.setRepository(getRepositoryFromPath(window.location.pathname));

    if (!this.token) {
      router.navigate(Routes.Setup);
    }

    window.addEventListener('turbo:load', (e) => {
      // @ts-ignore
      const url = new URL(e.detail.url);
      this.setRepository(getRepositoryFromPath(url.pathname));
    });
  };

  @action setToken = (token: string) => {
    this.token = token;
    storage.setItem(TOKEN_STORAGE_KEY, token);
    this.setupClient();
  };

  @action private setRepository = (repository: Repository) => {
    this.repository = repository;
    this.setupClient();
  };

  private setupClient = () => {
    this.client = new GithubClient(this.token, this.repository);
  };
}
