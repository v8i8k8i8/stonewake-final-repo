# Defects — Stonewake test automation (ITAC 2026 Final)

Commit tested: `b4f92c9` + uncommitted working-tree changes (see [CHANGES.md](CHANGES.md)) · Updated: 19:05 (2026-11-04)
Official basis: product defects must be opened in SpiraTest (preparation-email.md, section "STP ודוח תקלות").

| Class | Meaning | In SpiraTest? |
|---|---|---|
| Product | App behaves incorrectly; reproduced manually, outside the automation | **Yes** (incident) |
| Automation | Test code / framework wrong (locator, wait, assertion, data, isolation, config) | No — fixed in code (CHANGES.md) |
| Environment | Network, data, service availability, CI runner, browser install | No |
| Unconfirmed | Not investigated enough to classify | No — never filed as product defect |

## Summary
| ID | Class | Title | Severity / impact | Status | SpiraTest | Related test |
|---|---|---|---|---|---|---|
| DEF-P-01 | Product | Sidebar does not show "EDD Dossiers" although the dossiers module is enabled for the workspace | Medium | New (open in SpiraTest) | [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) | ui 6b (skipped), ui 11 |
| DEF-A-01 | Automation (security) | Credentials and API key hardcoded in tests and committed `.env` | High (security) | Fixed locally, not committed | n/a | all credential tests |
| DEF-A-02 | Automation | api 1 called `/v1/health` (404) instead of `/health` | Test always failed | Fixed (C-04) | n/a | api 1 |
| DEF-A-03 | Automation | api 2 sent `Token` auth scheme instead of `Bearer` | Test always failed (401) | Fixed (C-07) | n/a | api 2 |
| DEF-A-04 | Automation | api 5 read `data` instead of documented `items` | Test always failed | Fixed (C-08) | n/a | api 5 |
| DEF-A-05 | Automation | api 9 expected Germany iso2 `GE` (Georgia) instead of `DE` | Test always failed | Fixed (C-09) | n/a | api 9 |
| DEF-A-06 | Automation | api 10 expected search limit max 50; documented max is 25 | Test always failed | Fixed (C-10) | n/a | api 10 |
| DEF-A-07 | Automation | ui 1 used non-existent `#email` + fixed 2 s wait | Test always failed (30 s timeout) | Fixed (C-11) | n/a | ui 1 |
| DEF-A-08 | Automation | ui 3 checked the hidden native checkbox instead of the visible `role=checkbox` control | Test always failed (30 s timeout) | Fixed (C-12) | n/a | ui 3 |
| DEF-A-09 | Automation | ui 7 expected `/deal/` links; app uses `/deals/` + fixed 3 s wait | Test always failed | Fixed (C-13) | n/a | ui 7 |
| DEF-A-10 | Automation | ui 10 used test id `tile-not-assessed`; app uses `tile-not_assessed` | Test always failed | Fixed (C-14) | n/a | ui 10 |
| DEF-A-11 | Automation (security) | api 2 `console.log` of `/v1/me` body (key metadata in CI logs) | Information leak | Fixed (C-05) | n/a | api 2 |
| DEF-E-01 | Environment / process | Playwright failure snapshots contain typed credentials | High if published | Open — mitigation proposed (ED-02) | n/a | all UI tests that log in |

Totals: product 1 (filed: IN:86) · unconfirmed 0 · automation 11 (fixed 11, all uncommitted) · environment/process 1 (open).

---

## Product defects

### DEF-P-01 — Sidebar does not show "EDD Dossiers" although the dossiers module is enabled
**SpiraTest:** [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) (SpiraTest needs a login to view) · **Jam:** none

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

**Expected:** the sidebar shows "EDD Dossiers" and it opens `/dossiers`.
The docs say so (https://docs.stonewake.ai/dossiers, "Where to find it": the link is in the sidebar for every team
whose workspace holds the dossiers module), and our workspace has that module: the workspace settings the app loads
(`GET /workspace`) list `dossiers` in its modules, with no override.

**Actual:** the sidebar shows Monitoring, Portfolio, Screenings and Scoring under Coverage, with no EDD Dossiers link.
`/dossiers` itself works (heading "EDD Dossiers", "New dossier" button), and company pages link to it through
"Start EDD dossier". So the feature is there; only the sidebar entry is missing.

**How we got here:** ui 6 timed out on the missing link in the first full run (18:27). We first treated it as
unconfirmed, because the in-app guide does not mention the sidebar. The public docs do, and the workspace settings show
the module is on, so we filed it. Reproduced 3 times (Chrome 18:37 and 18:40, headless Chromium 19:12). The user role is
not the cause: we are Administrator, and the docs allow analysts and above.

**Impact on the suite:** the sidebar check now lives in its own test, `ui 6b sidebar edd dossiers link`, which is
skipped with a reference to IN:86 (QA Lead decision; the organisers allow skipping for a confirmed product bug).
It shows as **skipped** in every report. ui 6 still checks the other sidebar links, and ui 11 checks that the
EDD Dossiers page works. Remove the skip when IN:86 is fixed. See CHANGES C-17.

---

## Automation defects (fixed in code, not in SpiraTest)

Baseline for all items: `npx --no-install playwright test --retries=0` at 18:27 → 11 passed / 9 failed
(`C:\ITAC-Workspace\baseline-evidence\20261104-182723-p1b-start\`). Every failure below failed in that run;
api 1 also failed in the 18:12 credential-free run (`20261104-181209\`).

| ID | Location | Symptom | Root cause (confirmed by) | Fix | Verification |
|---|---|---|---|---|---|
| DEF-A-01 | tests/api.spec.ts, tests/ui.spec.ts, `.env`, `.gitignore` | Secrets in public repo | `git diff` vs `b4f92c9` | C-01, C-03 — [ED-01](ENGINEERING_DECISIONS.md#ed-01--hardcoded-credentials-and-api-key-exposed-in-public-git-history) | Grep 0 literals; 21/21 with own credentials (18:45) |
| DEF-A-02 | tests/api.spec.ts:5 | 404 | Health endpoint is `/health` (organiser setup, 18:12 run) | C-04 | 4/4 subset (18:25), 21/21 (18:45) |
| DEF-A-03 | tests/api.spec.ts:16 | 401 | `openapi.json` bearerAuth; probe Token→401, Bearer→200 | C-07 | api 10/10 (18:30) |
| DEF-A-04 | tests/api.spec.ts:71-76 | `b.data` undefined | `openapi.json` `V1Page_V1ExposureOut_`; live response keys | C-08 | api 10/10 (18:30) |
| DEF-A-05 | tests/api.spec.ts:166 | `DE` ≠ `GE` | ISO 3166-1 alpha-2 | C-09 | api 10/10 (18:30) |
| DEF-A-06 | tests/api.spec.ts:197 | message says 25 | `openapi.json` `/v1/search` `limit.maximum: 25`; live 25→200, 26→422 | C-10 | api 10/10 (18:30) |
| DEF-A-07 | tests/ui.spec.ts:9 | timeout on `#email` | error-context snapshot: textbox "Email", no id | C-11 | ui 4/4 (18:31) |
| DEF-A-08 | tests/ui.spec.ts:42 | timeout on `check()` | snapshot: native checkbox `aria-hidden`; probe: `getByRole('checkbox').check()` → `aria-checked=true` | C-12 | ui 4/4 (18:31) |
| DEF-A-09 | tests/ui.spec.ts:117 | link not found | snapshot: links `/deals/<id>` | C-13 | ui 4/4 (18:31) |
| DEF-A-10 | tests/ui.spec.ts:189 | element not found | DOM probe: `tile-not_assessed` | C-14 | ui 4/4 (18:31) |
| DEF-A-11 | tests/api.spec.ts (api 2) | body printed to log | code review | C-05 | api 2 passes, no output |

---

## Environment / process issues

### DEF-E-01 — Typed credentials in Playwright failure artifacts
| Field | Value |
|---|---|
| Symptom / where | `error-context.md` (and therefore trace / HTML report) of failed UI tests shows the email and password field contents; local runs 18:27 |
| Cause | Playwright page snapshot captures input values; config `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'` |
| Mitigation / residual risk | Evidence kept outside the repo, artifacts git-ignored; publish only green-run reports. CI still uploads `playwright-report/` on failure (workflow unchanged). Decision pending: [ED-02](ENGINEERING_DECISIONS.md#ed-02--sensitive-data-in-playwright-failure-artifacts) |

---

## Unconfirmed
None open. DEF-U-01 below was confirmed and is now DEF-P-01 / IN:86; kept for history.

| ID | Observation | Evidence so far | Next step |
|---|---|---|---|
| DEF-U-01 (closed → DEF-P-01) | **Unconfirmed navigation issue (not yet a confirmed product defect):** the sidebar has no "EDD Dossiers" link. The original ui 6 expected `//aside//a[normalize-space(.)="EDD Dossier"]` → `/dossiers` between Screenings and Scoring. | 2026-11-04 ~18:40, Claude in Chrome, team itac-2: sidebar = Deal Book, Tenders, Countries, Institutions, Network, Monitoring, Portfolio, Screenings, Scoring. `/dossiers` loads by URL (title "EDD Dossiers · Stonewake", h1 "EDD Dossiers", enabled "New dossier" button). Company page `/entities/n106084` has "Start EDD dossier" → `/dossiers?node=n106084`. No `/dossiers` link on `/` or `/screenings`. In-app guide `/guide` lists "EDD Dossiers" between Screenings and Scoring and names the two in-page entry points; it also says "A control named here that you do not see is view only for your role." **~19:00: public docs `https://docs.stonewake.ai/dossiers` ("Where to find it") say "EDD Dossiers in the sidebar opens the workbench for every team whose workspace holds the dossiers module."** | QA Lead decides (ED-06 options A/B/C). Ask Stonewake staff (via judges) whether this workspace holds the dossiers module. If the link should be shown: reproduce manually, file in SpiraTest (approval), move to Product, add the incident ID here. |
