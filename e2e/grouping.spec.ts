import { expect, test } from './fixtures';

test('grouping', async ({ page }) => {
  await page.goto('https://github.com/jakobgoerke/better-github-workflows/actions');

  await page.waitForSelector('[data-testid="page-setup"]');
  await page.getByTestId('token-input').fill(process.env.E2E_PAT);
  await page.getByTestId('token-save').click();
  await page.waitForSelector('[data-testid="workflow-link"]');
  await page.getByTestId('settings-button').click();

  await page.getByTestId('grouping-enabled').check();
  await page.getByTestId('grouping-splitchars').fill('-, __');
  await page.getByTestId('group-add').click();
  await page.getByTestId('group-prefix-input').nth(0).fill('tool');
  await page.getByTestId('group-prefix-input').nth(0).press('Enter');
  await page.getByTestId('group-add-child').nth(0).click();
  await page.getByTestId('group-prefix-input').nth(1).click();
  await page.getByTestId('chip-option').filter({ hasText: 'infra' }).click();
  await page.getByTestId('group-toggle').nth(0).click();
  await expect(page.getByTestId('group-card').nth(0)).toContainText('1 subgroup');
  await page.getByTestId('group-add').click();
  await page.getByTestId('group-prefix-input').nth(0).click();
  await expect(page.getByTestId('chip-option').filter({ hasText: /^tool\d/ })).toHaveCount(0);
  await page.getByTestId('chip-option').filter({ hasText: 'app' }).click();
  await page.getByTestId('group-prefix-input').nth(0).fill('e2e');
  await page.getByTestId('group-prefix-input').nth(0).press(',');
  await page.getByTestId('group-name-input').fill('Apps & tests');
  await expect(page.getByTestId('group-card').nth(1)).toContainText('app, e2e');
  await page.getByTestId('token-save').click();

  await page.waitForSelector('[data-testid="page-workflows"]');

  const tool = page.locator('[data-group-key="tool"]');
  const infra = page.locator('[data-group-key="tool/infra"]');
  const other = page.locator('[data-group-key="__other__"]');

  await expect(infra.getByTestId('workflow-link').filter({ hasText: /^redis__deploy$/ })).toBeVisible();
  await expect(tool.getByTestId('workflow-link').filter({ hasText: /^monitoring__deploy$/ })).toBeVisible();
  const apps = page.locator('[data-group-key="Apps & tests"]');
  await expect(apps.getByTestId('workflow-link').filter({ hasText: /^backend__deploy$/ })).toBeVisible();
  await expect(apps.getByTestId('workflow-link').filter({ hasText: /^test-workflow$/ })).toBeVisible();
  await expect(other.getByTestId('workflow-link').filter({ hasText: /^toolbox-cleanup$/ })).toBeVisible();

  await tool.getByTestId('workflow-group-toggle').first().click();
  await expect(tool.getByTestId('workflow-link')).toHaveCount(0);

  await page.getByTestId('input-workflowfilter').fill('redis');
  await expect(infra.getByTestId('workflow-link')).toHaveCount(2);
});
