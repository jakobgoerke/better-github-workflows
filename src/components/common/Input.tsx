import { motion, type TargetAndTransition } from 'framer-motion';
import { observer } from 'mobx-react';
import React, { type InputHTMLAttributes } from 'react';
import styled from 'styled-components';

import { theme } from '~components/ThemeProvider';
import { ClearIcon } from '~icon/Clear';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  withClearButton?: boolean;
  onClear?: () => void;
}

const Input: React.FC<InputProps> = observer(({ withClearButton, onClear, ...rest }) => {
  return (
    <Container>
      <_Input {...rest} />
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

const _Input = styled.input`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 5px 12px;
  background-color: transparent;
`;

const ClearButton = styled(motion.button)`
  display: flex;
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  padding: 7px;
  border-radius: 4px;
`;

const wrapperHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
  cursor: 'pointer'
};

export { Input };
