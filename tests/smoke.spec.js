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

test('pricing section shows all three plans', async ({ page }) => {
  await page.goto('/marketing.html#pricing');
  await expect(page.getByRole('heading', { name: /Simple pricing/i })).toBeVisible();
  await expect(page.locator('text=€1.33')).toBeVisible();
  await expect(page.locator('text=€4.99')).toBeVisible();
  await expect(page.locator('text=€0')).toBeVisible();
  await expect(page.getByRole('link', { name: /Start 7-day free trial/i })).toBeVisible();
});

test('privacy and terms pages render', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
  await page.goto('/terms.html');
  await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
});

test('auth screen renders without console errors', async ({ page }) => {
  await page.goto('/');
  // Welcome screen is hidden by default; auth should be visible.
  await expect(page.locator('#auth')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByPlaceholder('you@email.com').first()).toBeVisible();
});

test('signup tab toggles fields', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#auth')).toBeVisible({ timeout: 10_000 });
  // Click Sign Up tab and verify the signup form shows
  const signupTab = page.locator('.atab').nth(1);
  await signupTab.click();
  await expect(page.locator('#s-u')).toBeVisible();
  await expect(page.locator('#s-p')).toBeVisible();
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

test.skip(!EMAIL || !PASS, 'Logged-in flows (need TEST_EMAIL/TEST_PASSWORD)');
test('log a meal end to end', async ({ page }) => {
  await page.goto('/');
  await page.locator('#l-u').fill(EMAIL);
  await page.locator('#l-p').fill(PASS);
  await page.locator('#login-btn').click();
  await expect(page.locator('#p-home')).toBeVisible({ timeout: 15_000 });
  // Open Log Meal from quick actions
  await page.evaluate(() => window.openMealM());
  await expect(page.locator('#m-meal.on')).toBeVisible();
  await page.locator('#mn').fill('Playwright Test Meal');
  await page.locator('#m-p').fill('30');
  await page.locator('#m-c').fill('40');
  await page.locator('#m-f').fill('10');
  await page.locator('#m-k').fill('370');
  await page.locator('#m-meal button.btn').click();
  // Modal should close
  await expect(page.locator('#m-meal.on')).not.toBeVisible({ timeout: 5000 });
  // Toast should appear
  await expect(page.locator('#toast.on')).toBeVisible();
});

test.skip(!EMAIL || !PASS, 'AI panel needs signed-in account');
test('AI tab loads chat input', async ({ page }) => {
  await page.goto('/');
  await page.locator('#l-u').fill(EMAIL);
  await page.locator('#l-p').fill(PASS);
  await page.locator('#login-btn').click();
  await expect(page.locator('#p-home')).toBeVisible({ timeout: 15_000 });
  await page.evaluate(() => window.goTab('ai'));
  await expect(page.locator('#chat-in')).toBeVisible();
});

test.skip(!EMAIL || !PASS, 'Paywall needs signed-in account');
test('paywall opens with all three plans', async ({ page }) => {
  await page.goto('/');
  await page.locator('#l-u').fill(EMAIL);
  await page.locator('#l-p').fill(PASS);
  await page.locator('#login-btn').click();
  await expect(page.locator('#p-home')).toBeVisible({ timeout: 15_000 });
  await page.evaluate(() => window.openPaywall());
  await expect(page.locator('#m-paywall.on')).toBeVisible();
  await expect(page.locator('[data-plan="monthly"]')).toBeVisible();
  await expect(page.locator('[data-plan="yearly"]')).toBeVisible();
});
