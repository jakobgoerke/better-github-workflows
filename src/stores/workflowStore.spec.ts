import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GroupingStore } from './groupingStore';
import type { RepositoryStore } from './repositoryStore';
import type { RootStore } from './rootStore';
import { WorkflowStore } from './workflowStore';
import { type GithubClient, WorkflowStates } from '~clients/githubClient';
import { DEFAULT_GROUPING_SETTINGS, type GroupingSettings } from '~utils/grouping';

describe('workflowStore', () => {
  const mockWorkflow = {
    id: 1,
    node_id: 'W_kwDOABC123',
    name: 'Test Workflow 1',
    path: '.github/workflows/test1.yml',
    state: WorkflowStates.ACTIVE,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    url: 'https://api.github.com/repos/owner/repo/actions/workflows/1',
    html_url: 'https://github.com/owner/repo/actions/workflows/test1.yml',
    badge_url: 'https://github.com/owner/repo/workflows/Test%20Workflow%201/badge.svg',
  };

  const mockWorkflowsResponse = {
    workflows: [mockWorkflow],
    total_count: 1,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadAllWorkflows', () => {
    it('should load all the workflows', async () => {
      // given
      const rootStoreMock = getRootStoreMock();
      const { githubClient } = rootStoreMock.repositoryStore;
      const store = new WorkflowStore(rootStoreMock);

      vi.mocked(rootStoreMock.repositoryStore.githubClient.getWorkflows) //
        .mockResolvedValue(mockWorkflowsResponse);

      // when
      await store.loadAllWorkflows();

      // then
      expect(githubClient.getWorkflows).toHaveBeenCalledWith(1);
      expect(store.workflows).toStrictEqual(mockWorkflowsResponse.workflows);
    });

    it('should load 100 workflows per page', async () => {
      // given
      const rootStoreMock = getRootStoreMock();
      const { githubClient } = rootStoreMock.repositoryStore;
      const store = new WorkflowStore(rootStoreMock);

      vi.mocked(githubClient.getWorkflows).mockResolvedValue({
        ...mockWorkflowsResponse,
        total_count: 500,
      });

      // when
      await store.loadAllWorkflows();

      // then
      expect(githubClient.getWorkflows).toHaveBeenCalledTimes(5);
      expect(store.workflows.length).toStrictEqual(5);
    });

    it('should reload with a new client while a previous load is pending', async () => {
      // given
      const rootStoreMock = getRootStoreMock();
      const staleClient = rootStoreMock.repositoryStore.githubClient;
      const store = new WorkflowStore(rootStoreMock);
      const repositoryStore = store['repositoryStore'];

      let rejectStale: (error: Error) => void;
      vi.mocked(staleClient.getWorkflows).mockReturnValue(
        new Promise((_, reject) => {
          rejectStale = reject;
        }),
      );
      const staleLoad = store.loadAllWorkflows();

      const newClient = { getWorkflows: vi.fn().mockResolvedValue(mockWorkflowsResponse) } as Partial<GithubClient>;
      repositoryStore.githubClient = newClient as GithubClient;

      // when
      await store.loadAllWorkflows();
      rejectStale(new Error('401'));
      await staleLoad;

      // then
      expect(newClient.getWorkflows).toHaveBeenCalledWith(1);
      expect(store.workflows).toStrictEqual(mockWorkflowsResponse.workflows);
      expect(store.isLoading).toBe(false);
    });
  });

  it('should filter workflows by name', () => {
    // given
    const mockWorkflow1 = { ...mockWorkflow, name: 'Test Workflow 1' };
    const mockWorkflow2 = { ...mockWorkflow, name: 'Another Workflow' };
    const rootStoreMock = getRootStoreMock();
    const store = new WorkflowStore(rootStoreMock);

    store.workflows = [mockWorkflow1, mockWorkflow2];

    // when
    store.setFilter(mockWorkflow1.name);

    // then
    expect(store.filteredWorkflows).toHaveLength(1);
    expect(store.filteredWorkflows[0]).toStrictEqual(mockWorkflow1);
  });

  it('should filter workflows by all space separated terms in any order', () => {
    // given
    const mockWorkflow1 = { ...mockWorkflow, name: 'Deploy Production' };
    const mockWorkflow2 = { ...mockWorkflow, name: 'Deploy Staging' };
    const mockWorkflow3 = { ...mockWorkflow, name: 'Build Production' };
    const rootStoreMock = getRootStoreMock();
    const store = new WorkflowStore(rootStoreMock);

    store.workflows = [mockWorkflow1, mockWorkflow2, mockWorkflow3];

    // when
    store.setFilter('prod  deploy ');

    // then
    expect(store.filteredWorkflows).toHaveLength(1);
    expect(store.filteredWorkflows[0]).toStrictEqual(mockWorkflow1);
  });

  it('should return all workflows when filter is only whitespace', () => {
    // given
    const mockWorkflow1 = { ...mockWorkflow, name: 'Deploy Production' };
    const mockWorkflow2 = { ...mockWorkflow, name: 'Build Production' };
    const rootStoreMock = getRootStoreMock();
    const store = new WorkflowStore(rootStoreMock);

    store.workflows = [mockWorkflow1, mockWorkflow2];

    // when
    store.setFilter('   ');

    // then
    expect(store.filteredWorkflows).toHaveLength(2);
  });

  describe('workflowTree', () => {
    const GROUPING: GroupingSettings = {
      enabled: true,
      splitChars: '-, __',
      groups: [{ id: '1', name: 'tool', children: [] }],
    };

    it('should be null when grouping is disabled', () => {
      // given
      const store = new WorkflowStore(getRootStoreMock({ ...GROUPING, enabled: false }));
      store.workflows = [mockWorkflow];

      // then
      expect(store.workflowTree).toBeNull();
    });

    it('should be null without groups or split chars', () => {
      expect(new WorkflowStore(getRootStoreMock({ ...GROUPING, groups: [] })).workflowTree).toBeNull();
      expect(new WorkflowStore(getRootStoreMock({ ...GROUPING, splitChars: ' , ' })).workflowTree).toBeNull();
    });

    it('should group the filtered workflows', () => {
      // given
      const deploy = { ...mockWorkflow, id: 1, name: 'tool-redis__deploy' };
      const destroy = { ...mockWorkflow, id: 2, name: 'tool-redis__destroy' };
      const other = { ...mockWorkflow, id: 3, name: 'build' };
      const store = new WorkflowStore(getRootStoreMock(GROUPING));
      store.workflows = [deploy, destroy, other];

      // when
      store.setFilter('deploy');

      // then
      expect(store.isFiltering).toBe(true);
      expect(store.workflowTree.groups).toHaveLength(1);
      expect(store.workflowTree.groups[0].workflows).toStrictEqual([{ workflow: deploy, displayName: 'redis__deploy' }]);
      expect(store.workflowTree.other).toHaveLength(0);
    });
  });

  // helper
  const getRootStoreMock = (grouping: GroupingSettings = DEFAULT_GROUPING_SETTINGS): RootStore => {
    const mockGithubClient: Partial<GithubClient> = {
      getWorkflows: vi.fn(),
    };

    const mockRepositoryStore: Partial<RepositoryStore> = {
      githubClient: mockGithubClient as GithubClient,
    };

    const mockGroupingStore: Partial<GroupingStore> = {
      settings: grouping,
    };

    const mockRootStore: Partial<RootStore> = {
      repositoryStore: mockRepositoryStore as RepositoryStore,
      groupingStore: mockGroupingStore as GroupingStore,
    };

    return mockRootStore as RootStore;
  };
});
