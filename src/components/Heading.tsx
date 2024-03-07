import React, { type PropsWithChildren } from 'react';
import styled from 'styled-components';

const Heading: React.FC<PropsWithChildren> = ({ children }) => {
  return <_Heading>{children}</_Heading>;
};

const _Heading = styled.span`
  font-size: 20px;
  font-weight: 600;
`;

export { Heading };
