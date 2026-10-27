import type React from 'react';
import { type KeyboardEvent, useState } from 'react';
import styled from 'styled-components';

import { Input } from './Input';

export interface ComboboxOption {
  value: string;
  hint?: string;
}

interface ComboboxProps {
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  'data-testid'?: string;
}

const Combobox: React.FC<ComboboxProps> = ({ value, options, onChange, ...rest }) => {
  const [isOpen, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const query = value.trim().toLowerCase();
  const matches = options.filter((option) => option.value.toLowerCase().includes(query) && option.value !== value);
  const activeIndex = Math.min(active, matches.length - 1);
  const showList = isOpen && matches.length > 0;

  const select = (option: ComboboxOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive(showList ? (activeIndex + step + matches.length) % matches.length : 0);
      setOpen(true);
    } else if (e.key === 'Enter' && showList) {
      e.preventDefault();
      select(matches[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Wrapper>
      <Input
        {...rest}
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {showList && (
        <List role="listbox">
          {matches.map((option, index) => (
            <Option
              data-testid="combobox-option"
              key={option.value}
              role="option"
              aria-selected={index === activeIndex}
              $active={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                select(option);
              }}
              onMouseEnter={() => setActive(index)}
            >
              <span>{option.value}</span>
              {option.hint && <Hint>{option.hint}</Hint>}
            </Option>
          ))}
        </List>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const List = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(1, 4, 9, 0.4);
`;

const Option = styled.li<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background-color: ${({ $active, theme }) => ($active ? theme.hoverBg : 'transparent')};
`;

const Hint = styled.span`
  font-size: 12px;
  color: #848d97;
  white-space: nowrap;
`;

export { Combobox };
