import { motion, type MotionProps, type TargetAndTransition } from 'framer-motion';
import { observer } from 'mobx-react';
import React, { type ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { theme } from '~components/ThemeProvider';

const Button: React.FC<MotionProps & ButtonHTMLAttributes<HTMLButtonElement>> = observer(({ ...rest }) => {
  return <_Button whileHover={buttonHover} {...rest} />;
});

const _Button = styled(motion.button)`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
  align-self: self-start;
`;

const buttonHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
  cursor: 'pointer'
};

export { Button };
