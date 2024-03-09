import { motion, type MotionProps } from 'framer-motion';
import React, { type AnchorHTMLAttributes, type PropsWithChildren } from 'react';
import styled from 'styled-components';

const Link: React.FC<MotionProps & AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, href, ...rest }) => {
  return (
    <_Link
      {...rest}
      whileHover={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }}
      href={href}>
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
  color: #fff;
  text-overflow: ellipsis;
`;

export { Link };
