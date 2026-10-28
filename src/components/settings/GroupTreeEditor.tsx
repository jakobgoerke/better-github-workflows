import { motion, type TargetAndTransition } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { Button, ChipInput, type ChipInputOption, Input } from '~components/common';
import { theme } from '~components/ThemeProvider';
import { ChevronIcon } from '~icons/Chevron';
import { ClearIcon } from '~icons/Clear';
import { PlusIcon } from '~icons/Plus';
import {
  addChildGroup,
  createGroup,
  type GroupConfig,
  getGroupName,
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

interface GroupEditorCallbacks {
  getSuggestions: (path: string[][], siblings: GroupConfig[], group: GroupConfig) => ChipInputOption[];
  onUpdate: (id: string, patch: Partial<Omit<GroupConfig, 'id'>>) => void;
  onAddChild: (id: string) => void;
  onRemove: (id: string) => void;
}

interface GroupNodeEditorProps extends GroupEditorCallbacks {
  group: GroupConfig;
  path: string[][];
  siblings: GroupConfig[];
  removable: boolean;
}

interface GroupCardProps extends GroupEditorCallbacks {
  group: GroupConfig;
  siblings: GroupConfig[];
  isOpen: boolean;
  onToggle: () => void;
}

const pluralize = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

const GroupNodeEditor: React.FC<GroupNodeEditorProps> = ({ group, path, siblings, removable, ...callbacks }) => {
  const { getSuggestions, onUpdate, onAddChild, onRemove } = callbacks;

  const setPrefixes = (prefixes: string[]) => {
    onUpdate(group.id, prefixes.length > 1 ? { prefixes } : { prefixes, name: '' });
  };

  return (
    <Node data-testid="group-node">
      <Fields>
        {group.prefixes.length > 1 && (
          <Input
            data-testid="group-name-input"
            placeholder={`Name, defaults to ${getGroupName({ ...group, name: '' })}`}
            value={group.name}
            onChange={(e) => onUpdate(group.id, { name: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
          />
        )}
        <ChipInput
          data-testid="group-prefix-input"
          placeholder="Group prefixes…"
          values={group.prefixes}
          autoFocus={group.prefixes.length === 0}
          options={getSuggestions(path, siblings, group)}
          onChange={setPrefixes}
        />
      </Fields>
      <Actions>
        <IconButton
          data-testid="group-add-child"
          type="button"
          title="Add subgroup"
          onClick={() => onAddChild(group.id)}
          whileHover={iconHover}
        >
          <PlusIcon />
        </IconButton>
        {removable ? (
          <IconButton
            data-testid="group-remove"
            type="button"
            title="Remove group"
            onClick={() => onRemove(group.id)}
            whileHover={iconHover}
          >
            <ClearIcon />
          </IconButton>
        ) : (
          <ActionSpacer />
        )}
      </Actions>
      {path.length === 0 && (
        <Label>
          <Checkbox
            data-testid="group-keep-prefix"
            type="checkbox"
            checked={group.keepPrefix}
            onChange={(e) => onUpdate(group.id, { keepPrefix: e.target.checked })}
          />
          Keep prefixes in workflow names
        </Label>
      )}
      {group.children.length > 0 && (
        <Children>
          {group.children.map((child) => (
            <GroupNodeEditor
              key={child.id}
              group={child}
              path={[...path, group.prefixes]}
              siblings={group.children}
              removable
              {...callbacks}
            />
          ))}
        </Children>
      )}
    </Node>
  );
};

const GroupCard: React.FC<GroupCardProps> = ({ group, siblings, isOpen, onToggle, ...callbacks }) => {
  const summary = [
    group.name.trim() && group.prefixes.join(', '),
    group.children.length > 0 && pluralize(group.children.length, 'subgroup'),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card data-testid="group-card">
      <CardHeader>
        <Toggle data-testid="group-toggle" type="button" aria-expanded={isOpen} onClick={onToggle} whileHover={iconHover}>
          <ChevronIcon initial={false} animate={{ rotate: isOpen ? 90 : 0 }} />
          <Title $empty={!getGroupName(group)}>{getGroupName(group) || 'New group'}</Title>
          {summary && <Summary>{summary}</Summary>}
        </Toggle>
        <IconButton
          data-testid="group-remove"
          type="button"
          title="Remove group"
          onClick={() => callbacks.onRemove(group.id)}
          whileHover={iconHover}
        >
          <ClearIcon />
        </IconButton>
      </CardHeader>
      {isOpen && (
        <CardBody>
          <GroupNodeEditor group={group} path={[]} siblings={siblings} removable={false} {...callbacks} />
        </CardBody>
      )}
    </Card>
  );
};

const GroupTreeEditor: React.FC<GroupTreeEditorProps> = ({ groups, workflowNames, splitChars, onChange }) => {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const parsedSplitChars = parseSplitChars(splitChars);

  const getSuggestions = (path: string[][], siblings: GroupConfig[], group: GroupConfig): ChipInputOption[] => {
    const usedPrefixes = siblings
      .filter((sibling) => sibling.id !== group.id)
      .flatMap((sibling) => sibling.prefixes)
      .map((prefix) => prefix.toLowerCase());

    return suggestGroupNames(workflowNames, path, parsedSplitChars)
      .filter((suggestion) => !usedPrefixes.includes(suggestion.name.toLowerCase()))
      .map((suggestion) => ({ value: suggestion.name, hint: pluralize(suggestion.count, 'workflow') }));
  };

  const toggle = (id: string) => {
    setOpenIds(openIds.includes(id) ? openIds.filter((openId) => openId !== id) : [...openIds, id]);
  };

  const addGroup = () => {
    const group = createGroup();
    setOpenIds([...openIds, group.id]);
    onChange([...groups, group]);
  };

  return (
    <Wrapper>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          siblings={groups}
          isOpen={openIds.includes(group.id)}
          onToggle={() => toggle(group.id)}
          getSuggestions={getSuggestions}
          onUpdate={(id, patch) => onChange(updateGroup(groups, id, patch))}
          onAddChild={(id) => onChange(addChildGroup(groups, id))}
          onRemove={(id) => onChange(removeGroup(groups, id))}
        />
      ))}
      <Button data-testid="group-add" type="button" onClick={addGroup}>
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

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
`;

const Toggle = styled(motion.button)`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: none;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
`;

const Title = styled.span<{ $empty: boolean }>`
  flex-shrink: 0;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: ${({ $empty }) => ($empty ? '#848d97' : 'inherit')};
`;

const Summary = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #848d97;
`;

const CardBody = styled.div`
  padding: 0 2px 8px 8px;
`;

const Node = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 4px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: -4px;
  font-size: 12px;
  color: #848d97;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin: 0;
  accent-color: ${({ theme }) => theme.focusColor};
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Actions = styled.div`
  display: flex;
  align-self: end;
  align-items: center;
  height: 32px;
`;

const Children = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 4px;
  padding-left: 8px;
  border-left: 1px solid ${({ theme }) => theme.border};
`;

const ICON_BUTTON_SIZE = '28px';

const IconButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_BUTTON_SIZE};
  height: ${ICON_BUTTON_SIZE};
  background: none;
  border: none;
  border-radius: 4px;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
`;

const ActionSpacer = styled.span`
  width: ${ICON_BUTTON_SIZE};
`;

export { GroupTreeEditor };
