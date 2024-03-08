import { SetupPage } from 'page/SetupPage';
import { WorkflowPage } from 'page/WorkflowPage';
import { createMemoryRouter, type RouteObject } from 'react-router';

const routes: RouteObject[] = [
  {
    path: '/setup',
    element: <SetupPage />
  },
  {
    path: '/workflows',
    element: <WorkflowPage />
  }
];

export const router = createMemoryRouter(routes, {
  initialEntries: ['/setup'],
  initialIndex: 1
});
