import { observer } from 'mobx-react';
import type React from 'react';
import type { ChangeEvent } from 'react';

import { Input } from '~components/common';
import { useStore } from '~hooks/useStore';

const WorkflowFilter: React.FC = observer(() => {
  const { workflowStore } = useStore();

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    workflowStore.setFilter(e.target.value);
  };

  return (
    <Input
      data-testid="input-workflowfilter"
      placeholder="Filter…"
      onChange={handleFilterChange}
      onKeyDown={(e) => e.stopPropagation()}
      withClearButton={!!workflowStore.filter}
      onClear={() => workflowStore.setFilter('')}
      value={workflowStore.filter}
    />
  );
});

export { WorkflowFilter };
