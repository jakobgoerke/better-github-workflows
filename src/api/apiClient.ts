import axios, { AxiosInstance } from 'axios';
import { toJS } from 'mobx';
import type { Workflow } from 'type/github';
import type { Repository } from 'util/github';

class ApiClient {
  constructor(token: string, repository: Repository) {
    this.api = axios.create({
      baseURL: `https://api.github.com/repos/${repository.owner}/${repository.name}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  }

  private api: AxiosInstance;

  public async getWorkflows(page: number): Promise<Workflow[]> {
    return (
      (
        await this.api.get(`/actions/workflows`, {
          params: {
            per_page: 100,
            page
          }
        })
      ).data ?? []
    );
  }
}

export { ApiClient };