# Software Test Plan — Stonewake test automation (ITAC 2026 Final)

| | |
|---|---|
| Version / date | v1.0 / 2026-11-04 |
| Author | Victoria (team itac-2), written with help from Claude Code — see [AI_USAGE_LOG.md](AI_USAGE_LOG.md) |
| Repository | https://github.com/v8i8k8i8/stonewake-final-repo (fork of `AlexKomanov/stonewake-final-repo`) |
| Original commit | `b4f92c9` |
| Final commit | `188139e` (all code; tested by the five CI runs). Later commits change documentation only. |

## 1. Project overview
Stonewake is a business and financial intelligence platform. Users search and filter deals, screen companies,
explore funding and ownership networks, check country risk and monitor companies over time. It has a web UI
(https://app.stonewake.ai), a read-only REST API (https://api.stonewake.ai, OpenAPI at `/openapi.json`) and an MCP
server. Docs: https://docs.stonewake.ai. The final runs on the live product, in a competition workspace (team itac-2).

What I received: Playwright 1.64.1 + TypeScript, 20 tests (10 API, 10 UI) in two spec files, and one GitHub Actions workflow.

## 2. Objectives
- Make the existing suite stable: find the root cause of every failure, then get 5 green runs in a row with retries = 0.
- Remove the security problems from the automation (committed credentials).
- Make the code I touch easier to read and maintain.
- Add meaningful coverage for high-risk flows where time allows.
- Report defects, changes and AI usage openly.

## 3. Scope
**In scope:** the existing API tests (health, auth, portfolio, entities, countries, search) and UI tests (login,
terms checkbox, auth redirects, logout, sidebar navigation, Deal Book search, Countries, Institutions, Portfolio),
plus the EDD Dossiers page (ui 11) and sidebar link (ui 6b). The organisers' competition-day message (kit copy of
`competition-task.md`) recommends six flows: Deal Book, Screenings, Network and Institutions, Countries, Monitoring
and Portfolio, and read-only API/MCP access. It also says the rest of the product, including performance and
security, is in scope.

**Out of scope (no time):** the MCP server, Screenings and Monitoring flows that create data, performance testing,
other browsers (Chromium only) and visual testing. For security, I covered only the automation itself (ED-01, ED-02)
and the existing auth tests.

## 4. How I test
- **Test types:** Playwright API tests (`request` fixture) and UI end-to-end tests, split into an `api` and a `ui` project with `baseURL` (ED-03).
- **Source of truth for the API:** the published OpenAPI spec. If the spec and the live API agree and the test does not, the test is wrong (ED-04).
- **Locators:** user-facing locators (`getByRole`, `getByLabel`, test ids) on every line I fixed (ED-05). The remaining XPath/CSS is known debt.
- **Waiting:** Playwright's auto-waiting and web-first assertions. Fixed sleeps were removed where I fixed tests (one is left in ui 8).
- **Isolation:** every test logs in on its own; no test depends on another. All tests share my personal account.
- **Test data:** live product data in the competition workspace. Read-only: no test creates or changes data.
- **Credentials:** environment variables only (`STONEWAKE_EMAIL`, `STONEWAKE_PASSWORD`, `STONEWAKE_API_KEY`), never in code or reports (ED-01, ED-02).
- **Defects:** every problem is classified as product, automation, environment or unconfirmed ([DEFECTS.md](DEFECTS.md)). Product defects go to SpiraTest after I approve them.

## 5. Starting point (baseline)
First full run at 18:27, retries 0, with my own credentials:

| Area / flow | Test(s) | Result |
|---|---|---|
| API health | api 1 | pass (after the `/health` fix C-04; failed on the original code at 18:12) |
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

Total: 11 passed / 9 failed of 20. Why each one failed: [DEFECTS.md](DEFECTS.md).

## 6. Added coverage
| # | Scenario | Risk | Why it matters | Status |
|---|---|---|---|---|
| 1 | EDD Dossiers page loads with its heading and "New dossier" | M | The feature lost its sidebar entry | done (ui 11) |
| 2 | Sidebar shows EDD Dossiers (documented) | M | The docs describe the link; the app does not show it | written as ui 6b, skipped because of product defect IN:86 |
| 3 | API `completeness` may be `null` | L | The spec allows it; api 5 would have failed | done (C-19) |
| 4 | Screenings: read an existing result with sources | H | Recommended flow, no coverage | not started |
| 5 | Network / ownership chain of a company | M | Recommended flow, no coverage | not started |
| 6 | Monitoring updates | M | Recommended flow, no coverage | not started |

## 7. Risks and priorities
| Risk | Likelihood | Impact | Priority | What I do about it |
|---|---|---|---|---|
| Credentials leak through the repo or reports | H (it happened) | H | P1 | ED-01 done; ED-02: publish only green reports; the owner should change the credentials |
| The suite cannot go green, so no 5-run evidence | H (baseline 11/20) | H | P1 | C-07…C-16 → 21/21 |
| Live data changes break data-dependent tests (ui 7, 9, 10) | M | M | P2 | Checks use structure, the first row and documented ids; watched during the 5 runs |
| CI fails because secrets are missing | H | H | P1 | The workflow reads them now (C-18); repository secrets still to be added |
| Shared account: rate limits or session conflicts | L | M | P3 | Workers = 2; one personal account |

## 8. Test environment
- **Local:** Windows 11, Node v24.11.0, Playwright 1.64.1, Chromium headless.
- **CI:** GitHub Actions `ubuntu-latest`, Node 22, Chromium. Workflow from C-18, credentials from repository secrets; verified by 5/5 green runs.
- **Application:** live product `https://app.stonewake.ai` / `https://api.stonewake.ai`, competition workspace, team itac-2.
- **Configuration:** retries = 0, workers = 2, test timeout 30 s, `trace: retain-on-failure`, `screenshot: only-on-failure` (unchanged).

## 9. Entry and exit criteria
**Entry:** repository cloned, `npm ci` and Chromium installed, application reachable, credentials available as
environment variables, baseline recorded — met at 18:27.

**Exit:**
- 5 consecutive successful full-suite runs, retries = 0, on the final commit — met: GitHub Actions 5/5 on `188139e`, and locally 5/5 on the same code.
- No unexplained failures; every failure classified — met.
- Product defects registered in SpiraTest — met: 1 defect, IN:86.
- Report published and links publicly accessible — met: https://v8i8k8i8.github.io/stonewake-final-repo/ (HTTP 200 without login, 20:01).

## 10. Execution results
| Stage | Total | Passed | Failed | Flaky | Skipped | Evidence |
|---|---|---|---|---|---|---|
| Baseline (18:27) | 20 | 11 | 9 | not measured | 0 | [BASELINE-ANALYSIS.md](BASELINE-ANALYSIS.md) |
| After fixes (18:45) | 21 | 21 | 0 | — | 0 | [STABILITY_RESULTS.md](STABILITY_RESULTS.md) |
| After IN:86 (19:31) | 22 | 21 | 0 | — | 1 (ui 6b, IN:86) | [STABILITY_RESULTS.md](STABILITY_RESULTS.md) |
| Final local (5 runs, code = `188139e`) | 22 per run | 21 per run | 0 | 0 | 1 per run (ui 6b, IN:86) | [STABILITY_RESULTS.md §2](STABILITY_RESULTS.md) — 5/5 passed |
| Final CI (5 runs, `188139e`) | 22 per run | 21 per run | 0 | 0 | 1 per run (ui 6b, IN:86) | [STABILITY_RESULTS.md §3](STABILITY_RESULTS.md) — 5/5 green |

## 11. Known limitations
**Product defect that affects coverage — [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx).** The sidebar
does not show "EDD Dossiers", although our workspace has the dossiers module and the docs say the link belongs there.
The test for that link (ui 6b) is skipped until the bug is fixed, so the sidebar link to EDD Dossiers is **not
covered** right now. ui 6 still checks the other sidebar links, and ui 11 checks that the EDD Dossiers page loads.
A skipped test will not tell us when the fix ships, so whoever closes IN:86 must remove the skip.
Details: [DEFECTS.md](DEFECTS.md).

Other limitations:
- The original credentials are still in the public Git history; the owner needs to change them (ED-01).
- Failure artifacts can contain the typed credentials, so I publish only green reports (ED-02).
- One fixed wait (ui 8), repeated login steps and XPath locators remain (maintenance debt).
- Flakiness was not measured before the fixes (only one baseline run).
