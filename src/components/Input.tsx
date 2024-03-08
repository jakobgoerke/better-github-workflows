import { observer } from 'mobx-react';
import React, { type InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = observer(({ ...rest }) => {
  return <_Input {...rest} />;
});

const _Input = styled.input`
  border: 1px solid rgb(48, 54, 61);
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
`;

export { Input };
