import type { Workflow } from '~clients/githubClient';

export interface GroupConfig {
  id: string;
  name: string;
  children: GroupConfig[];
}

export interface GroupingSettings {
  enabled: boolean;
  splitChars: string;
  groups: GroupConfig[];
}

export interface GroupedWorkflow {
  workflow: Workflow;
  displayName: string;
}

export interface WorkflowGroup {
  key: string;
  name: string;
  groups: WorkflowGroup[];
  workflows: GroupedWorkflow[];
}

export interface WorkflowTree {
  groups: WorkflowGroup[];
  other: GroupedWorkflow[];
}

export interface GroupSuggestion {
  name: string;
  count: number;
}

export interface ExportedGroupConfig {
  name: string;
  children: ExportedGroupConfig[];
}

export interface ExportedGroupingSettings {
  version: number;
  enabled: boolean;
  splitChars: string;
  groups: ExportedGroupConfig[];
}

export const GROUPING_EXPORT_VERSION = 1;
export const OTHER_GROUP_KEY = '__other__';
export const OTHER_GROUP_NAME = 'other';

export const DEFAULT_GROUPING_SETTINGS: GroupingSettings = {
  enabled: false,
  splitChars: '-',
  groups: [],
};

const parseSplitChars = (text: string): string[] => {
  return text
    .split(',')
    .map((splitChar) => splitChar.trim())
    .filter(Boolean);
};

const stripGroupPrefix = (name: string, groupName: string, splitChars: string[]): string | null => {
  if (!groupName || !name.toLowerCase().startsWith(groupName.toLowerCase())) {
    return null;
  }

  let rest = name.slice(groupName.length);
  let splitChar = splitChars.find((char) => rest.startsWith(char));
  if (!splitChar) {
    return null;
  }

  while (splitChar) {
    rest = rest.slice(splitChar.length);
    splitChar = splitChars.find((char) => rest.startsWith(char));
  }

  return rest || null;
};

const findFirstSplitIndex = (name: string, splitChars: string[]): number => {
  const indices = splitChars.map((splitChar) => name.indexOf(splitChar)).filter((index) => index >= 0);
  return indices.length > 0 ? Math.min(...indices) : -1;
};

const suggestGroupNames = (workflowNames: string[], path: string[], splitChars: string[]): GroupSuggestion[] => {
  const suggestions = new Map<string, GroupSuggestion>();

  workflowNames.forEach((workflowName) => {
    const rest = path.reduce<string | null>((name, groupName) => name && stripGroupPrefix(name, groupName, splitChars), workflowName);
    if (!rest) {
      return;
    }

    const splitIndex = findFirstSplitIndex(rest, splitChars);
    const segment = rest.slice(0, splitIndex);
    if (splitIndex <= 0 || !stripGroupPrefix(rest, segment, splitChars)) {
      return;
    }

    const key = segment.toLowerCase();
    const suggestion = suggestions.get(key) ?? { name: segment, count: 0 };
    suggestions.set(key, { ...suggestion, count: suggestion.count + 1 });
  });

  return [...suggestions.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const sortByDisplayName = (a: GroupedWorkflow, b: GroupedWorkflow) => {
  return a.displayName.localeCompare(b.displayName);
};

const countWorkflows = (group: WorkflowGroup): number => {
  return group.workflows.length + group.groups.reduce((sum, child) => sum + countWorkflows(child), 0);
};

const groupWorkflows = (
  workflows: GroupedWorkflow[],
  groups: GroupConfig[],
  splitChars: string[],
  parentKey: string,
): { groups: WorkflowGroup[]; rest: GroupedWorkflow[] } => {
  const buckets = new Map<GroupConfig, GroupedWorkflow[]>(groups.map((group) => [group, []]));
  const rest: GroupedWorkflow[] = [];

  workflows.forEach((entry) => {
    for (const group of groups) {
      const displayName = stripGroupPrefix(entry.displayName, group.name, splitChars);
      if (displayName) {
        buckets.get(group).push({ ...entry, displayName });
        return;
      }
    }
    rest.push(entry);
  });

  const workflowGroups = groups
    .map((group): WorkflowGroup => {
      const key = parentKey ? `${parentKey}/${group.name}` : group.name;
      const children = groupWorkflows(buckets.get(group), group.children, splitChars, key);
      return {
        key,
        name: group.name,
        groups: children.groups,
        workflows: children.rest.sort(sortByDisplayName),
      };
    })
    .filter((group) => countWorkflows(group) > 0);

  return { groups: workflowGroups, rest };
};

const buildWorkflowTree = (workflows: Workflow[], settings: GroupingSettings): WorkflowTree => {
  const entries = workflows.map((workflow) => ({ workflow, displayName: workflow.name }));
  const { groups, rest } = groupWorkflows(entries, settings.groups, parseSplitChars(settings.splitChars), '');

  return { groups, other: rest.sort(sortByDisplayName) };
};

const createGroup = (name = ''): GroupConfig => {
  return { id: crypto.randomUUID(), name, children: [] };
};

const mapGroups = (groups: GroupConfig[], id: string, fn: (group: GroupConfig) => GroupConfig | null): GroupConfig[] => {
  return groups.flatMap((group) => {
    if (group.id === id) {
      const result = fn(group);
      return result ? [result] : [];
    }
    return [{ ...group, children: mapGroups(group.children, id, fn) }];
  });
};

const updateGroup = (groups: GroupConfig[], id: string, patch: Partial<Omit<GroupConfig, 'id'>>): GroupConfig[] => {
  return mapGroups(groups, id, (group) => ({ ...group, ...patch }));
};

const removeGroup = (groups: GroupConfig[], id: string): GroupConfig[] => {
  return mapGroups(groups, id, () => null);
};

const addChildGroup = (groups: GroupConfig[], parentId: string): GroupConfig[] => {
  return mapGroups(groups, parentId, (group) => ({ ...group, children: [...group.children, createGroup()] }));
};

const cleanGroups = (groups: GroupConfig[]): GroupConfig[] => {
  return groups
    .map((group) => ({ ...group, name: group.name.trim(), children: cleanGroups(group.children) }))
    .filter((group) => group.name);
};

const cleanGroupingSettings = (settings: GroupingSettings): GroupingSettings => {
  return { ...settings, groups: cleanGroups(settings.groups) };
};

const serializeGroups = (groups: GroupConfig[]): ExportedGroupConfig[] => {
  return groups.map((group) => ({ name: group.name, children: serializeGroups(group.children) }));
};

const serializeGroupingSettings = (settings: GroupingSettings): ExportedGroupingSettings => {
  return {
    version: GROUPING_EXPORT_VERSION,
    enabled: settings.enabled,
    splitChars: settings.splitChars,
    groups: serializeGroups(cleanGroups(settings.groups)),
  };
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const parseGroups = (value: unknown): GroupConfig[] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return null;
  }

  const groups: GroupConfig[] = [];
  for (const entry of value) {
    if (!isObject(entry) || typeof entry.name !== 'string') {
      return null;
    }
    const children = parseGroups(entry.children);
    if (!children) {
      return null;
    }
    if (entry.name.trim()) {
      groups.push({ ...createGroup(entry.name.trim()), children });
    }
  }
  return groups;
};

const parseGroupingSettings = (json: unknown): GroupingSettings | null => {
  if (!isObject(json)) {
    return null;
  }

  const { enabled = DEFAULT_GROUPING_SETTINGS.enabled, splitChars = DEFAULT_GROUPING_SETTINGS.splitChars } = json;
  if (typeof enabled !== 'boolean' || typeof splitChars !== 'string') {
    return null;
  }

  const groups = parseGroups(json.groups);
  if (!groups) {
    return null;
  }

  return { enabled, splitChars, groups };
};

export {
  addChildGroup,
  buildWorkflowTree,
  cleanGroupingSettings,
  countWorkflows,
  createGroup,
  parseGroupingSettings,
  parseSplitChars,
  removeGroup,
  serializeGroupingSettings,
  stripGroupPrefix,
  suggestGroupNames,
  updateGroup,
};
