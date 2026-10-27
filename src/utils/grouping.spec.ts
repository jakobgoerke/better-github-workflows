import { describe, expect, it } from 'vitest';

import {
  addChildGroup,
  buildWorkflowTree,
  cleanGroupingSettings,
  createGroup,
  type GroupConfig,
  type GroupingSettings,
  parseGroupingSettings,
  parseSplitChars,
  removeGroup,
  serializeGroupingSettings,
  stripGroupPrefix,
  suggestGroupNames,
  updateGroup,
} from './grouping';
import { type Workflow, WorkflowStates } from '~clients/githubClient';

describe('grouping', () => {
  const SPLIT_CHARS = ['-', '__'];

  const buildWorkflow = (id: number, name: string): Workflow => ({
    id,
    node_id: `W_${id}`,
    name,
    path: `.github/workflows/${id}.yml`,
    state: WorkflowStates.ACTIVE,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    url: '',
    html_url: '',
    badge_url: '',
  });

  const group = (name: string, children: GroupConfig[] = []): GroupConfig => ({ ...createGroup(name), children });

  const settings = (groups: GroupConfig[], splitChars = '-, __'): GroupingSettings => ({ enabled: true, splitChars, groups });

  describe('parseSplitChars', () => {
    it('should split on commas and trim each split char', () => {
      expect(parseSplitChars('-, __ ,.')).toStrictEqual(['-', '__', '.']);
    });

    it('should ignore empty entries', () => {
      expect(parseSplitChars(' , -,, ')).toStrictEqual(['-']);
    });
  });

  describe('stripGroupPrefix', () => {
    it('should drop the prefix and the split chars following it', () => {
      expect(stripGroupPrefix('tool-infra-redis__deploy', 'tool', SPLIT_CHARS)).toBe('infra-redis__deploy');
      expect(stripGroupPrefix('redis__deploy', 'redis', SPLIT_CHARS)).toBe('deploy');
    });

    it('should drop multiple consecutive split chars', () => {
      expect(stripGroupPrefix('tool-__-deploy', 'tool', SPLIT_CHARS)).toBe('deploy');
    });

    it('should only match on a split char boundary', () => {
      expect(stripGroupPrefix('toolbox-cleanup', 'tool', SPLIT_CHARS)).toBeNull();
      expect(stripGroupPrefix('tool', 'tool', SPLIT_CHARS)).toBeNull();
    });

    it('should match case insensitive and keep the casing of the rest', () => {
      expect(stripGroupPrefix('Tool-Deploy', 'tool', SPLIT_CHARS)).toBe('Deploy');
    });

    it('should not match when nothing is left after the split chars', () => {
      expect(stripGroupPrefix('tool-', 'tool', SPLIT_CHARS)).toBeNull();
    });

    it('should not match an empty group name', () => {
      expect(stripGroupPrefix('-deploy', '', SPLIT_CHARS)).toBeNull();
    });
  });

  describe('buildWorkflowTree', () => {
    it('should group workflows into nested groups and strip their prefixes', () => {
      // given
      const redis = buildWorkflow(1, 'tool-infra-redis__deploy');
      const monitoring = buildWorkflow(2, 'tool-monitoring__deploy');
      const toolbox = buildWorkflow(3, 'toolbox-cleanup');

      // when
      const tree = buildWorkflowTree([redis, monitoring, toolbox], settings([group('tool', [group('infra')])]));

      // then
      expect(tree.groups).toHaveLength(1);
      const [tool] = tree.groups;
      expect(tool.key).toBe('tool');
      expect(tool.workflows).toStrictEqual([{ workflow: monitoring, displayName: 'monitoring__deploy' }]);
      expect(tool.groups).toHaveLength(1);
      expect(tool.groups[0].key).toBe('tool/infra');
      expect(tool.groups[0].workflows).toStrictEqual([{ workflow: redis, displayName: 'redis__deploy' }]);
      expect(tree.other).toStrictEqual([{ workflow: toolbox, displayName: 'toolbox-cleanup' }]);
    });

    it('should put a workflow into the first matching group', () => {
      // given
      const workflow = buildWorkflow(1, 'app-deploy');

      // when
      const tree = buildWorkflowTree([workflow], settings([group('app'), group('APP')]));

      // then
      expect(tree.groups.map((g) => g.name)).toStrictEqual(['app']);
    });

    it('should drop groups without workflows and keep the configured order', () => {
      // given
      const workflows = [buildWorkflow(1, 'b-one'), buildWorkflow(2, 'a-one')];

      // when
      const tree = buildWorkflowTree(workflows, settings([group('b'), group('empty', [group('child')]), group('a')]));

      // then
      expect(tree.groups.map((g) => g.name)).toStrictEqual(['b', 'a']);
      expect(tree.other).toHaveLength(0);
    });

    it('should sort workflows by their display name', () => {
      // given
      const workflows = [buildWorkflow(1, 'app-zeta'), buildWorkflow(2, 'app-alpha'), buildWorkflow(3, 'other')];

      // when
      const tree = buildWorkflowTree(workflows, settings([group('app')]));

      // then
      expect(tree.groups[0].workflows.map((w) => w.displayName)).toStrictEqual(['alpha', 'zeta']);
    });

    it('should not mutate the given workflows', () => {
      // given
      const workflows = [buildWorkflow(1, 'z'), buildWorkflow(2, 'a')];

      // when
      buildWorkflowTree(workflows, settings([group('x')]));

      // then
      expect(workflows.map((w) => w.name)).toStrictEqual(['z', 'a']);
    });
  });

  describe('suggestGroupNames', () => {
    const NAMES = [
      'tool-infra-redis__deploy',
      'tool-infra-postgres__deploy',
      'tool-monitoring__deploy',
      'Tool-cleanup',
      'app-frontend__deploy',
      'publish',
      '-leading',
    ];

    it('should suggest the first segments sorted by the amount of matching workflows', () => {
      expect(suggestGroupNames(NAMES, [], SPLIT_CHARS)).toStrictEqual([
        { name: 'tool', count: 4 },
        { name: 'app', count: 1 },
      ]);
    });

    it('should suggest the next segments below a group path', () => {
      expect(suggestGroupNames(NAMES, ['tool'], SPLIT_CHARS)).toStrictEqual([
        { name: 'infra', count: 2 },
        { name: 'monitoring', count: 1 },
      ]);
      expect(suggestGroupNames(NAMES, ['tool', 'infra'], SPLIT_CHARS)).toStrictEqual([
        { name: 'postgres', count: 1 },
        { name: 'redis', count: 1 },
      ]);
    });

    it('should suggest nothing without split chars or for an unknown path', () => {
      expect(suggestGroupNames(NAMES, [], [])).toStrictEqual([]);
      expect(suggestGroupNames(NAMES, ['unknown'], SPLIT_CHARS)).toStrictEqual([]);
    });
  });

  describe('tree editing', () => {
    it('should update, add children to and remove nested groups', () => {
      // given
      const child = group('child');
      const root = group('root', [child]);

      // when
      const renamed = updateGroup([root], child.id, { name: 'renamed' });
      const withChild = addChildGroup(renamed, child.id);
      const removed = removeGroup(withChild, child.id);

      // then
      expect(renamed[0].children[0].name).toBe('renamed');
      expect(withChild[0].children[0].children).toHaveLength(1);
      expect(removed[0].children).toHaveLength(0);
      expect(root.children[0].name).toBe('child');
    });

    it('should trim names and drop empty groups when cleaning', () => {
      // given
      const value = settings([group(' tool ', [group('  ')]), group('')]);

      // when
      const cleaned = cleanGroupingSettings(value);

      // then
      expect(cleaned.groups).toHaveLength(1);
      expect(cleaned.groups[0].name).toBe('tool');
      expect(cleaned.groups[0].children).toHaveLength(0);
    });
  });

  describe('import / export', () => {
    it('should round trip the settings without ids', () => {
      // given
      const value = settings([group('tool', [group('infra')]), group('app')]);

      // when
      const exported = JSON.parse(JSON.stringify(serializeGroupingSettings(value)));
      const imported = parseGroupingSettings(exported);

      // then
      expect(exported).toStrictEqual({
        version: 1,
        enabled: true,
        splitChars: '-, __',
        groups: [
          { name: 'tool', children: [{ name: 'infra', children: [] }] },
          { name: 'app', children: [] },
        ],
      });
      expect(serializeGroupingSettings(imported)).toStrictEqual(exported);
      expect(imported.groups[0].id).toEqual(expect.any(String));
    });

    it('should fall back to defaults for missing fields', () => {
      expect(parseGroupingSettings({ groups: [{ name: 'tool' }] })).toMatchObject({
        enabled: false,
        splitChars: '-',
        groups: [{ name: 'tool', children: [] }],
      });
    });

    it.each([
      ['a string', 'nope'],
      ['an array', []],
      ['null', null],
      ['a non boolean enabled', { enabled: 'yes' }],
      ['non string split chars', { splitChars: ['-'] }],
      ['non array groups', { groups: {} }],
      ['a group without name', { groups: [{ children: [] }] }],
      ['a bad nested child', { groups: [{ name: 'tool', children: [{ name: 1 }] }] }],
    ])('should reject %s', (_, json) => {
      expect(parseGroupingSettings(json)).toBeNull();
    });
  });
});
