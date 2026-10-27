import { motion, type TargetAndTransition } from 'framer-motion';
import type React from 'react';
import styled from 'styled-components';

import { Button, Combobox, type ComboboxOption } from '~components/common';
import { theme } from '~components/ThemeProvider';
import { ClearIcon } from '~icons/Clear';
import { PlusIcon } from '~icons/Plus';
import {
  addChildGroup,
  createGroup,
  type GroupConfig,
  parseSplitChars,
  removeGroup,
  suggestGroupNames,
  updateGroup,
} from '~utils/grouping';

interface GroupTreeEditorProps {
  groups: GroupConfig[];
  workflowNames: string[];
  splitChars: string;
  onChange: (groups: GroupConfig[]) => void;
}

interface GroupNodeEditorProps {
  group: GroupConfig;
  path: string[];
  siblings: GroupConfig[];
  getSuggestions: (path: string[], siblings: GroupConfig[], group: GroupConfig) => ComboboxOption[];
  onRename: (id: string, name: string) => void;
  onAddChild: (id: string) => void;
  onRemove: (id: string) => void;
}

const GroupNodeEditor: React.FC<GroupNodeEditorProps> = ({ group, path, siblings, getSuggestions, onRename, onAddChild, onRemove }) => {
  return (
    <Node data-testid="group-node">
      <Row>
        <NameField>
          <Combobox
            data-testid="group-name-input"
            placeholder="Group prefix…"
            value={group.name}
            options={getSuggestions(path, siblings, group)}
            onChange={(name) => onRename(group.id, name)}
          />
        </NameField>
        <IconButton
          data-testid="group-add-child"
          type="button"
          title="Add subgroup"
          onClick={() => onAddChild(group.id)}
          whileHover={iconHover}
        >
          <PlusIcon />
        </IconButton>
        <IconButton data-testid="group-remove" type="button" title="Remove group" onClick={() => onRemove(group.id)} whileHover={iconHover}>
          <ClearIcon />
        </IconButton>
      </Row>
      {group.children.length > 0 && (
        <Children>
          {group.children.map((child) => (
            <GroupNodeEditor
              key={child.id}
              group={child}
              path={[...path, group.name.trim()]}
              siblings={group.children}
              getSuggestions={getSuggestions}
              onRename={onRename}
              onAddChild={onAddChild}
              onRemove={onRemove}
            />
          ))}
        </Children>
      )}
    </Node>
  );
};

const GroupTreeEditor: React.FC<GroupTreeEditorProps> = ({ groups, workflowNames, splitChars, onChange }) => {
  const parsedSplitChars = parseSplitChars(splitChars);

  const getSuggestions = (path: string[], siblings: GroupConfig[], group: GroupConfig): ComboboxOption[] => {
    const usedNames = siblings.filter((sibling) => sibling.id !== group.id).map((sibling) => sibling.name.trim().toLowerCase());

    return suggestGroupNames(workflowNames, path, parsedSplitChars)
      .filter((suggestion) => !usedNames.includes(suggestion.name.toLowerCase()))
      .map((suggestion) => ({
        value: suggestion.name,
        hint: `${suggestion.count} ${suggestion.count === 1 ? 'workflow' : 'workflows'}`,
      }));
  };

  return (
    <Wrapper>
      {groups.map((group) => (
        <GroupNodeEditor
          key={group.id}
          group={group}
          path={[]}
          siblings={groups}
          getSuggestions={getSuggestions}
          onRename={(id, name) => onChange(updateGroup(groups, id, { name }))}
          onAddChild={(id) => onChange(addChildGroup(groups, id))}
          onRemove={(id) => onChange(removeGroup(groups, id))}
        />
      ))}
      <Button data-testid="group-add" type="button" onClick={() => onChange([...groups, createGroup()])}>
        Add group
      </Button>
    </Wrapper>
  );
};

const iconHover: TargetAndTransition = {
  backgroundColor: theme().hoverBg,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Node = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NameField = styled.div`
  flex: 1;
  min-width: 0;
`;

const Children = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid ${({ theme }) => theme.border};
`;

const IconButton = styled(motion.button)`
  display: flex;
  background: none;
  border: none;
  border-radius: 4px;
  padding: 7px;
  font-size: 14px;
  cursor: pointer;
`;

export { GroupTreeEditor };
