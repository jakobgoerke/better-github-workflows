import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React from 'react';

const SetupPage: React.FC = observer(() => {
  const { githubStore } = useStore();

  return <>Setup: {JSON.stringify(githubStore.repository)}</>;
});

export { SetupPage };
