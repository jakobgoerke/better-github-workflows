import { motion, type MotionProps, type TargetAndTransition } from 'framer-motion';
import { observer } from 'mobx-react';
import React, { type ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

const Button: React.FC<MotionProps & ButtonHTMLAttributes<HTMLButtonElement>> = observer(({ ...rest }) => {
  return <_Button whileHover={buttonHover} {...rest} />;
});

const _Button = styled(motion.button)`
  border: 1px solid rgb(48, 54, 61);
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
  align-self: self-start;
`;

const buttonHover: TargetAndTransition = {
  border: '1px solid rgb(48, 54, 61)',
  backgroundColor: 'rgb(48, 54, 61)',
  cursor: 'pointer'
};

export { Button };
