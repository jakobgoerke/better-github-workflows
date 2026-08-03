import { getRepositoryFromPath, getWorkflowFileNameFromPath, type Repository } from '~utils/github';

export type DispatchInputValues = Record<string, string>;

interface DispatchTarget {
  repository: Repository;
  workflowFile: string;
}

type DispatchControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const INPUT_NAME_PATTERN = /^inputs\[(.+)\]$/;
const CONTROL_SELECTOR = 'input[name^="inputs["]:not([type="hidden"]), select[name^="inputs["], textarea[name^="inputs["]';
const CONTAINER_SELECTOR = 'form, [role="dialog"], details-menu, .SelectMenu';

const getInputName = (control: DispatchControl): string | null => {
  return control.name.match(INPUT_NAME_PATTERN)?.[1] ?? null;
};

const getDispatchControls = (root: ParentNode): DispatchControl[] => {
  const controls = Array.from(root.querySelectorAll<DispatchControl>(CONTROL_SELECTOR));

  if (root instanceof Element && root.matches(CONTROL_SELECTOR)) {
    controls.unshift(root as DispatchControl);
  }

  return controls;
};

const findDispatchContainers = (root: ParentNode): HTMLElement[] => {
  const containers = getDispatchControls(root).map((control) => {
    return control.form ?? control.closest<HTMLElement>(CONTAINER_SELECTOR);
  });

  return Array.from(new Set(containers.filter((container): container is HTMLElement => !!container)));
};

const getDispatchTarget = (container: HTMLElement): DispatchTarget | null => {
  const formAction = container instanceof HTMLFormElement ? container.getAttribute('action') : null;
  const workflowPath = container.querySelector<HTMLInputElement>('input[name="workflow"]')?.value;
  const workflowFile = getWorkflowFileNameFromPath(workflowPath ?? '');

  if (!workflowFile) {
    return null;
  }

  return { repository: getRepositoryFromPath(formAction ?? window.location.pathname), workflowFile };
};

const readDispatchInputs = (container: ParentNode): DispatchInputValues => {
  const values: DispatchInputValues = {};

  for (const control of getDispatchControls(container)) {
    const name = getInputName(control);

    if (!name) {
      continue;
    }

    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      values[name] = String(control.checked);
      continue;
    }

    if (control instanceof HTMLInputElement && control.type === 'radio') {
      if (control.checked) {
        values[name] = control.value;
      }
      continue;
    }

    values[name] = control.value;
  }

  return values;
};

const setNativeValue = (control: DispatchControl, property: 'value' | 'checked', value: string | boolean) => {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), property);

  if (descriptor?.set) {
    descriptor.set.call(control, value);
    return;
  }

  Object.assign(control, { [property]: value });
};

const notifyChange = (control: DispatchControl) => {
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
};

const applyDispatchInputs = (container: ParentNode, values: DispatchInputValues): number => {
  let applied = 0;

  for (const control of getDispatchControls(container)) {
    const name = getInputName(control);
    const value = name ? values[name] : undefined;

    if (value === undefined) {
      continue;
    }

    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      setNativeValue(control, 'checked', value === 'true');
      notifyChange(control);
      applied++;
      continue;
    }

    if (control instanceof HTMLInputElement && control.type === 'radio') {
      if (control.value !== value) {
        continue;
      }

      setNativeValue(control, 'checked', true);
      notifyChange(control);
      applied++;
      continue;
    }

    if (control instanceof HTMLSelectElement && !Array.from(control.options).some((option) => option.value === value)) {
      continue;
    }

    setNativeValue(control, 'value', value);
    notifyChange(control);
    applied++;
  }

  return applied;
};

export { applyDispatchInputs, findDispatchContainers, getDispatchTarget, readDispatchInputs };
