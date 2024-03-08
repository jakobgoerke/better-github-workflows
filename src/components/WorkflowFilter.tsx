import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React, { type ChangeEvent } from 'react';

import { Input } from './Input';

const WorkflowFilter: React.FC = observer(() => {
  const { appStore } = useStore();

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    appStore.setFilter(e.target.value);
  };

  return <Input placeholder="Filter…" onChange={handleFilterChange} />;
});

export { WorkflowFilter };
