import { observer } from 'mobx-react';
import React from 'react';
import styled from 'styled-components';

import { Link } from '~components/common';
import { useStore } from '~hook/useStore';
import { getWorkflowFileNameFromPath } from '~util/github';

const WorkflowList: React.FC = observer(() => {
  const { appStore } = useStore();

  const buildWorkflowLink = (path: string): string => {
    const file = getWorkflowFileNameFromPath(path);
    return `https://github.com/${appStore.repository.owner}/${appStore.repository.name}/actions/workflows/${file}`;
  };

  return (
    <Wrapper>
      {appStore.filteredWorkflows.map((workflow) => (
        <Link data-testid="workflow-link" key={workflow.id} href={buildWorkflowLink(workflow.path)}>
          {workflow.name}
        </Link>
      ))}
      {!appStore.doneLoading && (
        <LoadMore data-testid="workflow-load-more" key="loadMore" onClick={() => appStore.loadRemainingPages()}>
          Load more…
        </LoadMore>
      )}
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const LoadMore = styled(Link)`
  color: ${({ theme }) => theme.accentFg};
`;

export { WorkflowList };
