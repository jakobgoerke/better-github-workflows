import { Button, Heading, Input } from 'components/common';
import { observer } from 'mobx-react';
import React from 'react';
import { AppStore, TOKEN_STORAGE_KEY } from 'store/appStore';
import styled from 'styled-components';
import { Routes, router } from 'util/router';

import { useStorage } from '@plasmohq/storage/hook';
import { useStore } from 'hook/useStore';

const SetupPage: React.FC = observer(() => {
  const { appStore } = useStore();
  const [token, _, { setRenderValue, setStoreValue }] = useStorage(TOKEN_STORAGE_KEY, '');

  const save = () => {
    appStore.setToken(token);
    router.navigate(Routes.Workflows);
  };

  return (
    <Wrapper data-testid="page-setup">
      <Heading>Settings</Heading>
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
      <Button data-testid="token-save" onClick={save} disabled={!token}>
        Save
      </Button>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Span = styled.span`
  font-size: 12px;
  color: #848d97;
`;

export { SetupPage };
