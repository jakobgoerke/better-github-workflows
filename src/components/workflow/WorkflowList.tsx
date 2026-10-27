import { observer } from 'mobx-react';
import type React from 'react';
import styled from 'styled-components';

import { WorkflowGroupNode } from './WorkflowGroup';
import { WorkflowLink } from './WorkflowLink';
import type { Workflow } from '~clients/githubClient';
import { useStore } from '~hooks/useStore';
import { OTHER_GROUP_KEY, OTHER_GROUP_NAME } from '~utils/grouping';

const WorkflowList: React.FC = observer(() => {
  const { workflowStore } = useStore();
  const tree = workflowStore.workflowTree;

  const sortByName = (a: Workflow, b: Workflow) => {
    return a.name.localeCompare(b.name);
  };

  if (tree) {
    return (
      <Wrapper>
        {tree.groups.map((group) => (
          <WorkflowGroupNode key={group.key} group={group} />
        ))}
        {tree.other.length > 0 && (
          <WorkflowGroupNode group={{ key: OTHER_GROUP_KEY, name: OTHER_GROUP_NAME, groups: [], workflows: tree.other }} />
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {workflowStore.filteredWorkflows.sort(sortByName).map((workflow) => (
        <WorkflowLink key={workflow.id} workflow={workflow} />
      ))}
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.border};
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

export { WorkflowList };
