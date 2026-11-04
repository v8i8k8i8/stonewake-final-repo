# Changelog

Every code or test-behaviour change since the original commit `b4f92c9` (upstream `AlexKomanov/stonewake-final-repo`,
2026-11-04 09:30 +0200). All changes C-01…C-19 are in commit `188139e` (2026-11-04 19:45, pushed to `master`).

Claude Code wrote all of these changes (AI = Y); I set the scope for each step and approved it. The prompts are in
[AI_USAGE_LOG.md](AI_USAGE_LOG.md). Bigger decisions are explained in [ENGINEERING_DECISIONS.md](ENGINEERING_DECISIONS.md).
"Verification" names the command that was actually run.

| # | Time | Files | What was wrong, and why | What changed | Verification (command → result) | Status | AI |
|---|---|---|---|---|---|---|---|
| C-01 | 18:25 | tests/support/credentials.ts (new), tests/api.spec.ts, tests/ui.spec.ts | The organiser's email, password and API key were written into both spec files of a public repo (confirmed in `b4f92c9`). | Credentials now come from `STONEWAKE_EMAIL` / `STONEWAKE_PASSWORD` / `STONEWAKE_API_KEY`, with a clear error if one is missing. [ED-01](ENGINEERING_DECISIONS.md#ed-01--hardcoded-credentials-and-api-key-exposed-in-public-git-history) | Grep of specs/config for literals: 0. Full suite with my own credentials 18:45 → 21/21 passed | verified | Y |
| C-02 | 18:25 | playwright.config.ts, both specs | Full product URLs were repeated in every request and page visit, because no `baseURL` was set. | Two projects, `api` and `ui`, with `baseURL` (can be changed with `STONEWAKE_API_URL` / `STONEWAKE_APP_URL`); tests use relative paths. [ED-03](ENGINEERING_DECISIONS.md#ed-03--playwright-projects-with-baseurl) | `npx --no-install playwright test -g "api 1 health\|api 3 no token\|api 4 bad keys\|ui 4 not logged in redirect" --retries=0` → 4/4 passed; full suite 18:45 → 21/21 | verified | Y |
| C-03 | 18:25 | .gitignore; Git index | `.env`, `node_modules/`, `playwright-report/` and `test-results/` were committed, because `.gitignore` did not exclude them. | Added them to `.gitignore` (+ `.env.*`, `!.env.example`) and untracked them with `git rm --cached`. Local files kept, history not rewritten. [ED-01](ENGINEERING_DECISIONS.md#ed-01--hardcoded-credentials-and-api-key-exposed-in-public-git-history) | `git check-ignore -v` on all four: ignored; `git ls-files` on them: 0 | done | Y |
| C-04 | 18:25 | tests/api.spec.ts (api 1) | `GET /v1/health` returned 404. The health check lives at `/health`. | Calls `/health` | Same command as C-02 → passed | verified | Y |
| C-05 | 18:25 | tests/api.spec.ts (api 2) | `console.log(b)` printed the `/v1/me` response (key details) into the CI log. Leftover debug output. | Removed | api 2 passes 18:30 / 18:45, no log output | verified | Y |
| C-06 | 18:25 | tests/ui.spec.ts (ui 2) | `expect(page.url()).toBe('https://app…/login')` used a full URL and checked only once, without waiting. | `await expect(page).toHaveURL('/login')`, which waits for the URL | Full suite 18:32 and 18:45 → ui 2 passed | verified | Y |
| C-07 | 18:30 | tests/api.spec.ts:16 (api 2) | `/v1/me` returned 401. The test sent `Authorization: Token <key>`, but the API only accepts Bearer (`openapi.json` `securitySchemes.bearerAuth`; live probe Token → 401, Bearer → 200). | Sends `Bearer <key>` | `npx --no-install playwright test --project=api --retries=0` → 10/10 passed | verified | Y |
| C-08 | 18:30 | tests/api.spec.ts:71-76 (api 5) | `Array.isArray(b.data)` was false. The API returns the list in `items` (`V1Page_V1ExposureOut_` requires `items, limit, offset, total`). | Reads `b.items` | Same → passed | verified | Y |
| C-09 | 18:30 | tests/api.spec.ts:166 (api 9) | The test expected Germany's `iso2` to be `GE`, but `GE` is Georgia. Germany is `DE` (ISO 3166-1 alpha-2). | Expects `DE` | Same → passed | verified | Y |
| C-10 | 18:30 | tests/api.spec.ts:196-197 (api 10) | The test expected "less than or equal to 50", but the API says "… 25". The spec documents `/v1/search` `limit.maximum: 25`; live 25 → 200, 26 → 422. | Expects the exact 25 message (still an exact check), with a comment citing the spec | Same → passed | verified | Y |
| C-11 | 18:31 | tests/ui.spec.ts:5-9 (ui 1) | `page.fill('#email')` timed out after 30 s: the field has no `id="email"`, only the label "Email" (failure snapshot). The test also used a fixed 2 s wait. | `getByLabel('Email')`; `await expect(page).toHaveURL(/\/login/)`; fixed wait removed. [ED-05](ENGINEERING_DECISIONS.md#ed-05--user-facing-locators-and-no-fixed-waits) | `npx --no-install playwright test --project=ui -g "ui 1 login ok\|ui 3 terms\|ui 7 deal\|ui 10 portfolio" --retries=0` → 4/4 passed | verified | Y |
| C-12 | 18:31 | tests/ui.spec.ts:41-45 (ui 3) | `page.check('input[type="checkbox"]')` timed out after 30 s. It targeted the hidden native input; the visible control is a `role="checkbox"` button. | `getByRole('checkbox', { name: /I agree to the Evaluation Terms/ })` `.check()` / `.uncheck()` | Same → passed | verified | Y |
| C-13 | 18:31 | tests/ui.spec.ts:117-120 (ui 7) | No `main a[href^='/deal/']` found: deal links are `/deals/<id>` (failure snapshot). Also a fixed 3 s wait. | Pattern `/deals/`; fixed wait removed (the next assertion waits on its own) | Same → passed | verified | Y |
| C-14 | 18:31 | tests/ui.spec.ts:189 (ui 10) | `[data-testid="tile-not-assessed"]` not found. The real test id is `tile-not_assessed` (DOM probe; matches the API status `not_assessed`). | Locator corrected | Same → passed | verified | Y |
| C-15 | 18:44 | tests/ui.spec.ts:104-105 (ui 6) | ui 6 timed out after 30 s waiting for a sidebar "EDD Dossier" link that the app does not show, while `/dossiers` works by URL. At that point we had not confirmed a product defect. **Original expectation (removed, kept here verbatim):** `await page.click('//aside//a[normalize-space(.)="EDD Dossier"]'); await page.waitForURL('**/dossiers'); await expect(page.locator('h1')).toHaveText('EDD Dossiers');` | The 3 lines were replaced by a comment pointing to DEF-U-01; other steps unchanged; Scoring is now reached and checked. [ED-06](ENGINEERING_DECISIONS.md#ed-06--ui-6--edd-dossiers-sidebar-link-and-new-ui-11) | `npx --no-install playwright test --retries=0` (18:45) → 21/21 passed | replaced by C-17 | Y |
| C-16 | 18:44 | tests/ui.spec.ts:197-209 (new test ui 11) | After C-15, nothing checked the EDD Dossiers page. | New `ui 11 edd dossiers page`: log in, open `/dossiers`, check the title, the "EDD Dossiers" heading and that "New dossier" is visible (not clicked, no data created) | Same → passed | verified | Y |
| C-17 | 19:31 | tests/ui.spec.ts (ui 6 comment, new test ui 6b, ui 11 comment) | The sidebar check removed in C-15 is a real requirement: the docs describe the link and our workspace has the module. The app does not show it, which is product defect [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx), not a test problem. | Brought the check back as its own test, `ui 6b sidebar edd dossiers link`, marked `test.skip` with an `issue` annotation and a comment pointing to IN:86. The link text is "EDD Dossiers", as in the docs (the original test said "EDD Dossier"). Skipping was my decision; the organisers allow it for a confirmed product bug. | `npx --no-install playwright test --retries=0` (19:31) → 21 passed, **1 skipped**, 0 failed | done | Y |
| C-18 | 19:40 | .github/workflows/playwright.yml | CI had no credentials (every login and API test would fail), used default retries, uploaded the report even for failed runs, and published nothing. The workflow was never updated after credentials moved to env vars. | Secrets mapped into `env`; `--retries=0`; `build-info.json` in the report; report uploaded and published to GitHub Pages only for passing runs, only the console log for failed runs (ED-02); branch `master`; no `pull_request` trigger; queued runs are not cancelled. [ED-08](ENGINEERING_DECISIONS.md#ed-08--ci-and-reporting) | not verified (no CI run yet) | written | Y |
| C-19 | 19:47 | tests/api.spec.ts:80-85 (api 5) | The test required `completeness` to be a number from 0 to 1 for every portfolio item. The API documents it as nullable ("Null when not yet assessed", OpenAPI `V1ExposureOut`). It passed today only because no item is unassessed. | Accepts `null`; any other value must still be a number from 0 to 1 | `npx --no-install playwright test --retries=0` (19:47) → 21 passed, 1 skipped, 0 failed, exit 0 | verified | Y |

## How the ui 6 change evolved (C-15 → C-17)
I first gave Claude a rule: if the sidebar link is not a documented requirement, drop it from ui 6, cover the page
in a separate test, and record it as unconfirmed. Claude checked the in-app guide, which does not mention the
sidebar, and made C-15 and C-16.

At about 19:00 we checked the public product docs for the first time. https://docs.stonewake.ai/dossiers
("Where to find it") says **EDD Dossiers in the sidebar** opens the workbench for every team whose workspace holds
the dossiers module. So the rule's condition was not met. At 19:12 the workspace settings confirmed the module is
enabled. I decided to report the bug in SpiraTest (IN:86, 19:29) and to bring the sidebar check back as its own skipped test (C-17).
See [ED-06](ENGINEERING_DECISIONS.md#ed-06--ui-6--edd-dossiers-sidebar-link-and-new-ui-11) and
[DEFECTS.md DEF-P-01](DEFECTS.md#def-p-01--sidebar-does-not-show-edd-dossiers-although-the-dossiers-module-is-enabled).

## Run history
Evidence folders are under `C:\ITAC-Workspace\baseline-evidence\` (local only, not committed — see ED-02).

| Time | Command | Result | Evidence |
|---|---|---|---|
| 18:12 | 4 tests that need no credentials (api 1, api 3, api 4, ui 4), original code | 3 passed / 1 failed (api 1: 404) | `20261104-181209\` |
| 18:27 | `npx --no-install playwright test --retries=0` (20 tests, after C-01…C-06) | 11 passed / 9 failed | `20261104-182723-p1b-start\` |
| 18:32 | same, after C-07…C-14 | 19 passed / 1 failed (ui 6) | `20261104-183243-p1b-after-fixes\` |
| 18:45 | same, after C-15, C-16 (21 tests) | 21 passed / 0 failed / 0 skipped | `20261104-184555-p1b-ui6\` |
| 19:31 | same, after C-17 (22 tests) | 21 passed / 0 failed / 1 skipped (ui 6b, IN:86) | `20261104-193133-in86-skip\` |

Full detail per run: [STABILITY_RESULTS.md](STABILITY_RESULTS.md).
