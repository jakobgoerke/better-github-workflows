import { test } from './fixtures';

test('happypath', async ({ page }) => {
  await page.goto('https://github.com/jakobgoerke/better-github-workflows/actions');

  await page.getByTestId('page-setup');
  await page.getByTestId('token-input').fill(process.env.E2E_PAT);
  await page.getByTestId('token-save').click();
  
  await page.getByTestId('page-workflows');

  await page.getByTestId('input-workflowfilter').fill('e2e-test-workflow');
  
  await page.getByTestId('workflow-link').click();

  await page.waitForURL('https://github.com/jakobgoerke/better-github-workflows/actions/workflows/e2e-test.yml')
});
