import { observer } from 'mobx-react';
import React, { type ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = observer(({ ...rest }) => {
  return <_Button {...rest} />;
});

const _Button = styled.button`
  border: 1px solid rgb(48, 54, 61);
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
  align-self: self-start;
`;

export { Button };
