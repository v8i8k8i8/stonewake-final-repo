# Baseline Analysis — original state before modifications

Recorded: 2026-11-04 18:12–18:33 · Commit analysed: `b4f92c9` (upstream `AlexKomanov/stonewake-final-repo`, 2026-11-04 09:30 +0200) · By: Claude Code for the QA Lead
Rule: this document describes the project **as received**. Fixes are in [CHANGES.md](CHANGES.md).

## 1. Repository structure
```text
.github/workflows/playwright.yml   CI: push/PR/dispatch, Node 22, chromium, npx playwright test, upload report artifact
.gitignore                         did not exclude .env, node_modules, playwright-report, test-results
.env                               committed (5 lines, credentials)
README.md                          fork instructions only
package.json / package-lock.json   @playwright/test 1.64.1, @types/node
playwright.config.ts               see below
tests/api.spec.ts                  10 API tests
tests/ui.spec.ts                   10 UI tests
+ 329 files under node_modules/ and 70 files under playwright-report/ + test-results/ committed
```
- Config: `testDir ./tests`, `timeout 30000`, `workers 2`, reporters list + html, headless, `trace: retain-on-failure`,
  `screenshot: only-on-failure`; no `retries` (= 0), no `baseURL`, no projects.
- Patterns: none — no page objects, fixtures or helpers; login steps copied into 7 UI tests; `var`, XPath and CSS locators.
- Tooling: no lint, no `tsc` script; one CI workflow without credentials and without report publication.

## 2. Existing test count
- 20 tests in 2 files (`api.spec.ts` 10, `ui.spec.ts` 10), no projects.
- Skipped / fixme / only / serial in code: none.

## 3. Baseline execution results
| Run | Time | Command / scope | Passed | Failed | Flaky | Skipped | Duration | Evidence |
|---|---|---|---|---|---|---|---|---|
| 1 | 18:12 | 4 credential-free tests, original code (organiser credentials deliberately not used) | 3 | 1 | 0 | 0 | 6.8 s | `baseline-evidence\20261104-181209\` |
| 2 | 18:27 | `npx --no-install playwright test --retries=0` — all 20, own credentials, after C-01…C-06 | 11 | 9 | 0 | 0 | 2.2 min | `baseline-evidence\20261104-182723-p1b-start\` |

A full 20-test run of the untouched original was not done: it needs the organiser's committed credentials, which the
QA Lead decided not to use. Only one full run was made before fixing, so flakiness was not measured (no repeated runs).

## 4. Failing tests (consistent in the runs made)
| Test (original file:line) | Error (short) | Cause | Class |
|---|---|---|---|
| api 1 (api.spec.ts) | 404 on `/v1/health` | Wrong path, health is `/health` | automation |
| api 2 | 401 | `Token` scheme; API takes `Bearer` | automation |
| api 5 | `b.data` undefined | Contract uses `items` | automation |
| api 9 | `DE` ≠ `GE` | Wrong test data (GE = Georgia) | automation |
| api 10 | max 25 ≠ 50 | Documented max is 25 | automation |
| ui 1 | 30 s timeout on `#email` | No such id | automation |
| ui 3 | 30 s timeout on `check()` | Hidden native checkbox targeted | automation |
| ui 6 | 30 s timeout on "EDD Dossier" link | Link not in sidebar; docs describe it there | unconfirmed (DEF-U-01) |
| ui 7 | `/deal/` link not found | Links are `/deals/` | automation |
| ui 10 | `tile-not-assessed` not found | Test id is `tile-not_assessed` | automation |
Details and evidence: [DEFECTS.md](DEFECTS.md).

## 5. Flaky tests (inconsistent across runs)
Not measured (one full run before fixing). No inconsistent result observed between the 18:27, 18:32 and 18:45 runs for unchanged tests.

## 6. Locator problems
| Original file:line | Locator | Problem |
|---|---|---|
| ui.spec.ts:10 | `#email` | Element has no id |
| ui.spec.ts (ui 3) | `input[type="checkbox"]` | Targets the `aria-hidden` input, not the visible control |
| ui.spec.ts (ui 7) | `main a[href^='/deal/']` | Wrong URL prefix |
| ui.spec.ts (ui 10) | `[data-testid="tile-not-assessed"]` | Wrong test id |
| ui.spec.ts (many) | `//h1[text()="Sign in"]`, `//aside//a[normalize-space(.)=...]` | XPath text locators; brittle to text/markup changes (not failing) |

## 7. Waiting and synchronization problems
| Original file:line | Pattern | Effect |
|---|---|---|
| ui.spec.ts:8 | `waitForTimeout(2000)` then `expect(page.url())` | Fixed sleep + non-retrying check |
| ui.spec.ts:120 | `waitForTimeout(3000)` | Fixed sleep, +3 s per run |
| ui.spec.ts:144 | `waitForTimeout(1000)` (ui 8) | Fixed sleep after search input — **still present** |
| ui.spec.ts (ui 2) | `expect(page.url()).toBe(...)` | Non-web-first assertion |

## 8. Test isolation problems
| Where | Problem | Effect |
|---|---|---|
| all credential tests | One shared account and key, committed publicly | Every fork shares the account: rate limits, session conflicts |
| ui 7, ui 9, ui 10 | Depend on live data (first deal, "UKEF" → `/entities/4`, first portfolio row) | Can break when product data changes |

## 9. Architecture and maintainability issues
- Hardcoded credentials and absolute URLs in every test (fixed: C-01, C-02).
- Login sequence duplicated in 7 UI tests; no fixture or page object.
- `var`, `any`, magic strings; API tests repeat the auth header in every request.
- Committed `node_modules`, reports and test results.

## 10. Initial risks and priorities
| Priority | Issue | Impact | Action | Status |
|---|---|---|---|---|
| P1-a | Secrets in repo; no baseURL; artifacts tracked | Security; cannot run safely | C-01…C-06 | done (uncommitted) |
| P1-b | 9 failing tests | No green run possible | C-07…C-16 | 21/21 (ED-06 under review) |
| P2 | 5 consecutive green runs local + CI | Mandatory deliverable | Secrets in CI, five-run scripts | PENDING |
| P3 | Duplication, XPath, remaining fixed wait | Maintainability score | Login fixture, locators | not started |
