import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';

const WorkflowPage: React.FC = observer(() => {
  const { appStore } = useStore();

  useEffect(() => {
    appStore.loadWorkflows();
  }, [appStore.token]);

  return <>{JSON.stringify(appStore.workflows)}</>;
});

export { WorkflowPage };
