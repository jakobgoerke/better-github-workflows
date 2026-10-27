import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Combobox, type ComboboxOption } from './Combobox';

const OPTIONS: ComboboxOption[] = [
  { value: 'tool', hint: '4 workflows' },
  { value: 'app', hint: '2 workflows' },
  { value: 'toolbox', hint: '1 workflow' },
];

const ControlledCombobox = () => {
  const [value, setValue] = useState('');
  return <Combobox data-testid="combobox" value={value} options={OPTIONS} onChange={setValue} />;
};

describe('Combobox', () => {
  const getOptions = () => screen.queryAllByTestId('combobox-option').map((option) => option.firstChild.textContent);

  it('should show all options on focus', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledCombobox />);

    // when
    await user.click(screen.getByTestId('combobox'));

    // then
    expect(getOptions()).toStrictEqual(['tool', 'app', 'toolbox']);
    expect(screen.getByText('4 workflows')).toBeInTheDocument();
  });

  it('should filter options while typing', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledCombobox />);

    // when
    await user.type(screen.getByTestId('combobox'), 'TOO');

    // then
    expect(getOptions()).toStrictEqual(['tool', 'toolbox']);
  });

  it('should select an option by click', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledCombobox />);
    await user.click(screen.getByTestId('combobox'));

    // when
    await user.click(screen.getByText('app'));

    // then
    expect(screen.getByTestId('combobox')).toHaveValue('app');
    expect(getOptions()).toStrictEqual([]);
  });

  it('should select an option by keyboard', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledCombobox />);
    await user.click(screen.getByTestId('combobox'));

    // when
    await user.keyboard('{ArrowDown}{Enter}');

    // then
    expect(screen.getByTestId('combobox')).toHaveValue('app');
  });

  it('should close on escape and keep free text', async () => {
    // given
    const user = userEvent.setup();
    render(<ControlledCombobox />);

    // when
    await user.type(screen.getByTestId('combobox'), 'custom{Escape}');

    // then
    expect(screen.getByTestId('combobox')).toHaveValue('custom');
    expect(getOptions()).toStrictEqual([]);
  });
});
