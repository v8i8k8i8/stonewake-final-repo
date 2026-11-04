# Engineering Decisions

Significant decisions (shared code, config, CI, test architecture, root causes affecting several tests).
Routine fixes are rows in [CHANGES.md](CHANGES.md). Status: proposed / approved / implemented / verified / incomplete / pending.
"QA Lead approved Claude's recommendation" is used where the QA Lead approved without stating own reasoning.
Claude's in-scope choices are recorded as Claude's.

## Summary
| ID | Time | Decision | Status | Decided by | Verification |
|---|---|---|---|---|---|
| ED-01 | 18:25 | Credentials moved from source and Git index to env variables; history kept; rotation recommended | implemented (local) — CI secrets, commit, rotation pending | QA Lead approved Claude's recommendation | 21/21 local with own credentials (18:45); CI not verified |
| ED-02 | 18:30 | Failure artifacts contain typed credentials; do not commit or publish them | proposed — no code/CI change yet | PENDING (QA Lead) | Observed in `error-context.md` of failed UI tests |
| ED-03 | 18:25 | Two Playwright projects (`api`, `ui`) with `baseURL` and env overrides | verified | QA Lead (P1-a prompt, item 3) | 21/21 (18:45) |
| ED-04 | 18:29 | API expectations aligned to the published OpenAPI contract, not to the old test code | verified | Claude, within the QA Lead's P1-b scope | api project 10/10 (18:30) |
| ED-05 | 18:31 | User-facing locators and web-first waits for the lines being fixed; no fixed sleeps there | verified | Claude, within P1-b scope | 4/4 targeted, 21/21 full (18:45) |
| ED-06 | 18:44 / 19:31 | Missing EDD Dossiers sidebar link is product defect IN:86; its check is a separate skipped test (ui 6b); page covered by ui 11 | implemented | QA Lead | 21 passed, 1 skipped (19:31) |
| ED-07 | 18:26 | Stability strategy: retries 0, failures root-caused, no skips/weakened assertions, evidence per run | in progress | QA Lead (prompts) | 5-run series not started |
| ED-08 | — | CI / reporting: workflow not changed yet | pending | — | not verified |

---

## ED-01 — Hardcoded credentials and API key exposed in public Git history
- **Time / status:** 18:25 / implemented locally, not committed; CI secrets and rotation pending.
- **Problem and evidence:**
  - Original commit `b4f92c9` (2026-11-04 09:30 +0200) hardcoded the account email, password and API key in
    `tests/api.spec.ts` and `tests/ui.spec.ts` (confirmed in `git diff`; values deliberately not reproduced).
  - The same commit tracked a 5-line `.env`, plus `playwright-report/` and `test-results/` (traces, screenshots).
  - "api 2" logged the `/v1/me` body with `console.log`, which put key metadata in CI logs.
  - The repository is public (upstream and our fork).
- **Root cause (confirmed):** secrets were written into source and committed; `.gitignore` did not exclude `.env`
  or test artifacts.
- **Impact:** anyone can use the account and API key; every fork shares one account and key (rate limits, session conflicts).
- **Options:**
  | Option | Pros | Cons |
  |---|---|---|
  | A: env variables + `.gitignore` + untrack files; keep history (recommended) | Fast, non-destructive, standard | Old values remain in history, so rotation is still needed |
  | B: A + history rewrite and force-push | Cleans our fork's history | Destructive; upstream, other forks and clones still hold the values |
- **Recommendation (Claude):** A. Once a secret is public, only rotation protects it.
- **Decision (QA Lead):** A — QA Lead approved Claude's recommendation. The QA Lead additionally decided to use
  personal credentials, not the committed organiser ones (prompt P1-a, 18:15).
- **Implementation (working tree, not committed):**
  - `tests/support/credentials.ts` reads `STONEWAKE_EMAIL`, `STONEWAKE_PASSWORD`, `STONEWAKE_API_KEY` and fails clearly if one is missing.
  - `.gitignore` covers `.env`, `.env.*` (except `.env.example`), `node_modules/`, `playwright-report/`, `test-results/`;
    these were untracked with `git rm --cached` (local files kept).
  - `/v1/me` `console.log` removed. See CHANGES C-01, C-03, C-05.
- **Not done (PENDING):** pass the three variables from GitHub Actions secrets in `.github/workflows/playwright.yml`
  (it has no `env:` today, so CI would fail every credential test); add `.env.example`; commit/push (separate approval).
- **Verification:**
  - Grep of specs and config for credential literals: 0 matches.
  - `git check-ignore -v` on `.env`, `node_modules`, `playwright-report`, `test-results`: all ignored; 0 tracked.
  - Presence check of the three variables in the Claude Code process (18:26): all set (values not read).
  - Full suite with personal credentials: `npx --no-install playwright test --retries=0` (18:45) → 21/21 passed.
  - GitHub Actions secrets: **not verified / not configured**.
- **Remaining risk:** original credentials remain readable in `b4f92c9`, upstream and every fork/clone. The
  originally committed `test-results/` (removed from tracking) may contain credentials too (see ED-02).
  Recommendation: the organiser rotates the password and revokes/reissues the key.
- **AI involvement:** Claude found the issue, proposed A and implemented it; the QA Lead reviewed and approved.
- **Judge summary:** The original project had its login and API key in the test code and in a committed `.env`
  in a public repository. Tests now read credentials from environment variables, and `.env` and test artifacts
  are no longer tracked. Old commits still contain the values, so rotation is the real fix, and we recommended it.

---

## ED-02 — Sensitive data in Playwright failure artifacts
- **Time / status:** found 18:30 / proposed; no code or CI change made.
- **Problem and evidence:** when a UI test fails after the login form is filled, Playwright's
  `error-context.md` page snapshot (accessibility tree) records the typed email and the password field value in
  plain text. Seen in `baseline-evidence\20261104-182723-p1b-start\test-results\ui-ui-3-terms-checkbox-ui\error-context.md`.
  The same data is reachable through `trace.zip` and the HTML report built from that run
  (`trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'` in `playwright.config.ts`).
- **Impact:** a failed CI run uploads `playwright-report/` as an artifact (`.github/workflows/playwright.yml`,
  `if: !cancelled()`); publishing such a report to GitHub Pages would expose the account.
- **Options (not yet decided):**
  | Option | Pros | Cons |
  |---|---|---|
  | A: Publish only reports of fully green runs; do not upload or publish failure artifacts publicly; never commit evidence folders | No code change; keeps traces for local debugging | Relies on process discipline |
  | B: A + stop traces/snapshots from capturing the login step (e.g. log in via API/storage state) | Removes the leak at the source | Larger change to shared login code; needs time and approval |
- **Recommendation (Claude):** A now (fits the time left), B as a follow-up.
- **Decision:** PENDING (QA Lead).
- **Current mitigation:** evidence folders are outside the repo (`C:\ITAC-Workspace\baseline-evidence\`) and are not committed.
  `playwright-report/` and `test-results/` are git-ignored (C-03). Rule: check reports/traces for secrets before any publication.
- **Judge summary:** Playwright's failure snapshots can contain what was typed into the login form. We keep those
  artifacts local and only publish reports from green runs.

---

## ED-03 — Playwright projects with baseURL
- **Time / status:** 18:25 / verified.
- **Problem:** absolute product URLs repeated in every test; no way to point the suite at another environment.
- **Decision:** two projects in `playwright.config.ts`: `api` (`api.spec.ts`, `baseURL` = `STONEWAKE_API_URL` or
  `https://api.stonewake.ai`) and `ui` (`ui.spec.ts`, `baseURL` = `STONEWAKE_APP_URL` or `https://app.stonewake.ai`).
  Tests use relative paths. Requested by the QA Lead (P1-a item 3); structure chosen by Claude.
- **Trade-off:** `testMatch` by file name means a new spec file must be added to a project.
- **Unchanged config (deliberately):** `timeout: 30000`, `workers: 2`, `retries` not set (0), reporters list + html.
- **Verification:** 21/21 at 18:45.

---

## ED-04 — API expectations follow the published OpenAPI contract
- **Time / status:** 18:29 / verified.
- **Problem:** 4 API tests failed (api 2, 5, 9, 10). Each could be read as either a product or a test defect.
- **Evidence:** public spec `https://api.stonewake.ai/openapi.json` (Stonewake API 1.0.0, read 18:29): bearer auth only;
  portfolio page fields `items, limit, offset, total`; `/v1/search` `limit.maximum: 25`. Read-only live probes
  (`GET` only, key never printed) matched the spec in every case. Germany's ISO 3166-1 alpha-2 code is `DE`.
- **Decision (Claude, within P1-b scope):** the spec is the source of truth; when product and spec agree, the test
  is wrong and is corrected (C-07…C-10). Exact assertions are kept (e.g. the full validation message), so nothing is weakened.
- **Alternative rejected:** loosening assertions (e.g. "any 4xx", "any limit message") — hides real regressions.
- **Risk:** spec says `completeness` may be `null` (not yet assessed); api 5 asserts `>= 0` for each item. Today
  0 items are not assessed, so it passed, but it would fail when one appears although the API follows its spec.
  Fixed in C-19 (QA Lead approved, 19:45): `null` is accepted, any other value must still be a number in 0..1.
- **Verification:** `npx --no-install playwright test --project=api --retries=0` → 10/10 (18:30).

---

## ED-05 — User-facing locators and no fixed waits
- **Time / status:** 18:31 / verified for the fixed lines.
- **Problem:** ui 1, 3, 7, 10 failed on brittle or wrong selectors (`#email`, hidden native checkbox, `/deal/`,
  `tile-not-assessed`); ui 1 and ui 7 used `waitForTimeout(2000/3000)` and a non-web-first `page.url()` check.
- **Evidence:** Playwright `error-context.md` snapshots of the failures and a read-only DOM probe.
- **Decision (Claude, within P1-b scope):** fix only the failing lines, using `getByLabel` / `getByRole` where the
  element has an accessible name, and web-first `expect(page).toHaveURL(...)`; remove fixed sleeps on those lines.
  No broad refactor (page objects, login fixture) during stabilisation.
- **Not done (known):** `ui 8` still has `waitForTimeout(1000)` (ui.spec.ts, countries search) and many tests still use
  XPath/CSS and repeat the login steps. Candidates for a later refactor (login fixture, page objects).
- **Verification:** targeted run 4/4 (18:31), full 21/21 (18:45).

---

## ED-06 — UI 6 / EDD Dossiers sidebar link and new UI 11
- **Time / status:** 18:44 implemented; **19:00 under review** (new documentary evidence).
- **Problem and evidence:** ui 6 timed out clicking a sidebar link "EDD Dossier". Claude in Chrome (read-only, team itac-2):
  sidebar shows Deal Book, Tenders, Countries, Institutions, Network, Monitoring, Portfolio, Screenings, Scoring.
  `/dossiers` loads by URL (title "EDD Dossiers · Stonewake", h1, enabled "New dossier" button). A company page
  links to it ("Start EDD dossier" → `/dossiers?node=n106084`). The in-app guide `/guide` documents the feature
  and its two in-page entry points but does not mention the sidebar.
- **QA Lead's rule (prompt P005, 18:42):** if the sidebar link is not a documented requirement, drop it from ui 6,
  cover the page in a separate test, record as unconfirmed navigation issue, preserve the original expectation.
- **Implementation (C-15, C-16):** 3 EDD lines removed from ui 6 (original kept verbatim in CHANGES.md); new
  ui 11 asserts title, heading and "New dossier" button without clicking it. Recorded as DEF-U-01.
- **New evidence (19:00):** public product docs `https://docs.stonewake.ai/dossiers` ("Where to find it"):
  "EDD Dossiers in the sidebar opens the workbench for every team whose workspace holds the dossiers module."
  The rule's premise ("not documented") is therefore **not met**, unless this workspace lacks the module — which the
  working page suggests it does not. Screenshot: local, not committed.
- **Options (for the QA Lead):**
  | Option | Pros | Cons |
  |---|---|---|
  | A: Treat as suspected product defect: file in SpiraTest; restore the sidebar assertion as its own test marked `test.fail()` with the incident ID; keep ui 6 (other links) and ui 11 | Matches the docs; failure stays visible in the report; suite stays deterministic for the 5 runs | `test.fail` needs explicit approval; must be removed when fixed |
  | B: Restore the original ui 6 unchanged | Most faithful to the original | ui 6 fails every run → no 5 green runs |
  | C: Keep C-15 as is, ask Stonewake staff whether the module/sidebar applies to this workspace | No code change | Test silently stops checking documented navigation until answered |
- **Recommendation (Claude):** A, and ask Stonewake staff in parallel (product questions go through the judges).
- **Module check (19:12):** the workspace settings the app loads (`GET /workspace`) list `dossiers` among the enabled
  modules, with no override; our user is Administrator. So the docs apply to us and the missing link is a product defect.
- **Decision (QA Lead, 19:20–19:29):** file it in SpiraTest → [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx).
  Restore the sidebar check as a separate test and **skip** it with the incident ID. The QA Lead's reason: the organisers
  allow skipping a test for a confirmed product bug. Claude had recommended `test.fail()` instead, so the check keeps
  running; the QA Lead chose skip.
- **Implementation:** C-17 — `ui 6b sidebar edd dossiers link` with `test.skip` + `issue` annotation (IN:86); ui 6 and ui 11 unchanged apart from comments.
- **Trade-off:** a skipped test does not run, so we will not notice automatically when IN:86 is fixed; the skip must be
  removed by hand. The report shows it as skipped, never as passed.
- **Verification:** `npx --no-install playwright test --retries=0` (19:31) → 21 passed, 1 skipped, 0 failed.

---

## ED-07 — Test stability strategy
- **Status:** in progress.
- **Rules applied (from the QA Lead's prompts and project rules):** retries 0 for every evidence run; each failure
  root-caused and classified (product / automation / environment / unconfirmed) before fixing; no skips, no
  disabled tests, no weakened assertions, no timeout or retry increases; every run's console + JSON (+ HTML report
  for baseline runs) saved under `C:\ITAC-Workspace\baseline-evidence\<timestamp>\`.
- **Result so far:** 11/20 → 19/20 → 21/21 (18:27 → 18:45). 1 green full run; the 5-consecutive-run series has
  **not** started (code still changing; ED-06 pending).
- **Remaining risks:** live product data (deal list, portfolio contents, search hits) can change during the day;
  tests share one personal account; the run at 18:45 is a single observation, not proof of stability.

---

## ED-08 — CI and reporting
- **Status (19:40):** workflow rewritten locally (CHANGES C-18), not pushed; repository secrets and GitHub Pages not set up yet.
- **What the new workflow does:** runs on push to `master` and on manual dispatch; reads the three credentials from
  repository secrets; Chromium only; `--retries=0`; writes `build-info.json` (commit, run URL, outcome) into the report;
  uploads and publishes the HTML report to GitHub Pages **only when every test passed**, and only the console log when
  a run fails (ED-02). Queued runs are not cancelled, so each run counts as evidence. The `pull_request` trigger was
  dropped: runs from pull requests would not get the secrets.
- **Before the change:**
- **Facts:** `.github/workflows/playwright.yml` (unchanged from upstream) runs on push/PR/dispatch, Node 22,
  chromium, `npx playwright test`, uploads `playwright-report/` as artifact. It has no `env:` for the three
  credentials and no GitHub Pages publication. Local runs use Node v24.11.0 and Playwright 1.64.1.
- **Needed for submission:** repository secrets + `env:` in the workflow (ED-01), report publication on Pages
  (preparation-email.md requires a public report link), five consecutive CI runs. Each needs QA Lead approval
  (commit/push/publication).
