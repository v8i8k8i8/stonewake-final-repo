# Software Test Plan — Stonewake test automation (ITAC 2026 Final)

| | |
|---|---|
| Version / date | v1.0 draft / 2026-11-04 19:05 |
| Author | QA Lead (team itac-2), drafted with Claude Code — see [AI_USAGE_LOG.md](AI_USAGE_LOG.md) |
| Repository | https://github.com/v8i8k8i8/stonewake-final-repo (fork of `AlexKomanov/stonewake-final-repo`) |
| Final commit | PENDING (changes uncommitted) |

## 1. Project overview
Stonewake is a business and financial intelligence platform: search and filter deals, background screening of
companies, funding and ownership networks, country risk, and monitoring of companies over time. It has a web UI
(https://app.stonewake.ai), a read-only REST API (https://api.stonewake.ai, OpenAPI at `/openapi.json`) and an MCP
server; documentation at https://docs.stonewake.ai. The final runs on the live product in a competition workspace (team itac-2).
Automation as received: Playwright 1.64.1 + TypeScript, 20 tests (10 API, 10 UI) in two spec files, one GitHub Actions workflow.

## 2. Testing objectives
- Stabilize the existing suite: every failure root-caused, target 5 consecutive green runs with retries = 0.
- Remove security problems from the automation (committed credentials).
- Improve readability and maintainability of the code that is touched.
- Increase meaningful coverage of high-risk flows where time allows.
- Report defects, changes and AI usage transparently.

## 3. Scope and exclusions
**In scope:** the existing API tests (health, auth, portfolio, entities, countries, search) and UI tests (login,
terms checkbox, auth redirects, logout, sidebar navigation, Deal Book search, Countries, Institutions, Portfolio),
plus EDD Dossiers page (ui 11). The organisers' competition-day message (kit copy of `competition-task.md`)
recommends six flows: Deal Book, Screenings, Network and Institutions, Countries, Monitoring and Portfolio, and
read-only API/MCP access; it states that the rest of the product, including performance and security, is in scope too.
**Out of scope (time):** MCP server, Screenings and Monitoring flows that create data, performance testing, cross-browser
(Chromium only), visual testing. Security was covered only for the automation itself (ED-01, ED-02) and the existing auth tests.

## 4. Testing strategy
- Approach: Playwright API tests (`request` fixture) and UI E2E tests, split into `api` and `ui` projects with `baseURL` (ED-03).
- Contract source: the published OpenAPI spec; test expectations that contradict spec + live behaviour are test defects (ED-04).
- Locator strategy: user-facing locators (`getByRole`, `getByLabel`, test ids) for every line fixed (ED-05); remaining XPath/CSS is a known debt.
- Synchronization: web-first assertions and auto-waiting; fixed sleeps removed where fixed (one remains in ui 8).
- Isolation: each test logs in on its own; no order dependency; tests share one personal account.
- Test data: live product data in the competition workspace; read-only — no test creates or changes data.
- Credentials: environment variables only (`STONEWAKE_EMAIL`, `STONEWAKE_PASSWORD`, `STONEWAKE_API_KEY`); never in code or reports (ED-01, ED-02).
- Defect handling: classify product / automation / environment / unconfirmed ([DEFECTS.md](DEFECTS.md)); product defects to SpiraTest after QA Lead approval.

## 5. Existing test coverage (baseline)
| Area / flow | Test(s) | Baseline status (18:27, retries 0) |
|---|---|---|
| API health | api 1 | pass (after `/health` fix C-04; failed on original code at 18:12) |
| API auth (valid / missing / invalid credentials) | api 2, 3, 4 | api 2 fail; api 3, 4 pass |
| API portfolio list + summary | api 5, 6 | api 5 fail; api 6 pass |
| API entities | api 7, 8 | pass |
| API countries | api 9 | fail |
| API search | api 10 | fail |
| UI login / wrong password / terms | ui 1, 2, 3 | ui 1, 3 fail; ui 2 pass |
| UI auth redirect / logout | ui 4, 5 | pass |
| UI sidebar navigation | ui 6 | fail |
| UI Deal Book search | ui 7 | fail |
| UI Countries / Institutions / Portfolio | ui 8, 9, 10 | ui 8, 9 pass; ui 10 fail |
Total: 11 passed / 9 failed of 20.

## 6. Proposed additional coverage
| # | Scenario | Risk | Why it matters | Status |
|---|---|---|---|---|
| 1 | EDD Dossiers page loads with heading and "New dossier" | M | Feature lost its sidebar entry (DEF-U-01) | done (ui 11) |
| 2 | Sidebar shows EDD Dossiers (documented) | M | Docs describe the link; app does not show it | written as ui 6b, skipped because of product defect IN:86 |
| 3 | Screenings: read an existing result with sources | H | Recommended flow, no coverage | not started |
| 4 | Network / ownership chain of a company | M | Recommended flow, no coverage | not started |
| 5 | Monitoring updates | M | Recommended flow, no coverage | not started |
| 6 | API `completeness` may be `null` | L | Spec allows it; api 5 would fail | not started |

## 7. Risk-based prioritization
| Risk | Likelihood | Impact | Priority | Mitigation |
|---|---|---|---|---|
| Credentials leaked via repo or reports | H (happened) | H | P1 | ED-01 done locally; ED-02 publish only green reports; rotation by owner |
| Suite cannot go green → no 5-run evidence | H (baseline 11/20) | H | P1 | C-07…C-16 → 21/21 |
| Live data changes break data-dependent tests (ui 7, 9, 10) | M | M | P2 | Assertions use structure, first row, documented ids; monitor in 5 runs |
| CI fails because secrets are missing | H | H | P1 | Add repo secrets + workflow `env:` (PENDING approval) |
| Shared account rate limits / sessions | L | M | P3 | Workers = 2; one personal account |

## 8. Test environment
- Local: Windows 11, Node v24.11.0, Playwright 1.64.1, Chromium headless.
- CI: GitHub Actions `ubuntu-latest`, Node 22, Chromium (workflow unchanged, PENDING secrets).
- Application: live product `https://app.stonewake.ai` / `https://api.stonewake.ai`, competition workspace, team itac-2.
- Configuration: retries = 0, workers = 2, test timeout 30 s, `trace: retain-on-failure`, `screenshot: only-on-failure` (unchanged).

## 9. Entry and exit criteria
**Entry:** repository cloned, `npm ci` and Chromium installed, application reachable, credentials available as env variables, baseline recorded — met at 18:27.
**Exit:**
- 5 consecutive successful full-suite runs, retries = 0, on the final commit (local and GitHub Actions) — PENDING.
- No unexplained failures; every failure classified — met.
- Product defects registered in SpiraTest — met: 1 defect, IN:86.
- Report published and links publicly accessible — PENDING.

## 10. Execution results
| Stage | Total | Passed | Failed | Flaky | Skipped | Evidence |
|---|---|---|---|---|---|---|
| Baseline (18:27) | 20 | 11 | 9 | not measured | 0 | [BASELINE-ANALYSIS.md](BASELINE-ANALYSIS.md) |
| After fixes (18:45) | 21 | 21 | 0 | — | 0 | [STABILITY_RESULTS.md](STABILITY_RESULTS.md) |
| After IN:86 (19:31) | 22 | 21 | 0 | — | 1 (ui 6b, IN:86) | [STABILITY_RESULTS.md](STABILITY_RESULTS.md) |
| Final local (5 runs) | | | | | | PENDING |
| Final CI (5 runs) | | | | | | PENDING |

## 11. Known limitations

**Product defect affecting coverage — [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx):** the sidebar does
not show "EDD Dossiers", although our workspace has the dossiers module and the docs say the link belongs there.
The test for that link (ui 6b) is skipped until the defect is fixed, so sidebar navigation to EDD Dossiers is
currently **not covered**. What is still covered: ui 6 checks the other sidebar links, and ui 11 checks that the
EDD Dossiers page loads with its heading and "New dossier" button. Risk: a skipped test will not tell us when the
fix ships; whoever closes IN:86 must remove the skip. Details: [DEFECTS.md](DEFECTS.md).

Other limitations:
- Original credentials remain in public Git history — needs rotation by the owner (ED-01).
- Failure artifacts can contain typed credentials — publish only green reports (ED-02).
- CI has no credentials and no report publication yet (ED-08).
- One fixed wait (ui 8), duplicated login steps and XPath locators remain (maintainability debt).
- Flakiness was not measured before fixing (single baseline run).
