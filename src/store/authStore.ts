import { action, makeAutoObservable, observable } from 'mobx';
import { storage } from 'util/storage';

const TOKEN_STORAGE_KEY = 'githubToken';
export class AuthStore {
  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  @observable token: string = '';
  @observable isAuthenticated: boolean = false;
  
  @action init = () => {
    this.checkAuthentication();

    storage.watch({
      [TOKEN_STORAGE_KEY]: (change) => {
        console.log(`token: ${change.newValue}`);
        this.token = change.newValue || '';
      }
    })
  }

  @action checkAuthentication = async () => {
    const token = await storage.get(TOKEN_STORAGE_KEY);
    if (token) {
      this.token = token;
    }
  }
}
