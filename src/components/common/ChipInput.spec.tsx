import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { ChipInput, type ChipInputOption } from './ChipInput';

const OPTIONS: ChipInputOption[] = [
  { value: 'tool', hint: '4 workflows' },
  { value: 'app', hint: '2 workflows' },
  { value: 'toolbox', hint: '1 workflow' },
];

const ControlledChipInput = ({ initial = [] }: { initial?: string[] }) => {
  const [values, setValues] = useState(initial);
  return <ChipInput data-testid="chip-input" values={values} options={OPTIONS} onChange={setValues} />;
};

describe('ChipInput', () => {
  const getOptions = () => screen.queryAllByTestId('chip-option').map((option) => option.firstChild.textContent);
  const getChips = () => screen.queryAllByTestId('chip').map((chip) => chip.textContent);

  it('should show all options on focus', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledChipInput />);

    // when
    await user.click(screen.getByTestId('chip-input'));

    // then
    expect(getOptions()).toStrictEqual(['tool', 'app', 'toolbox']);
    expect(screen.getByText('4 workflows')).toBeInTheDocument();
  });

  it('should filter options while typing and hide added values', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledChipInput initial={['Tool']} />);

    // when
    await user.type(screen.getByTestId('chip-input'), 'TOO');

    // then
    expect(getOptions()).toStrictEqual(['toolbox']);
  });

  it('should add an option by click and keep the list open', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledChipInput />);
    await user.click(screen.getByTestId('chip-input'));

    // when
    await user.click(screen.getByText('app'));

    // then
    expect(getChips()).toStrictEqual(['app']);
    expect(getOptions()).toStrictEqual(['tool', 'toolbox']);
  });

  it('should add the active option by keyboard', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledChipInput />);
    await user.click(screen.getByTestId('chip-input'));

    // when
    await user.keyboard('{ArrowDown}{Enter}');

    // then
    expect(getChips()).toStrictEqual(['app']);
  });

  it('should add free text on comma, escape + enter and blur, trimmed and without duplicates', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledChipInput />);
    const input = screen.getByTestId('chip-input');

    // when
    await user.type(input, ' custom ,other{Escape}{Enter}CUSTOM,last');
    await user.tab();

    // then
    expect(getChips()).toStrictEqual(['custom', 'other', 'last']);
    expect(input).toHaveValue('');
  });

  it('should remove chips by backspace and by their remove button', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledChipInput initial={['a', 'b', 'c']} />);

    // when
    await user.click(screen.getByTestId('chip-input'));
    await user.keyboard('{Backspace}');
    await user.click(screen.getAllByTestId('chip-remove')[0]);

    // then
    expect(getChips()).toStrictEqual(['b']);
  });
});
