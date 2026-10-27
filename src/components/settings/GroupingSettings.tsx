import type React from 'react';
import { type ChangeEvent, useRef, useState } from 'react';
import styled from 'styled-components';

import { GroupTreeEditor } from './GroupTreeEditor';
import { Button, Input } from '~components/common';
import { type GroupingSettings as GroupingSettingsValue, parseGroupingSettings, serializeGroupingSettings } from '~utils/grouping';

export const GROUPING_EXPORT_FILE_NAME = 'better-github-workflows-grouping.json';

interface GroupingSettingsProps {
  value: GroupingSettingsValue;
  workflowNames: string[];
  onChange: (settings: GroupingSettingsValue) => void;
}

const GroupingSettings: React.FC<GroupingSettingsProps> = ({ value, workflowNames, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState(false);

  const handleExport = () => {
    const json = JSON.stringify(serializeGroupingSettings(value), null, 2);
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
    link.download = GROUPING_EXPORT_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }

    let settings: GroupingSettingsValue | null = null;
    try {
      settings = parseGroupingSettings(JSON.parse(await file.text()));
    } catch (error) {
      console.error('Failed to read grouping config file:', error);
    }

    setImportError(!settings);
    if (settings) {
      onChange(settings);
    }
  };

  return (
    <Wrapper data-testid="grouping-settings">
      <SubHeading>Grouping</SubHeading>
      <Label>
        <Checkbox
          data-testid="grouping-enabled"
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        Enable grouping
      </Label>
      <Field>
        <Input
          data-testid="grouping-splitchars"
          placeholder="-, __"
          value={value.splitChars}
          onChange={(e) => onChange({ ...value, splitChars: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <Span>
          Split chars, comma separated, e.g. <code>-, __</code>
        </Span>
      </Field>
      <GroupTreeEditor
        groups={value.groups}
        workflowNames={workflowNames}
        splitChars={value.splitChars}
        onChange={(groups) => onChange({ ...value, groups })}
      />
      <Actions>
        <Button data-testid="grouping-export" type="button" onClick={handleExport}>
          Export
        </Button>
        <Button data-testid="grouping-import" type="button" onClick={() => fileInputRef.current?.click()}>
          Import
        </Button>
        <HiddenInput
          data-testid="grouping-import-file"
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
        />
      </Actions>
      {importError && <Span data-testid="grouping-import-error">Invalid grouping config file</Span>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const SubHeading = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin: 0;
  accent-color: ${({ theme }) => theme.focusColor};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Span = styled.span`
  font-size: 12px;
  color: #848d97;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const HiddenInput = styled.input`
  display: none;
`;

export { GroupingSettings };
