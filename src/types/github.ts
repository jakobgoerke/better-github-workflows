export interface GetWorkflowsResponse {
  total_count: number;
  workflows: Workflow[];
}

export type WorkflowState = 'active' | 'deleted' | 'disabled_fork' | 'disabled_inactivity' | 'disabled_manually';

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
