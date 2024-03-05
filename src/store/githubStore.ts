import { action, makeAutoObservable, observable } from 'mobx';
import { getRepositoryFromUrl, type Repository } from 'util/github';

export class GithubStore {
  constructor() {
    makeAutoObservable(this);
  }

  @observable repository: Repository = getRepositoryFromUrl();
}
