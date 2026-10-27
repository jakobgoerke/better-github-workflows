import { type MotionProps, motion } from 'framer-motion';
import type React from 'react';
import type { RefAttributes } from 'react';
import styled from 'styled-components';

const PlusIcon: React.FC<MotionProps & RefAttributes<SVGSVGElement>> = ({ ...props }) => {
  return (
    <Svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
    </Svg>
  );
};

const Svg = styled(motion.svg)``;

export { PlusIcon };
