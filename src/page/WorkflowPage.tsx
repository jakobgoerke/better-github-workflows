import { Heading } from 'components/Heading';
import { Link } from 'components/Link';
import { WorkflowFilter } from 'components/WorkflowFilter';
import { WorkflowList } from 'components/WorkflowList';
import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import styled from 'styled-components';

const WorkflowPage: React.FC = observer(() => {
  const { appStore } = useStore();

  useEffect(() => {
    appStore.loadWorkflows();
  }, [appStore.token]);

  return (
    <Wrapper>
      <Heading>Actions</Heading>
      <WorkflowFilter />
      <WorkflowList />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex: 0 0 100%;
  flex-direction: column;
`;

export { WorkflowPage };
