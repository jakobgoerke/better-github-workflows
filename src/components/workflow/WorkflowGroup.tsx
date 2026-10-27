import { motion, type TargetAndTransition } from 'framer-motion';
import { observer } from 'mobx-react';
import type React from 'react';
import styled from 'styled-components';

import { WorkflowLink } from './WorkflowLink';
import { theme } from '~components/ThemeProvider';
import { useStore } from '~hooks/useStore';
import { ChevronIcon } from '~icons/Chevron';
import { countWorkflows, type WorkflowGroup } from '~utils/grouping';

interface WorkflowGroupNodeProps {
  group: WorkflowGroup;
}

const WorkflowGroupNode: React.FC<WorkflowGroupNodeProps> = observer(({ group }) => {
  const { groupingStore, workflowStore } = useStore();
  const isOpen = workflowStore.isFiltering || !groupingStore.isCollapsed(group.key);

  const handleToggle = () => {
    if (!workflowStore.isFiltering) {
      groupingStore.toggleCollapsed(group.key);
    }
  };

  return (
    <Wrapper data-testid="workflow-group" data-group-key={group.key}>
      <Header data-testid="workflow-group-toggle" type="button" aria-expanded={isOpen} onClick={handleToggle} whileHover={headerHover}>
        <ChevronIcon initial={false} animate={{ rotate: isOpen ? 90 : 0 }} />
        <Name>{group.name}</Name>
        <Count>{countWorkflows(group)}</Count>
      </Header>
      {isOpen && (
        <Body>
          {group.groups.map((child) => (
            <WorkflowGroupNode key={child.key} group={child} />
          ))}
          {group.workflows.map(({ workflow, displayName }) => (
            <WorkflowLink key={workflow.id} workflow={workflow} label={displayName} />
          ))}
        </Body>
      )}
    </Wrapper>
  );
});

const headerHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
`;

const Name = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Count = styled.span`
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #848d97;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  padding-left: 4px;
  border-left: 1px solid ${({ theme }) => theme.border};
`;

export { WorkflowGroupNode };
