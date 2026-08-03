import { DispatchInputsStore, RepositoryStore, WorkflowStore } from '.';

export class RootStore {
  workflowStore: WorkflowStore;
  repositoryStore: RepositoryStore;
  dispatchInputsStore: DispatchInputsStore;

  constructor() {
    this.repositoryStore = new RepositoryStore();
    this.workflowStore = new WorkflowStore(this);
    this.dispatchInputsStore = new DispatchInputsStore();
  }
}
