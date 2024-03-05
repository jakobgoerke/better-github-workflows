import axios, { AxiosInstance } from 'axios';
import type { Repository } from 'util/github';

class ApiClient {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://github.com',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  }

  private api: AxiosInstance;

  public setBearerToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public setRepository(repository: Repository) {
    this.api.defaults.url = `/repos/${repository.owner}/${repository.name}/`;
  }

  public async getWorkflows(): Promise<any> {
    return (await this.api.get(`/actions/workflows`)).data ?? [];
  }
}

export const apiClient = new ApiClient();
