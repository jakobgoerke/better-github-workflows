import { Heading } from 'components/Heading';
import { SettingsButton } from 'components/SettingsButton';
import { WorkflowFilter } from 'components/WorkflowFilter';
import { WorkflowList } from 'components/WorkflowList';
import { useStore } from 'hook/useStore';
import { SettingsIcon as _SettingsIcon } from 'icon/Settings';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { router } from 'util/router';

const WorkflowPage: React.FC = observer(() => {
  const { appStore } = useStore();

  useEffect(() => {
    console.log('load workflows');

    appStore.loadWorkflows();
  }, [appStore.repository]);

  const handleSettingsClick = () => {
    router.navigate('/setup');
  };

  return (
    <Wrapper>
      <Head>
        <Heading>Actions</Heading>
        <SettingsButton onClick={handleSettingsClick} />
      </Head>
      <WorkflowFilter />
      <WorkflowList />
      {appStore.error && <Error>Failed to load workflows…</Error>}
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
