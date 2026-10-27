import { type MotionProps, motion } from 'framer-motion';
import type React from 'react';
import type { RefAttributes } from 'react';
import styled from 'styled-components';

const ChevronIcon: React.FC<MotionProps & RefAttributes<SVGSVGElement>> = ({ ...props }) => {
  return (
    <Svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
    </Svg>
  );
};

const Svg = styled(motion.svg)`
  flex-shrink: 0;
`;

export { ChevronIcon };
