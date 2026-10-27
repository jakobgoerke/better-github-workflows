import { DispatchInputsStore, GroupingStore, RepositoryStore, WorkflowStore } from '.';

export class RootStore {
  workflowStore: WorkflowStore;
  repositoryStore: RepositoryStore;
  groupingStore: GroupingStore;
  dispatchInputsStore: DispatchInputsStore;

  constructor() {
    this.repositoryStore = new RepositoryStore();
    this.groupingStore = new GroupingStore();
    this.workflowStore = new WorkflowStore(this);
    this.dispatchInputsStore = new DispatchInputsStore();
  }
}
