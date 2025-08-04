import axios, { type AxiosInstance } from 'axios';

import type { Repository } from '~utils/github';

export const WorkflowStates = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  DISABLED_FORK: 'disabled_fork',
  DISABLED_INACTIVITY: 'disabled_inactivity',
  DISABLED_MANUALLY: 'disabled_manually',
} as const;

export type WorkflowState = (typeof WorkflowStates)[keyof typeof WorkflowStates];

export interface Workflow {
  id: number;
  node_id: string;
  name: string;
  path: string;
  state: WorkflowState;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

export namespace GhResponse {
  export interface GetWorkflows {
    total_count: number;
    workflows: Workflow[];
  }
}

class GithubClient {
  constructor(token: string, repository: Repository) {
    this.api = axios.create({
      baseURL: `https://api.github.com/repos/${repository.owner}/${repository.name}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  }

  private api: AxiosInstance;

  public async getWorkflows(page: number): Promise<GhResponse.GetWorkflows> {
    return (
      (
        await this.api.get(`/actions/workflows`, {
          params: {
            per_page: 100,
            page,
          },
        })
      ).data ?? []
    );
  }
}

export { GithubClient };
