import { action, makeAutoObservable, observable } from 'mobx';

export class AuthStore {
  constructor() {
    makeAutoObservable(this);
  }
}
