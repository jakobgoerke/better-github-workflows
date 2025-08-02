import { createMemoryRouter, type RouteObject } from 'react-router';

import { SetupPage } from '~pages/SetupPage';
import { WorkflowPage } from '~pages/WorkflowPage';

import { Routes } from './routes';

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
  initialEntries: [Routes.Workflows],
  initialIndex: 1
});
