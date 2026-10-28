import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PlasmoCSUIAnchor } from 'plasmo';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DispatchPrefill, { getInlineAnchorList } from './dispatchPrefill';

const dispatchInputsStoreMock = {
  capture: vi.fn().mockResolvedValue(undefined),
  getLast: vi.fn().mockResolvedValue(undefined),
};

vi.mock('~hooks/useStore', () => ({
  RootStoreProvider: ({ children }) => children,
  useStore: () => ({ dispatchInputsStore: dispatchInputsStoreMock }),
}));

describe('dispatchPrefill', () => {
  const REPOSITORY = { owner: 'owner', name: 'repo' };
  const WORKFLOW_FILE = 'e2e-test.yml';
  const LAST_RUN = {
    inputs: { message: 'from the last run', environment: 'production', verbose: 'false' },
    ranAt: new Date(2026, 0, 1).toISOString(),
  };

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    dispatchInputsStoreMock.getLast.mockResolvedValue(undefined);
  });

  it('should anchor itself to the run button of every popover', () => {
    // given
    renderDispatchPopover();

    // when
    const anchors = getInlineAnchorList({});

    // then
    expect(anchors).toStrictEqual([{ element: document.querySelector('button[type="submit"]'), insertPosition: 'beforebegin' }]);
  });

  it('should anchor itself to the run button of the dialog footer', () => {
    // given
    renderDispatchDialog();

    // when
    const anchors = getInlineAnchorList({});

    // then
    expect(anchors).toStrictEqual([{ element: document.querySelector('button[form="dispatch-form"]'), insertPosition: 'beforebegin' }]);
  });

  it('should prefill and capture the inputs of the dialog form', async () => {
    // given
    const user = userEvent.setup();
    dispatchInputsStoreMock.getLast.mockResolvedValue(LAST_RUN);
    const form = renderDispatchDialog();
    render(<DispatchPrefill anchor={{ element: document.querySelector('button[form="dispatch-form"]'), type: 'inline' }} />);

    // when
    await user.click(await screen.findByTestId('prefill-last-run'));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // then
    expect(dispatchInputsStoreMock.getLast).toHaveBeenCalledWith(REPOSITORY, WORKFLOW_FILE);
    expect(form.querySelector<HTMLInputElement>('[name="inputs[message]"]').value).toBe(LAST_RUN.inputs.message);
    await waitFor(() => expect(dispatchInputsStoreMock.capture).toHaveBeenCalledWith(REPOSITORY, WORKFLOW_FILE, LAST_RUN.inputs));
  });

  it('should capture the inputs when a workflow is run', async () => {
    // given
    const form = renderDispatchPopover();
    render(<DispatchPrefill anchor={anchorOf(form)} />);

    // when
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // then
    await waitFor(() =>
      expect(dispatchInputsStoreMock.capture).toHaveBeenCalledWith(REPOSITORY, WORKFLOW_FILE, {
        message: 'weeeeeeeeee',
        environment: 'staging',
        verbose: 'true',
      }),
    );
  });

  it('should not render without a previous run', async () => {
    // given
    const form = renderDispatchPopover();

    // when
    render(<DispatchPrefill anchor={anchorOf(form)} />);

    // then
    await waitFor(() => expect(dispatchInputsStoreMock.getLast).toHaveBeenCalled());
    expect(screen.queryByTestId('prefill-last-run')).toBeNull();
  });

  it('should prefill the inputs of the last run and confirm it', async () => {
    // given
    const user = userEvent.setup();
    dispatchInputsStoreMock.getLast.mockResolvedValue(LAST_RUN);
    const form = renderDispatchPopover();
    render(<DispatchPrefill anchor={anchorOf(form)} />);

    // when
    await user.click(await screen.findByTestId('prefill-last-run'));

    // then
    expect(form.querySelector<HTMLInputElement>('[name="inputs[message]"]').value).toBe(LAST_RUN.inputs.message);
    expect(form.querySelector<HTMLSelectElement>('[name="inputs[environment]"]').value).toBe(LAST_RUN.inputs.environment);
    expect(form.querySelector<HTMLInputElement>('input[type="checkbox"]').checked).toBe(false);
    expect(screen.getByTestId('prefill-last-run')).toHaveAttribute('data-feedback', 'prefilled');
    expect(screen.getByRole('button', { name: 'Prefilled' })).toBeInTheDocument();
    expect(dispatchInputsStoreMock.capture).not.toHaveBeenCalled();
  });

  // helper
  const renderDispatchPopover = (): HTMLFormElement => {
    document.body.innerHTML = `
      <form action="/${REPOSITORY.owner}/${REPOSITORY.name}/actions/manual">
        <input type="hidden" name="workflow" value=".github/workflows/${WORKFLOW_FILE}" />
        <input name="inputs[message]" value="weeeeeeeeee" />
        <select name="inputs[environment]">
          <option value="staging" selected>staging</option>
          <option value="production">production</option>
        </select>
        <input type="hidden" name="inputs[verbose]" value="false" />
        <input type="checkbox" name="inputs[verbose]" value="true" checked />
        <button type="submit">Run workflow</button>
      </form>
    `;

    return document.querySelector('form');
  };

  const renderDispatchDialog = (): HTMLFormElement => {
    document.body.innerHTML = `
      <div role="dialog">
        <form id="dispatch-form" action="/${REPOSITORY.owner}/${REPOSITORY.name}/actions/manual">
          <input type="hidden" name="workflow" value=".github/workflows/${WORKFLOW_FILE}" />
          <input name="inputs[message]" value="weeeeeeeeee" />
          <select name="inputs[environment]">
            <option value="staging" selected>staging</option>
            <option value="production">production</option>
          </select>
          <input type="hidden" name="inputs[verbose]" value="false" />
          <input type="checkbox" name="inputs[verbose]" value="true" checked />
        </form>
        <div class="OverlayFooter">
          <button type="button">Cancel</button>
          <div data-loading-wrapper="true">
            <button type="submit" form="dispatch-form">Run workflow</button>
          </div>
        </div>
      </div>
    `;

    return document.querySelector('form');
  };

  const anchorOf = (form: HTMLFormElement): PlasmoCSUIAnchor => ({
    element: form.querySelector('button[type="submit"]'),
    type: 'inline',
  });
});
