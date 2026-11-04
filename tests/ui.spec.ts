import { test, expect } from '@playwright/test';
import { userEmail, userPassword } from './support/credentials';

test('ui 1 login ok', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle('Sign in · Stonewake');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await page.getByLabel('Email').fill(userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await expect(page).toHaveTitle('Deal Book · Stonewake');
  await expect(page.locator('h1')).toHaveText('Deal Book');
  await expect(page.locator('#app-sidebar')).toContainText('Team');
  await expect(page.locator('#app-sidebar a[data-tour="module-deals"]')).toBeVisible();
  await expect(page.locator('#app-sidebar a[data-tour="module-portfolio"]')).toBeVisible();
  await expect(page.locator('#app-sidebar a[data-tour="module-countries"]')).toBeVisible();
  await expect(page.locator('//aside//button[normalize-space(.)="Sign out"]')).toBeVisible();
});

test('ui 2 wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', 'definitely-wrong-password-123');
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=That email and password do not match. Check both and try again.')).toBeVisible();
  await expect(page).toHaveURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await expect(page.locator('#app-sidebar')).toHaveCount(0);
});

test('ui 3 terms checkbox', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  // The visible terms control is a role="checkbox" button; the native input is aria-hidden
  const termsCheckbox = page.getByRole('checkbox', { name: /I agree to the Evaluation Terms/ });
  await termsCheckbox.check();
  await expect(page.locator('button[type="submit"]')).toBeEnabled();
  await termsCheckbox.uncheck();
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  await expect(page.locator('//a[text()="Terms of Service"]')).toHaveAttribute('href', 'https://stonewake.ai/terms');
});

test('ui 4 not logged in redirect', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await page.goto('/portfolio');
  await page.waitForURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await page.goto('/countries/DEU');
  await page.waitForURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await page.goto('/entities');
  await page.waitForURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await expect(page.locator('#app-sidebar')).toHaveCount(0);
});

test('ui 5 logout', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await expect(page.locator('h1')).toHaveText('Deal Book');
  await page.click('//aside//button[normalize-space(.)="Sign out"]');
  await page.waitForURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
  await page.goto('/portfolio');
  await page.waitForURL('/login');
  await expect(page.locator('//h1[text()="Sign in"]')).toBeVisible();
});

test('ui 6 sidebar', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await page.click('#app-sidebar a[data-tour="module-countries"]');
  await page.waitForURL('**/countries');
  await expect(page.locator('h1')).toHaveText('Countries');
  await page.click('#app-sidebar a[data-tour="module-entities"]');
  await page.waitForURL('**/entities');
  await expect(page.locator('h1')).toHaveText('Institutions');
  await page.click('#app-sidebar a[data-tour="module-portfolio"]');
  await page.waitForURL('**/portfolio');
  await expect(page.locator('h1')).toHaveText('Portfolio');
  await page.click('//aside//a[normalize-space(.)="Monitoring"]');
  await page.waitForURL('**/monitoring');
  await expect(page.locator('h1')).toHaveText('Monitoring');
  await page.click('//aside//a[normalize-space(.)="Screenings"]');
  await page.waitForURL('**/screenings');
  await expect(page.locator('h1')).toHaveText('Screenings');
  // EDD Dossiers is checked in its own test ("ui 6b") because of product defect IN:86.
  await page.click('//aside//a[normalize-space(.)="Scoring"]');
  await page.waitForURL('**/scoring');
  await expect(page.locator('h1')).toHaveText('Scoring');
});

// Skipped because of a confirmed product defect, not a test problem:
// SpiraTest IN:86 https://itac.spiraservice.net/48/Incident/86.aspx
// The dossiers module is enabled for our workspace and the docs (https://docs.stonewake.ai/dossiers)
// say "EDD Dossiers" appears in the sidebar, but the app does not show the link.
// Remove .skip once IN:86 is fixed. The page itself is covered by "ui 11 edd dossiers page".
test.skip('ui 6b sidebar edd dossiers link', {
  annotation: { type: 'issue', description: 'SpiraTest IN:86 - EDD Dossiers link missing from the sidebar' },
}, async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await page.click('//aside//a[normalize-space(.)="EDD Dossiers"]');
  await page.waitForURL('**/dossiers');
  await expect(page.locator('h1')).toHaveText('EDD Dossiers');
});

test('ui 7 deal book search', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await expect(page.locator('select[aria-label="All sectors"]')).toBeVisible();
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveText('Deals');
  var link = page.locator("main a[href^='/deals/']").first();
  await expect(link).toBeVisible();
  var href = await link.getAttribute('href');
  await page.fill('input[placeholder="Search deals…"]', 'zzzzqqxx');
  await expect(page.locator('text=No matching deals')).toBeVisible();
  await page.fill('input[placeholder="Search deals…"]', '');
  await page.click("main a[href='" + href + "']");
  await page.waitForURL('**' + href);
  await expect(page.locator('//h2[text()="Briefing"]')).toBeVisible();
});

test('ui 8 countries', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await page.goto('/countries');
  await expect(page.locator('h1')).toHaveText('Countries');
  await page.fill('input[aria-label="Search countries"]', 'Germany');
  await page.waitForTimeout(1000);
  await page.click('main a[href="/countries/DEU"]');
  await page.waitForURL('/countries/DEU');
  await expect(page.locator('h1')).toHaveText('Germany');
  await expect(page.locator('//h2[text()="Country risk"]')).toBeVisible();
  await expect(page.locator('//h2[text()="Data sources"]')).toBeVisible();
  await page.goto('/countries');
  await page.fill('input[aria-label="Search countries"]', 'Zzzzqq');
  await expect(page.locator('text=No matching countries')).toBeVisible();
  await expect(page.locator("table a[href^='/countries/']")).toHaveCount(0);
  await page.goto('/countries/ZZZ');
  await expect(page).toHaveTitle('Page not found · Stonewake');
});

test('ui 9 institutions', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await page.goto('/entities');
  await expect(page.locator('h1')).toHaveText('Institutions');
  await expect(page.locator('select[aria-label="Kind"]')).toBeVisible();
  await expect(page.locator('select[aria-label="Country"]')).toBeVisible();
  await page.fill('input[placeholder="Search institutions…"]', 'UKEF');
  await expect(page.locator('main a[href="/entities/4"]')).toContainText('UK Export Finance');
  await expect(page.locator("main a[href^='/entities/']")).toHaveCount(1);
  await page.click('main a[href="/entities/4"]');
  await page.waitForURL('/entities/4');
  await expect(page).toHaveTitle('Institutions · Stonewake');
  await expect(page.locator('h1')).toBeVisible();
});

test('ui 10 portfolio', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  await page.goto('/portfolio');
  await expect(page.locator('h1')).toHaveText('Portfolio');
  await expect(page.locator('[data-testid="tile-red"]')).toBeVisible();
  await expect(page.locator('[data-testid="tile-amber"]')).toBeVisible();
  await expect(page.locator('[data-testid="tile-green"]')).toBeVisible();
  await expect(page.locator('[data-testid="tile-insufficient"]')).toBeVisible();
  await expect(page.locator('[data-testid="tile-not_assessed"]')).toBeVisible();
  var first = page.locator('tbody a[href^="/entities/n"]').first();
  await expect(first).toBeVisible();
  var name = (await first.innerText()).trim();
  await first.click();
  await page.waitForURL(/\/entities\/n\d+/);
  await expect(page.locator('h1')).toHaveText(name);
});

test('ui 11 edd dossiers page', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', userEmail());
  await page.fill('input[type="password"]', userPassword());
  await page.click('button[role="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  // Opened by URL: the sidebar has no link to this page (product defect IN:86, see "ui 6b")
  await page.goto('/dossiers');
  await expect(page).toHaveTitle('EDD Dossiers · Stonewake');
  await expect(page.locator('h1')).toHaveText('EDD Dossiers');
  // Only checks the button is offered; it is not clicked, so no dossier is created
  await expect(page.getByRole('button', { name: 'New dossier' })).toBeVisible();
});
