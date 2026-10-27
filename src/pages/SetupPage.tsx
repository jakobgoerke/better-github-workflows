import { useStorage } from '@plasmohq/storage/hook';
import { observer } from 'mobx-react';
import type React from 'react';
import styled from 'styled-components';

import { Button, Heading, Input } from '~components/common';
import { GroupingSettings } from '~components/settings';
import { useStore } from '~hooks/useStore';
import { GROUPING_STORAGE_KEY } from '~stores/groupingStore';
import { TOKEN_STORAGE_KEY } from '~stores/repositoryStore';
import { cleanGroupingSettings, DEFAULT_GROUPING_SETTINGS, type GroupingSettings as GroupingSettingsValue } from '~utils/grouping';
import { router } from '~utils/router';
import { Routes } from '~utils/routes';

const SetupPage: React.FC = observer(() => {
  const { repositoryStore, groupingStore, workflowStore } = useStore();
  const [token, _, { setRenderValue }] = useStorage(TOKEN_STORAGE_KEY, '');
  const [storedGrouping, __, { setRenderValue: setGroupingRenderValue }] = useStorage<GroupingSettingsValue>(
    GROUPING_STORAGE_KEY,
    DEFAULT_GROUPING_SETTINGS,
  );
  const grouping = { ...DEFAULT_GROUPING_SETTINGS, ...storedGrouping };

  const save = () => {
    repositoryStore.setToken(token);
    groupingStore.setSettings(cleanGroupingSettings(grouping));
    router.navigate(Routes.Workflows);
  };

  return (
    <Wrapper data-testid="page-setup">
      <Head>
        <Heading>Settings</Heading>
        <SaveButton data-testid="token-save" onClick={save} disabled={!token}>
          Save
        </SaveButton>
      </Head>
      <Input
        data-testid="token-input"
        placeholder="Please input an accesstoken..."
        value={token}
        type="password"
        onChange={(e) => setRenderValue(e.target.value)}
      />
      <Span>
        Needs atleast <b>workflow:read</b> permission
      </Span>
      <GroupingSettings
        value={grouping}
        workflowNames={workflowStore.workflows.map((workflow) => workflow.name)}
        onChange={setGroupingRenderValue}
      />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex: 0 0 100%;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SaveButton = styled(Button)`
  align-self: center;
`;

const Span = styled.span`
  font-size: 12px;
  color: #848d97;
`;

export { SetupPage };
