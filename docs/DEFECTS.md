# Defects — Stonewake test automation (ITAC 2026 Final)

Code tested: commit `188139e` (see [CHANGES.md](CHANGES.md)) · Updated: 2026-11-04
Product defects must be opened in SpiraTest (preparation-email.md, section "STP ודוח תקלות").

I sort every problem into one of four groups before I fix anything:

| Group | What it means | In SpiraTest? |
|---|---|---|
| Product | The app itself behaves wrong. I can reproduce it by hand, outside the tests. | **Yes** (incident) |
| Automation | The test code is wrong (locator, wait, assertion, data, config). | No — fixed in code ([CHANGES.md](CHANGES.md)) |
| Environment | Network, data, service availability, CI runner, browser install. | No |
| Unconfirmed | Not investigated enough to say. | No — never filed as a product defect |

## Summary
| ID | Group | Title | Severity / impact | Status | SpiraTest | Related test |
|---|---|---|---|---|---|---|
| DEF-P-01 | Product | Sidebar does not show "EDD Dossiers" although the dossiers module is enabled | Medium | New (open in SpiraTest) | [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) | ui 6b (skipped), ui 11 |
| DEF-A-01 | Automation (security) | Credentials and API key hardcoded in tests and in a committed `.env` | High (security) | Fixed (C-01, C-03) | n/a | all tests that log in |
| DEF-A-02 | Automation | api 1 called `/v1/health` (404) instead of `/health` | Test always failed | Fixed (C-04) | n/a | api 1 |
| DEF-A-03 | Automation | api 2 sent `Token` auth instead of `Bearer` | Test always failed (401) | Fixed (C-07) | n/a | api 2 |
| DEF-A-04 | Automation | api 5 read `data` instead of the documented `items` | Test always failed | Fixed (C-08) | n/a | api 5 |
| DEF-A-05 | Automation | api 9 expected Germany to be `GE` (that is Georgia) instead of `DE` | Test always failed | Fixed (C-09) | n/a | api 9 |
| DEF-A-06 | Automation | api 10 expected a search limit of 50; the documented maximum is 25 | Test always failed | Fixed (C-10) | n/a | api 10 |
| DEF-A-07 | Automation | ui 1 used a non-existent `#email` field and a fixed 2 s wait | Test always failed (30 s timeout) | Fixed (C-11) | n/a | ui 1 |
| DEF-A-08 | Automation | ui 3 clicked the hidden native checkbox, not the visible one | Test always failed (30 s timeout) | Fixed (C-12) | n/a | ui 3 |
| DEF-A-09 | Automation | ui 7 expected `/deal/` links; the app uses `/deals/`; fixed 3 s wait | Test always failed | Fixed (C-13) | n/a | ui 7 |
| DEF-A-10 | Automation | ui 10 used test id `tile-not-assessed`; the app uses `tile-not_assessed` | Test always failed | Fixed (C-14) | n/a | ui 10 |
| DEF-A-11 | Automation (security) | api 2 printed the `/v1/me` response (key details) to the CI log | Information leak | Fixed (C-05) | n/a | api 2 |
| DEF-E-01 | Environment / process | Playwright failure snapshots contain the typed credentials | High if published | Open — mitigation proposed (ED-02) | n/a | all UI tests that log in |

Totals: product 1 (filed as IN:86) · unconfirmed 0 · automation 11 (all fixed) · environment/process 1 (open).

---

## Product defects

### DEF-P-01 — Sidebar does not show "EDD Dossiers" although the dossiers module is enabled
**SpiraTest:** [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) (needs a SpiraTest login) · **Jam:** none

**What happened.** In the first full run (18:27), ui 6 failed because it could not find the "EDD Dossiers" link in
the sidebar. The page itself opened fine at `/dossiers`. So at first we thought the test might simply be outdated.

**How we investigated.** Claude showed me the app in Chrome (Claude in Chrome, read-only), and I checked the
sidebar and the page myself. The in-app guide
(`/guide`) describes EDD Dossiers but does not say where the link should be, so we first recorded it as
unconfirmed (DEF-U-01) and kept the page covered with a new test (ui 11).

Then, at about 19:00, we checked the public docs. The page https://docs.stonewake.ai/dossiers ("Where to find it")
says the link is in the sidebar for every team whose workspace holds the dossiers module. The workspace settings the
app loads (`GET /workspace`) list `dossiers` as an enabled module, with no override. My user is an Administrator, and
the docs allow analysts and above, so the role is not the reason either.

**What we concluded.** The link should be visible, and it is not. This is a product bug, not a test problem.
We reproduced it 3 times (Chrome 18:37 and 18:40, headless Chromium 19:12). I decided to report it in SpiraTest,
where it is IN:86.

**What I decided for the tests.** I kept the sidebar check as its own test, `ui 6b sidebar edd dossiers link`,
and marked it as skipped with a reference to IN:86. The organisers allow skipping a test that is blocked by a
confirmed product bug. ui 6b shows as **skipped** in every report, never as passed. ui 6 still checks the other
sidebar links, and ui 11 checks that the EDD Dossiers page works. When IN:86 is fixed, the skip must be removed.
See CHANGES C-17 and [ED-06](ENGINEERING_DECISIONS.md#ed-06--ui-6--edd-dossiers-sidebar-link-and-new-ui-11).

| Field | Value |
|---|---|
| Type / Priority / Severity | Bug / 3 - Medium / 3 - Medium |
| Status | New (filed 2026-11-04 19:29 Israel time) |
| Detected release | 1.0.0.0 |
| Frequency / Issue type | Always (100%) / Functional |
| Browser / Found in | Chrome / Automation Scenario |
| Attachments | DC:71 docs page "Where to find it"; DC:72 `/dossiers` opened directly |

**Steps to reproduce**
1. Sign in to https://app.stonewake.ai as an Administrator of team itac-2.
2. On the Deal Book, look at the sidebar, section Coverage.
3. Look for "EDD Dossiers" (the in-app guide lists it between Screenings and Scoring).
4. Open https://app.stonewake.ai/dossiers directly.

**Expected:** the sidebar shows "EDD Dossiers", and it opens `/dossiers`.

**Actual:** under Coverage the sidebar shows Monitoring, Portfolio, Screenings and Scoring, but no EDD Dossiers.
`/dossiers` works (heading "EDD Dossiers", "New dossier" button), and company pages link to it through
"Start EDD dossier". The feature is there; only the sidebar entry is missing.

---

## Automation defects (fixed in code, not in SpiraTest)

All of these failed in the first full run: `npx --no-install playwright test --retries=0` at 18:27 → 11 passed / 9 failed
(`C:\ITAC-Workspace\baseline-evidence\20261104-182723-p1b-start\`). api 1 also failed in the 18:12 run without
credentials (`20261104-181209\`). For each one, we first checked whether the app or the test was wrong.

| ID | Location | Why the test failed | How we confirmed it | Fix | Verification |
|---|---|---|---|---|---|
| DEF-A-01 | tests/api.spec.ts, tests/ui.spec.ts, `.env`, `.gitignore` | Secrets were in the code of a public repo | `git diff` vs `b4f92c9` | C-01, C-03 — [ED-01](ENGINEERING_DECISIONS.md#ed-01--hardcoded-credentials-and-api-key-exposed-in-public-git-history) | Grep finds 0 literals; 21/21 with my own credentials (18:45) |
| DEF-A-02 | tests/api.spec.ts:5 | 404: the health endpoint is `/health`, not `/v1/health` | Organiser setup, 18:12 run | C-04 | 4/4 subset (18:25), 21/21 (18:45) |
| DEF-A-03 | tests/api.spec.ts:16 | 401: the API only accepts `Bearer` | `openapi.json` bearerAuth; probe Token → 401, Bearer → 200 | C-07 | api 10/10 (18:30) |
| DEF-A-04 | tests/api.spec.ts:71-76 | `b.data` is undefined; the list is in `items` | `openapi.json` `V1Page_V1ExposureOut_`; live response keys | C-08 | api 10/10 (18:30) |
| DEF-A-05 | tests/api.spec.ts:166 | Germany is `DE`; `GE` is Georgia | ISO 3166-1 alpha-2 | C-09 | api 10/10 (18:30) |
| DEF-A-06 | tests/api.spec.ts:197 | The real error message says 25, not 50 | `openapi.json` `/v1/search` `limit.maximum: 25`; live 25 → 200, 26 → 422 | C-10 | api 10/10 (18:30) |
| DEF-A-07 | tests/ui.spec.ts:9 | Timeout: the email field has no `id="email"` | Failure snapshot: textbox "Email", no id | C-11 | ui 4/4 (18:31) |
| DEF-A-08 | tests/ui.spec.ts:42 | Timeout: the native checkbox is hidden (`aria-hidden`) | Snapshot; probe: `getByRole('checkbox').check()` → `aria-checked=true` | C-12 | ui 4/4 (18:31) |
| DEF-A-09 | tests/ui.spec.ts:117 | Link not found: deal links are `/deals/<id>` | Failure snapshot | C-13 | ui 4/4 (18:31) |
| DEF-A-10 | tests/ui.spec.ts:189 | Element not found: the test id is `tile-not_assessed` | DOM probe | C-14 | ui 4/4 (18:31) |
| DEF-A-11 | tests/api.spec.ts (api 2) | The response body was printed to the log | Code review | C-05 | api 2 passes, no output |

---

## Environment / process issues

### DEF-E-01 — Typed credentials in Playwright failure artifacts
When a UI test fails after the login form is filled, Playwright's page snapshot (`error-context.md`) shows what was
typed into the email and password fields. The same data ends up in the trace and the HTML report. I saw this in the
failed local runs at 18:27.

- **Cause:** the snapshot captures input values; the config uses `trace: 'retain-on-failure'` and `screenshot: 'only-on-failure'`.
- **What we do about it:** evidence stays outside the repo, test artifacts are git-ignored, and only reports of
  green runs are published. The CI workflow (C-18) uploads and publishes the report only when every test passed;
  the published report was checked (20:01) and contains no credential values.
- **Decision:** option A — [ED-02](ENGINEERING_DECISIONS.md#ed-02--sensitive-data-in-playwright-failure-artifacts).

---

## Unconfirmed
None open. DEF-U-01 was confirmed and became DEF-P-01 / IN:86. I keep it here for history.

| ID | What we saw at the time | Outcome |
|---|---|---|
| DEF-U-01 (closed → DEF-P-01) | ~18:40: the sidebar had no "EDD Dossiers" link. The original ui 6 expected `//aside//a[normalize-space(.)="EDD Dossier"]` → `/dossiers` between Screenings and Scoring. `/dossiers` loaded by URL, and a company page (`/entities/n106084`) linked to it via "Start EDD dossier". The in-app guide did not mention the sidebar and says "A control named here that you do not see is view only for your role." | ~19:00 the public docs said the link belongs in the sidebar; 19:12 the workspace settings showed the module is on → filed as IN:86 |
