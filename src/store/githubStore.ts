import { action, makeAutoObservable, observable } from 'mobx';

export class GithubStore {
  constructor() {
    makeAutoObservable(this);
  }
}
