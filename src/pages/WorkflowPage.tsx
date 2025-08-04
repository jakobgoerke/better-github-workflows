import { observer } from 'mobx-react';
import type React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';

import { Heading } from '~components/common/Heading';
import { SettingsButton, WorkflowFilter, WorkflowList } from '~components/workflow';
import { useStore } from '~hooks/useStore';
import { router } from '~utils/router';
import { Routes } from '~utils/routes';

const WorkflowPage: React.FC = observer(() => {
  const { repositoryStore, workflowStore } = useStore();

  useEffect(() => {
    workflowStore.loadAllWorkflows();
  }, [repositoryStore.githubClient]);

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

export { WorkflowPage };
