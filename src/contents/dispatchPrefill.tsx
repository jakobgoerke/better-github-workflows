import { observer } from 'mobx-react';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import React, { type MouseEvent, useEffect, useState } from 'react';

import { RootStoreProvider, useStore } from '~hooks/useStore';
import type { DispatchInputsRecord } from '~stores/dispatchInputsStore';
import { applyDispatchInputs, findDispatchContainers, getDispatchTarget, readDispatchInputs } from '~utils/workflowDispatch';

export const config: PlasmoCSConfig = {
  matches: ['https://github.com/*'],
  run_at: 'document_end',
};

const FEEDBACK_TIMEOUT = 1500;
const SUBMIT_SELECTOR = 'button[type="submit"], input[type="submit"]';

const findSubmitButton = (container: HTMLElement): Element | null => {
  if (container instanceof HTMLFormElement) {
    return Array.from(container.elements).find((element) => element.matches(SUBMIT_SELECTOR)) ?? null;
  }

  return container.querySelector(SUBMIT_SELECTOR);
};

const getAnchorForm = (element: Element | undefined): HTMLFormElement | null => {
  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
    return element.form;
  }

  return element?.closest('form') ?? null;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = () => {
  const submitButtons = findDispatchContainers(document)
    .map(findSubmitButton)
    .filter((element) => !!element);

  return submitButtons.map((element) => ({ element, insertPosition: 'beforebegin' as const }));
};

const footerStyles = document.createElement('style');
footerStyles.textContent = `
  [data-component="Dialog.Footer"] [data-loading-wrapper]:has(> plasmo-csui) { display: flex; align-items: center; }
`;
document.head.appendChild(footerStyles);

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');

  style.textContent = `
    :host, #plasmo-shadow-container { display: inline-block; vertical-align: middle; }

    button {
      appearance: none;
      display: inline-flex;
      align-items: center;
      height: var(--control-medium-size, 2rem);
      padding: 0 var(--control-medium-paddingInline-normal, 0.75rem);
      margin-right: var(--base-size-8, 0.5rem);
      font-family: inherit;
      font-size: var(--text-body-size-medium, 0.875rem);
      font-weight: var(--base-text-weight-medium, 500);
      line-height: var(--text-body-lineHeight-medium, 1.5);
      white-space: nowrap;
      border: var(--borderWidth-thin, 1px) solid var(--button-default-borderColor-rest, #d1d9e0);
      border-radius: var(--borderRadius-medium, 0.375rem);
      background-color: var(--button-default-bgColor-rest, #f6f8fa);
      box-shadow: var(--button-default-shadow-resting, 0 1px 0 0 #1f23280a);
      color: var(--button-default-fgColor-rest, #25292e);
      cursor: pointer;
      transition: color 80ms cubic-bezier(0.65, 0, 0.35, 1), background-color 80ms cubic-bezier(0.65, 0, 0.35, 1), border-color 80ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    button:hover {
      background-color: var(--button-default-bgColor-hover, #eff2f5);
      border-color: var(--button-default-borderColor-hover, #d1d9e0);
    }

    button:active {
      background-color: var(--button-default-bgColor-active, #e6eaef);
      border-color: var(--button-default-borderColor-active, #d1d9e0);
      transition: none;
    }

    button:focus-visible {
      outline: 2px solid var(--focus-outlineColor, #0969da);
      outline-offset: -2px;
    }

    button[data-confirmed='true'] {
      color: var(--fgColor-success, #1a7f37);
    }
  `;

  return style;
};

const PrefillButton: React.FC<PlasmoCSUIProps> = observer(({ anchor }) => {
  const { dispatchInputsStore } = useStore();
  const [record, setRecord] = useState<DispatchInputsRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = getAnchorForm(anchor?.element);
  const target = form ? getDispatchTarget(form) : null;

  useEffect(() => {
    if (!form || !target) {
      return;
    }

    dispatchInputsStore.getLast(target.repository, target.workflowFile).then((last) => setRecord(last ?? null));

    const handleSubmit = () => {
      dispatchInputsStore.capture(target.repository, target.workflowFile, readDispatchInputs(form));
    };

    form.addEventListener('submit', handleSubmit);

    return () => form.removeEventListener('submit', handleSubmit);
  }, [form]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), FEEDBACK_TIMEOUT);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  if (!form || !record) {
    return null;
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const applied = applyDispatchInputs(form, record.inputs);

    setFeedback(applied > 0 ? '✓ Prefilled' : 'Nothing to prefill');
  };

  return (
    <button
      type="button"
      data-confirmed={!!feedback}
      title={`Fill in the inputs used on ${new Date(record.ranAt).toLocaleString()}`}
      data-testid="prefill-last-run"
      onClick={handleClick}
    >
      {feedback ?? 'Prefill'}
    </button>
  );
});

const DispatchPrefill: React.FC<PlasmoCSUIProps> = (props) => {
  return (
    <React.StrictMode>
      <RootStoreProvider>
        <PrefillButton {...props} />
      </RootStoreProvider>
    </React.StrictMode>
  );
};

export default DispatchPrefill;
