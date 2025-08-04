import { createMemoryRouter, type RouteObject } from 'react-router';

import { Routes } from './routes';
import { SetupPage } from '~pages/SetupPage';
import { WorkflowPage } from '~pages/WorkflowPage';

const routes: RouteObject[] = [
  {
    path: Routes.Setup,
    element: <SetupPage />,
  },
  {
    path: Routes.Workflows,
    element: <WorkflowPage />,
  },
];

export const router = createMemoryRouter(routes, {
  initialEntries: [Routes.Workflows],
  initialIndex: 1,
});
