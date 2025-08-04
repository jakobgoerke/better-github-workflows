import { type MotionProps, motion, type TargetAndTransition } from 'framer-motion';
import type React from 'react';
import type { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { theme } from '~components/ThemeProvider';
import { SettingsIcon } from '~icons/Settings';

const SettingsButton: React.FC<MotionProps & HTMLAttributes<HTMLDivElement>> = ({ ...rest }) => {
  return (
    <Wrapper {...rest} whileHover={wrapperHover}>
      <SettingsIcon />
    </Wrapper>
  );
};

const wrapperHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
  cursor: 'pointer',
};

const Wrapper = styled(motion.div)`
  background-color: transparent;
  border-radius: 4px;
  align-self: center;
  display: flex;
  padding: 6px;
  font-size: 14px;
`;

export { SettingsButton };
