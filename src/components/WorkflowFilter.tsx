import { useStore } from 'hook/useStore';
import { observer } from 'mobx-react';
import React, { type ChangeEvent } from 'react';
import styled from 'styled-components';

const WorkflowFilter: React.FC = observer(() => {
  const { appStore } = useStore();

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    appStore.setFilter(e.target.value);
  };

  return <Input placeholder="Filter…" onChange={handleFilterChange} />;
});

const Input = styled.input`
  margin: 16px 0px;
  border: 1px solid rgb(48, 54, 61);
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
`;

export { WorkflowFilter };
