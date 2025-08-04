import { type MotionProps, motion } from 'framer-motion';
import type React from 'react';
import type { AnchorHTMLAttributes } from 'react';
import styled from 'styled-components';

import { theme } from '~components/ThemeProvider';

const Link: React.FC<MotionProps & AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, href, ...rest }) => {
  return (
    <_Link
      {...rest}
      whileHover={{
        backgroundColor: theme().hoverBg,
      }}
      href={href}
    >
      {children}
    </_Link>
  );
};

const _Link = styled(motion.a)`
  font-size: 14px;
  font-weight: 200;
  text-decoration: none;
  background-color: transparent;
  padding: 8px;
  border-radius: 4px;
  color: ${({ theme }) => theme.fg};
  text-overflow: ellipsis;
`;

export { Link };
