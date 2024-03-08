import { motion, type MotionProps, type TargetAndTransition } from 'framer-motion';
import { SettingsIcon } from 'icon/Settings';
import React, { type HTMLAttributes } from 'react';
import styled from 'styled-components';

const SettingsButton: React.FC<MotionProps & HTMLAttributes<HTMLDivElement>> = ({ ...rest }) => {
  return (
    <Wrapper {...rest} whileHover={wrapperHover}>
      <SettingsIcon whileHover={settingsHover} />
    </Wrapper>
  );
};

const settingsHover: TargetAndTransition = {
  scale: 1
};

const wrapperHover: TargetAndTransition = {
  border: '1px solid rgb(48, 54, 61)',
  backgroundColor: 'rgb(48, 54, 61)'
};

const Wrapper = styled(motion.div)`
  border: 1px solid transparent;
  border-radius: 4px;
  align-self: center;
  display: flex;
  padding: 8px;

  :hover {
    cursor: pointer;
  }
`;

export { SettingsButton };
