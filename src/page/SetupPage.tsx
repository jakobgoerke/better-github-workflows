import { Heading } from 'components/Heading';
import { observer } from 'mobx-react';
import React from 'react';
import { TOKEN_STORAGE_KEY } from 'store/appStore';
import styled from 'styled-components';

import { useStorage } from '@plasmohq/storage/hook';

const SetupPage: React.FC = observer(() => {
  const [token, setToken, { setRenderValue, setStoreValue, remove }] = useStorage(TOKEN_STORAGE_KEY);

  return (
    <Wrapper>
      <Heading>Better Github Workflows</Heading>
      <TokenInput value={token} onChange={(e) => setRenderValue(e.target.value)} />
    </Wrapper>
  );
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TokenInput = styled.input`
  width: 100%;
`;

export { SetupPage };
