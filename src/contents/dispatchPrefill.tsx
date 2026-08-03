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

export const getInlineAnchorList: PlasmoGetInlineAnchorList = () => {
  const submitButtons = findDispatchContainers(document)
    .map((container) => container.querySelector(SUBMIT_SELECTOR))
    .filter((element) => !!element);

  return submitButtons.map((element) => ({ element, insertPosition: 'beforebegin' as const }));
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');

  style.textContent = `
    :host, #plasmo-shadow-container { display: inline-block; vertical-align: middle; }

    button {
      font: inherit;
      font-size: 12px;
      line-height: 20px;
      padding: 3px 12px;
      margin-right: 8px;
      border-radius: 6px;
      border: 1px solid var(--button-default-borderColor-rest, var(--borderColor-default, #d1d9e0));
      background-color: var(--button-default-bgColor-rest, var(--bgColor-default, #f6f8fa));
      color: var(--fgColor-default, #1f2328);
      cursor: pointer;
    }

    button:hover {
      background-color: var(--button-default-bgColor-hover, var(--bgColor-muted, #eef1f4));
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

  const form = anchor?.element.closest<HTMLElement>('form');
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
