import { RepositoryStore, WorkflowStore } from '.';

export class RootStore {
  workflowStore: WorkflowStore;
  repositoryStore: RepositoryStore;

  constructor() {
    this.repositoryStore = new RepositoryStore();
    this.workflowStore = new WorkflowStore(this);
  }
}
