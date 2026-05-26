// @ts-check
const { test, expect } = require('@playwright/test');

// Set TEST_EMAIL / TEST_PASSWORD env vars to a real, pre-existing Supabase
// account before running. The test does NOT create accounts (Supabase rate-
// limits signups). The account must have onboarding_done=true so we land on
// Home rather than the wizard.
const EMAIL = process.env.TEST_EMAIL;
const PASS = process.env.TEST_PASSWORD;

test.beforeEach(async ({ page }) => {
  // Surface any uncaught JS error from the app as a test failure.
  page.on('pageerror', (err) => { throw err; });
});

test('landing page loads', async ({ page }) => {
  await page.goto('/marketing.html');
  await expect(page.getByRole('heading', { name: /Your personal/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Start free/i }).first()).toBeVisible();
});

test('auth screen renders without console errors', async ({ page }) => {
  await page.goto('/');
  // Welcome screen is hidden by default; auth should be visible.
  await expect(page.locator('#auth')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByPlaceholder('you@email.com').first()).toBeVisible();
});

test.skip(!EMAIL || !PASS, 'Sign-in smoke test (skipped — set TEST_EMAIL/TEST_PASSWORD env vars)');
test('sign in → land on Home', async ({ page }) => {
  await page.goto('/');
  await page.locator('#l-u').fill(EMAIL);
  await page.locator('#l-p').fill(PASS);
  await page.locator('#login-btn').click();
  // bootApp() can take a few seconds — onboarding redirect or Home render.
  await expect(page.locator('#p-home, #onb')).toBeVisible({ timeout: 15_000 });
});
