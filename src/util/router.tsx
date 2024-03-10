import { createMemoryRouter, type RouteObject } from 'react-router';

import { SetupPage } from '~page/SetupPage';
import { WorkflowPage } from '~page/WorkflowPage';

export enum Routes {
  Setup = '/setup',
  Workflows = '/workflows'
}

const routes: RouteObject[] = [
  {
    path: Routes.Setup,
    element: <SetupPage />
  },
  {
    path: Routes.Workflows,
    element: <WorkflowPage />
  }
];

export const router = createMemoryRouter(routes, {
  initialEntries: [Routes.Setup],
  initialIndex: 1
});
