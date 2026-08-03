import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyDispatchInputs, findDispatchContainers, getDispatchTarget, readDispatchInputs } from './workflowDispatch';

describe('workflowDispatch', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  const renderDispatchForm = (): HTMLFormElement => {
    document.body.innerHTML = `
      <form action="/owner/repo/actions/manual">
        <input type="hidden" name="workflow" value=".github/workflows/e2e-test.yml" />
        <input name="ref" value="main" />
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

  describe('readDispatchInputs', () => {
    it('should read the dispatch inputs of a workflow', () => {
      // given
      const form = renderDispatchForm();

      // when
      const inputs = readDispatchInputs(form);

      // then
      expect(inputs).toStrictEqual({
        message: 'weeeeeeeeee',
        environment: 'staging',
        verbose: 'true',
      });
    });

    it('should only read checked radio inputs', () => {
      // given
      document.body.innerHTML = `
        <form>
          <input type="radio" name="inputs[size]" value="small" />
          <input type="radio" name="inputs[size]" value="large" checked />
        </form>
      `;

      // when
      const inputs = readDispatchInputs(document.querySelector('form'));

      // then
      expect(inputs).toStrictEqual({ size: 'large' });
    });
  });

  describe('applyDispatchInputs', () => {
    it('should apply the stored values and report how many were applied', () => {
      // given
      const form = renderDispatchForm();

      // when
      const applied = applyDispatchInputs(form, {
        message: 'from the last run',
        environment: 'production',
        verbose: 'false',
      });

      // then
      expect(applied).toBe(3);
      expect(readDispatchInputs(form)).toStrictEqual({
        message: 'from the last run',
        environment: 'production',
        verbose: 'false',
      });
    });

    it('should notify listeners about the applied values', () => {
      // given
      const form = renderDispatchForm();
      const onInput = vi.fn();
      const onChange = vi.fn();

      form.addEventListener('input', onInput);
      form.addEventListener('change', onChange);

      // when
      applyDispatchInputs(form, { message: 'from the last run' });

      // then
      expect(onInput).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should leave the hidden companion of a boolean input alone', () => {
      // given
      const form = renderDispatchForm();

      // when
      applyDispatchInputs(form, { verbose: 'false' });

      // then
      expect(form.querySelector<HTMLInputElement>('input[type="hidden"][name="inputs[verbose]"]').value).toBe('false');
      expect(form.querySelector<HTMLInputElement>('input[type="checkbox"]').checked).toBe(false);
    });

    it('should skip inputs that are gone and choices that lost their option', () => {
      // given
      const form = renderDispatchForm();

      // when
      const applied = applyDispatchInputs(form, {
        environment: 'no-longer-an-option',
        removedInput: 'value',
      });

      // then
      expect(applied).toBe(0);
      expect(readDispatchInputs(form).environment).toBe('staging');
    });
  });

  describe('container lookup', () => {
    it('should find the containers holding dispatch inputs', () => {
      // given
      const form = renderDispatchForm();

      // when / then
      expect(findDispatchContainers(document)).toStrictEqual([form]);
    });

    it('should ignore forms without dispatch inputs', () => {
      // given
      document.body.innerHTML = '<form><input name="q" /></form>';

      // when / then
      expect(findDispatchContainers(document)).toStrictEqual([]);
    });
  });

  describe('getDispatchTarget', () => {
    it('should read the repository and workflow of a popover', () => {
      // given
      const form = renderDispatchForm();

      // when / then
      expect(getDispatchTarget(form)).toStrictEqual({
        repository: { owner: 'owner', name: 'repo' },
        workflowFile: 'e2e-test.yml',
      });
    });

    it('should ignore a form that does not name its workflow', () => {
      // given
      const form = renderDispatchForm();
      form.querySelector('input[name="workflow"]').remove();

      // when / then
      expect(getDispatchTarget(form)).toBeNull();
    });
  });
});
