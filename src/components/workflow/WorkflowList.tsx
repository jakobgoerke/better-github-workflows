import { observer } from 'mobx-react';
import React from 'react';
import styled from 'styled-components';

import { Link } from '~components/common';
import { useStore } from '~hook/useStore';
import type { Workflow } from '~type/github';
import { getWorkflowFileNameFromPath } from '~util/github';

const WorkflowList: React.FC = observer(() => {
  const { repositoryStore, workflowStore } = useStore();

  const buildWorkflowLink = (path: string): string => {
    const file = getWorkflowFileNameFromPath(path);
    return `https://github.com/${repositoryStore.repository.owner}/${repositoryStore.repository.name}/actions/workflows/${file}`;
  };

  const sortByName = (a: Workflow, b: Workflow) => {
    return a.name.localeCompare(b.name);
  };

  return (
    <Wrapper>
      {workflowStore.filteredWorkflows.sort(sortByName).map((workflow) => (
        <Link data-testid="workflow-link" key={workflow.id} href={buildWorkflowLink(workflow.path)}>
          {workflow.name}
        </Link>
      ))}
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

export { WorkflowList };
