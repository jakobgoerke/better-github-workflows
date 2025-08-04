import { afterEach, describe, expect, it, vi } from 'vitest';

import type { RepositoryStore } from './repositoryStore';
import type { RootStore } from './rootStore';
import { WorkflowStore } from './workflowStore';
import { type GithubClient, WorkflowStates } from '~clients/githubClient';

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

  // helper
  const getRootStoreMock = (): RootStore => {
    const mockGithubClient: Partial<GithubClient> = {
      getWorkflows: vi.fn(),
    };

    const mockRepositoryStore: Partial<RepositoryStore> = {
      githubClient: mockGithubClient as GithubClient,
    };

    const mockRootStore: Partial<RootStore> = {
      repositoryStore: mockRepositoryStore as RepositoryStore,
    };

    return mockRootStore as RootStore;
  };
});
