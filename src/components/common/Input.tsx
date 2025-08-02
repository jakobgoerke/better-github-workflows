import { motion, type HTMLMotionProps, type TargetAndTransition } from 'framer-motion';
import { observer } from 'mobx-react';
import React from 'react';
import styled from 'styled-components';

import { theme } from '~components/ThemeProvider';
import { ClearIcon } from '~icons/Clear';

interface InputProps extends HTMLMotionProps<'input'> {
  withClearButton?: boolean;
  onClear?: () => void;
}

const Input: React.FC<InputProps> = observer(({ withClearButton, onClear, ...rest }) => {
  return (
    <Container>
      <_Input whileFocus={inputFocus} className="form-control" {...rest} />
      {withClearButton && (
        <ClearButton type="button" onClick={onClear} whileHover={wrapperHover}>
          <ClearIcon />
        </ClearButton>
      )}
    </Container>
  );
});

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const _Input = styled(motion.input)`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
  outline: none;
`;

const inputFocus: TargetAndTransition = {
  borderColor: theme().focusColor,
  outline: 'none',
  boxShadow: `inset 0 0 1px ${theme().focusColor}`
};

const ClearButton = styled(motion.button)`
  display: flex;
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.fg};
  font-size: 14px;
  padding: 7px;
  border-radius: 4px;
`;

const wrapperHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
  cursor: 'pointer'
};

export { Input };
