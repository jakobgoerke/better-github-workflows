import type React from 'react';
import { type KeyboardEvent, useRef, useState } from 'react';
import styled from 'styled-components';

import { ClearIcon } from '~icons/Clear';

export interface ChipInputOption {
  value: string;
  hint?: string;
}

interface ChipInputProps {
  values: string[];
  options: ChipInputOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  'data-testid'?: string;
}

const ChipInput: React.FC<ChipInputProps> = ({ values, options, onChange, placeholder, autoFocus, ...rest }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const lowerValues = values.map((value) => value.toLowerCase());
  const query = draft.trim().toLowerCase();
  const matches = options.filter(
    (option) => option.value.toLowerCase().includes(query) && !lowerValues.includes(option.value.toLowerCase()),
  );
  const activeIndex = Math.min(active, matches.length - 1);
  const showList = isOpen && matches.length > 0;

  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !lowerValues.includes(trimmed.toLowerCase())) {
      onChange([...values, trimmed]);
    }
    setDraft('');
    setActive(0);
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive(showList ? (activeIndex + step + matches.length) % matches.length : 0);
      setOpen(true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      add(showList ? matches[activeIndex].value : draft);
    } else if (e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && values.length > 0) {
      remove(values.length - 1);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Wrapper>
      <Field onClick={() => inputRef.current?.focus()}>
        {values.map((value, index) => (
          <Chip data-testid="chip" key={value}>
            {value}
            <ChipRemove
              data-testid="chip-remove"
              type="button"
              title={`Remove ${value}`}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => remove(index)}
            >
              <ClearIcon />
            </ChipRemove>
          </Chip>
        ))}
        <TextInput
          {...rest}
          ref={inputRef}
          role="combobox"
          aria-expanded={showList}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          placeholder={values.length === 0 ? placeholder : undefined}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            add(draft);
            setOpen(false);
          }}
          onKeyDown={handleKeyDown}
        />
      </Field>
      {showList && (
        <List role="listbox">
          {matches.map((option, index) => (
            <Option
              data-testid="chip-option"
              key={option.value}
              role="option"
              aria-selected={index === activeIndex}
              $active={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                add(option.value);
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

const Field = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  padding: 3px 6px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  cursor: text;

  &:focus-within {
    border-color: ${({ theme }) => theme.focusColor};
    box-shadow: inset 0 0 1px ${({ theme }) => theme.focusColor};
  }
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
  padding: 1px 2px 1px 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.hoverBg};
  font-size: 12px;
  line-height: 20px;
  overflow-wrap: anywhere;
`;

const ChipRemove = styled.button`
  display: flex;
  padding: 4px;
  border: none;
  border-radius: 50%;
  background: none;
  color: inherit;
  font-size: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.hoverBg};
  }
`;

const TextInput = styled.input`
  flex: 1;
  min-width: 32px;
  padding: 2px;
  border: none;
  background: transparent;
  outline: none;
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

export { ChipInput };
