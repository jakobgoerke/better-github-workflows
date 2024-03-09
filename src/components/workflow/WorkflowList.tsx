import { Link } from 'components/common';
import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React from 'react';
import styled from 'styled-components';
import { getWorkflowFileNameFromPath } from 'util/github';

const WorkflowList: React.FC = observer(() => {
  const { appStore } = useStore();

  const buildWorkflowLink = (path: string): string => {
    const file = getWorkflowFileNameFromPath(path);
    return `https://github.com/${appStore.repository.owner}/${appStore.repository.name}/actions/workflows/${file}`;
  };

  return (
    <Wrapper>
      {appStore.filteredWorkflows.map((workflow) => (
        <Link key={workflow.id} href={buildWorkflowLink(workflow.path)}>
          {workflow.name}
        </Link>
      ))}
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(48, 54, 61, 0.48);
`;

export { WorkflowList };
