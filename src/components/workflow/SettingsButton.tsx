import { motion, type MotionProps, type TargetAndTransition } from 'framer-motion';
import React, { type HTMLAttributes } from 'react';
import styled from 'styled-components';

import { theme } from '~components/ThemeProvider';
import { SettingsIcon } from '~icon/Settings';

const SettingsButton: React.FC<MotionProps & HTMLAttributes<HTMLDivElement>> = ({ ...rest }) => {
  return (
    <Wrapper {...rest} whileHover={wrapperHover}>
      <SettingsIcon />
    </Wrapper>
  );
};

const wrapperHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
  cursor: 'pointer'
};

const Wrapper = styled(motion.div)`
  background-color: transparent;
  border-radius: 4px;
  align-self: center;
  display: flex;
  padding: 8px;
`;

export { SettingsButton };
