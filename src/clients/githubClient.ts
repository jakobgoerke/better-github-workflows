import axios, { type AxiosInstance } from 'axios';

import type { GhResponse } from '~types/github';
import type { Repository } from '~utils/github';

class GithubClient {
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

  public async getWorkflows(page: number): Promise<GhResponse.GetWorkflows> {
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

export { GithubClient };
