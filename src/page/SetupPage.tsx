import { Button, Heading, Input } from 'components/common';
import { observer } from 'mobx-react';
import React from 'react';
import { TOKEN_STORAGE_KEY } from 'store/appStore';
import styled from 'styled-components';
import { router } from 'util/router';

import { useStorage } from '@plasmohq/storage/hook';

const SetupPage: React.FC = observer(() => {
  const [token, _, { setRenderValue, setStoreValue }] = useStorage(TOKEN_STORAGE_KEY, '');

  const save = () => {
    setStoreValue(token);
    router.navigate('/workflows');
  };

  return (
    <Wrapper>
      <Heading>Settings</Heading>
      <Input
        placeholder="Please input an accesstoken..."
        value={token}
        type="password"
        onChange={(e) => setRenderValue(e.target.value)}
      />
      <Span>
        Needs atleast <b>workflow:read</b> permission
      </Span>
      <Button onClick={save} disabled={!token}>
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
