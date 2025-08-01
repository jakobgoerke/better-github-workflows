import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { Heading } from '~components/common/Heading';
import { SettingsButton, WorkflowFilter, WorkflowList } from '~components/workflow';
import { useStore } from '~hook/useStore';
import { router, Routes } from '~util/router';

const WorkflowPage: React.FC = observer(() => {
  const { repositoryStore, workflowStore } = useStore();

  useEffect(() => {
    workflowStore.loadAllWorkflows();
  }, [repositoryStore.repository]);

  const handleSettingsClick = () => {
    router.navigate(Routes.Setup);
  };

  return (
    <Wrapper data-testid="page-workflows">
      <Head>
        <Heading>Actions</Heading>
        <SettingsButton onClick={handleSettingsClick} />
      </Head>
      <WorkflowFilter />
      <WorkflowList />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex: 0 0 100%;
  flex-direction: column;
  gap: 16px;
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Error = styled.span`
  font-size: 12px;
  color: #fa5149;
`;

export { WorkflowPage };
