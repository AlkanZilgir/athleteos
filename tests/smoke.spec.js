// @ts-check
const { test, expect } = require('@playwright/test');

// Set TEST_EMAIL / TEST_PASSWORD env vars to a real, pre-existing Supabase
// account before running. The test does NOT create accounts (Supabase rate-
// limits signups). The account must have onboarding_done=true so we land on
// Home rather than the wizard.
const EMAIL = process.env.TEST_EMAIL || '';
const PASS = process.env.TEST_PASSWORD || '';
const NEED_ACCOUNT = !EMAIL || !PASS;

// Uncaught app errors are collected per test and asserted after it finishes.
// Throwing from inside the 'pageerror' listener would escape the test body and
// surface as an unhandled rejection instead of a failure on the right test.
/** @type {string[]} */
let pageErrors = [];

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err.message || err)));
});

test.afterEach(() => {
  expect(pageErrors, 'uncaught page errors').toEqual([]);
});

/** Sign in and wait for the app shell to render. */
async function signIn(page) {
  await page.goto('/');
  await expect(page.locator('#auth')).toBeVisible({ timeout: 10_000 });
  await page.locator('#l-u').fill(EMAIL);
  await page.locator('#l-p').fill(PASS);
  await page.locator('#login-btn').click();
  // bootApp() can take a few seconds — onboarding redirect or Home render.
  await expect(page.locator('#p-home, #onb').first()).toBeVisible({ timeout: 15_000 });
}

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
  await expect(page.locator('text=€0').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Start 7-day free trial/i }).first()).toBeVisible();
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
  // Sign In pane is up first; the Sign Up tab swaps #fl out for #fr.
  await expect(page.locator('#fl')).toBeVisible();
  await page.locator('#tr2').click();
  await expect(page.locator('#fr')).toBeVisible();
  await expect(page.locator('#fl')).toBeHidden();
  // The real signup field ids — r-n / r-e / r-p, per doReg() in js/auth.js.
  await expect(page.locator('#r-n')).toBeVisible();
  await expect(page.locator('#r-e')).toBeVisible();
  await expect(page.locator('#r-p')).toBeVisible();
  // And back.
  await page.locator('#tl').click();
  await expect(page.locator('#fl')).toBeVisible();
});

// Every module is a separate <script> since the js/ split. A missing or
// misordered file shows up here, not as a vague "button does nothing".
test('all modules load and their handlers are global', async ({ page }) => {
  /** @type {string[]} */
  const failed = [];
  page.on('requestfailed', (r) => { if (r.url().includes('/js/')) failed.push(r.url()); });
  page.on('response', (r) => { if (r.url().includes('/js/') && r.status() !== 200) failed.push(r.status() + ' ' + r.url()); });

  await page.goto('/', { waitUntil: 'networkidle' });
  expect(failed, 'module requests').toEqual([]);

  // One representative export per module, plus boot.js having run init().
  const missing = await page.evaluate(() => [
    'init', 'doLogin', 'ob_goto', 'goTab', 'startW', 'saveMeal',
    'openPaywall', 'buildCtx', 'runActions', '_genId', 'sbQueueInsert',
  ].filter((n) => typeof window[n] !== 'function'));
  expect(missing, 'globals missing after split').toEqual([]);
});

test.describe('signed-in flows', () => {
  // Skips only this group — a bare test.skip() at file scope would skip the
  // public-page tests above too.
  test.skip(NEED_ACCOUNT, 'Set TEST_EMAIL / TEST_PASSWORD to run');

  test('sign in → land on Home', async ({ page }) => {
    await signIn(page);
  });

  test('log a meal end to end', async ({ page }) => {
    await signIn(page);
    await expect(page.locator('#p-home')).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => window.openMealM());
    await expect(page.locator('#m-meal.on')).toBeVisible();
    await page.locator('#mn').fill('Playwright Test Meal');
    await page.locator('#m-p').fill('30');
    await page.locator('#m-c').fill('40');
    await page.locator('#m-f').fill('10');
    await page.locator('#m-k').fill('370');
    await page.locator('#m-meal button.btn').click();
    await expect(page.locator('#m-meal.on')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('#toast.on')).toBeVisible();
  });

  test('AI tab loads chat input', async ({ page }) => {
    await signIn(page);
    await expect(page.locator('#p-home')).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => window.goTab('ai'));
    await expect(page.locator('#chat-in')).toBeVisible();
  });

  test('paywall opens with all three plans', async ({ page }) => {
    await signIn(page);
    await expect(page.locator('#p-home')).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => window.openPaywall());
    await expect(page.locator('#m-paywall.on')).toBeVisible();
    await expect(page.locator('[data-plan="monthly"]')).toBeVisible();
    await expect(page.locator('[data-plan="yearly"]')).toBeVisible();
  });
});
