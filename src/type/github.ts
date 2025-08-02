export interface GetWorkflowsResponse {
  total_count: number;
  workflows: Workflow[];
}

export const WorkflowStates = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  DISABLED_FORK: 'disabled_fork',
  DISABLED_INACTIVITY: 'disabled_inactivity',
  DISABLED_MANUALLY: 'disabled_manually'
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
