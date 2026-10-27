import { observer } from 'mobx-react';
import type React from 'react';

import type { Workflow } from '~clients/githubClient';
import { Link } from '~components/common';
import { useStore } from '~hooks/useStore';
import { buildWorkflowLink } from '~utils/github';

interface WorkflowLinkProps {
  workflow: Workflow;
  label?: string;
}

const WorkflowLink: React.FC<WorkflowLinkProps> = observer(({ workflow, label = workflow.name }) => {
  const { repositoryStore } = useStore();

  return (
    <Link data-testid="workflow-link" href={buildWorkflowLink(repositoryStore.repository, workflow.path)} title={workflow.name}>
      {label}
    </Link>
  );
});

export { WorkflowLink };
