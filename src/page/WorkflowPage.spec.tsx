import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Routes } from '~util/routes';

import { WorkflowPage } from './WorkflowPage';

vi.mock('~components/workflow', () => ({
  SettingsButton: ({ onClick, ...props }) => (
    <button data-testid="settings-button" onClick={onClick} {...props}>
      Settings
    </button>
  ),
  WorkflowFilter: () => <div data-testid="workflow-filter">Workflow Filter</div>,
  WorkflowList: () => <div data-testid="workflow-list">Workflow List</div>
}));

vi.mock('~util/router', () => ({
  router: {
    navigate: vi.fn()
  }
}));

vi.mock('~hook/useStore', () => {
  const mockLoadAllWorkflows = vi.fn();

  return {
    useStore: () => ({
      repositoryStore: {
        repository: null
      },
      workflowStore: {
        loadAllWorkflows: mockLoadAllWorkflows
      }
    })
  };
});

describe('WorkflowPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load workflows on mount and on repository change', async () => {
    // given
    const { useStore } = await import('~hook/useStore');
    const store = useStore();

    // when
    render(<WorkflowPage />);

    // then
    expect(store.workflowStore.loadAllWorkflows).toHaveBeenCalledTimes(1);
  });

  it('navigates to setup page when settings button is clicked', async () => {
    const user = userEvent.setup();
    const { router } = await import('~util/router');

    render(<WorkflowPage />);

    const settingsButton = screen.getByTestId('settings-button');
    await user.click(settingsButton);

    expect(router.navigate).toHaveBeenCalledWith(Routes.Setup);
    expect(router.navigate).toHaveBeenCalledTimes(1);
  });
});
