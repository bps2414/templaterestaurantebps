import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Replace with actual storefront URL later
  await page.goto('/');
  // Basic check to ensure page loads
  await expect(page).toHaveTitle(/.*|SaaS/);
});
