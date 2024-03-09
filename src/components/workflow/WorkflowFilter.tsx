import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React, { type ChangeEvent } from 'react';

import { Input } from '../common/Input';

const WorkflowFilter: React.FC = observer(() => {
  const { appStore } = useStore();

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    appStore.setFilter(e.target.value);
  };

  return <Input data-testid="input-workflowfilter" placeholder="Filter…" onChange={handleFilterChange} />;
});

export { WorkflowFilter };
