# Engineering Decisions

This file explains the bigger decisions: changes to shared code, config, CI, test strategy, or a root cause that
affected several tests. Small fixes are rows in [CHANGES.md](CHANGES.md).

Who decided what: Claude Code proposed options and wrote the code. I made the decisions. Where I simply accepted
Claude's suggestion, it says "I approved Claude's recommendation". Choices Claude made on its own, inside the scope
I gave it, are marked as Claude's.

## Summary
| ID | Time | Decision | Status | Decided by | Verification |
|---|---|---|---|---|---|
| ED-01 | 18:25 | Move credentials out of the code and Git index into env variables; keep history; recommend rotation | implemented (commit `188139e`) — rotation by the owner still pending | I approved Claude's recommendation | Local and CI: 5/5 runs with credentials from env / GitHub secrets |
| ED-02 | 18:30 | Failure artifacts contain typed credentials; do not commit or publish them | option A implemented (C-18) | Me, as part of the CI plan (19:45) | Published report checked: no credential values |
| ED-03 | 18:25 | Two Playwright projects (`api`, `ui`) with `baseURL` and env overrides | verified | Me (P1-a prompt, item 3); structure by Claude | 21/21 (18:45) |
| ED-04 | 18:29 | API tests follow the published OpenAPI contract, not the old test code | verified | Claude, within my P1-b scope | api project 10/10 (18:30) |
| ED-05 | 18:31 | User-facing locators and auto-waiting on the lines being fixed; no fixed sleeps there | verified | Claude, within my P1-b scope | 4/4 targeted, 21/21 full (18:45) |
| ED-06 | 18:44 / 19:31 | Missing EDD Dossiers sidebar link is product defect IN:86; its check is a separate skipped test (ui 6b); the page is covered by ui 11 | implemented | Me | 21 passed, 1 skipped (19:31) |
| ED-07 | 18:26 | Stability rules: retries 0, every failure root-caused, nothing hidden, evidence for every run | verified | Me (prompts) | 5/5 CI and 5/5 local on `188139e` (21 passed, 1 skipped each) |
| ED-08 | 19:40 | CI and reporting: new workflow with secrets, retries 0, Pages for green runs | verified | Claude, within my scope; I approved the CI plan | 5/5 CI runs green; report public on GitHub Pages |

---

## ED-01 — Hardcoded credentials and API key exposed in public Git history
**Status:** implemented in commit `188139e`; GitHub Actions secrets and rotation still pending.

**The problem.** The original commit `b4f92c9` had the account email, password and API key written directly in
`tests/api.spec.ts` and `tests/ui.spec.ts` (confirmed with `git diff`; I do not repeat the values here). The same
commit also tracked a `.env` file and the `playwright-report/` and `test-results/` folders. On top of that, api 2
printed the `/v1/me` response with `console.log`, which put key details into the CI log. The repository is public,
so anyone could use the account and the key, and every fork shared the same account.

**Why it happened.** The secrets were written into the code, and `.gitignore` did not exclude `.env` or test artifacts.

**Options.**
| Option | Pros | Cons |
|---|---|---|
| A: env variables + `.gitignore` + untrack the files; keep history (recommended) | Fast, safe, standard | The old values stay in history, so they still need to be changed |
| B: A + rewrite history and force-push | Cleans our fork's history | Destructive, and the original repo, other forks and clones still have the values |

**What I decided.** Option A — I approved Claude's recommendation. Once a secret is public, only changing it really
protects it. I also decided to use my own credentials instead of the committed organiser ones (prompt P1-a, 18:15).

**What changed.**
- `tests/support/credentials.ts` reads `STONEWAKE_EMAIL`, `STONEWAKE_PASSWORD` and `STONEWAKE_API_KEY` and stops with a clear error if one is missing.
- `.gitignore` now covers `.env`, `.env.*` (except `.env.example`), `node_modules/`, `playwright-report/` and `test-results/`.
  These were untracked with `git rm --cached` (local files kept).
- The `console.log` in api 2 was removed. See CHANGES C-01, C-03, C-05.

**Still to do.** Add `.env.example` (optional). The three GitHub Actions secrets were added at 19:38–19:39 and are used by the workflow (C-18).

**How it was verified.**
- Grep of specs and config for credential values: 0 matches.
- `git check-ignore -v` on `.env`, `node_modules`, `playwright-report`, `test-results`: all ignored; 0 tracked.
- Presence check of the three variables in the Claude Code process (18:26): all set (values not read).
- Full suite with my own credentials: `npx --no-install playwright test --retries=0` (18:45) → 21/21 passed.
- GitHub Actions secrets: configured (names checked with `gh secret list`); five CI runs logged in and called the API successfully.

**Remaining risk.** The original credentials can still be read in `b4f92c9`, in the original repo and in every
fork or clone. The originally committed `test-results/` may contain them too (see ED-02). My recommendation: the
organiser changes the password and replaces the API key.

**AI involvement.** Claude found the issue, proposed option A and implemented it. I reviewed and approved it.

**Summary for judges.** The original project had its login and API key in the test code and in a committed `.env`
file in a public repository. The tests now read credentials from environment variables, and `.env` and test
artifacts are no longer tracked. Old commits still contain the values, so changing them is the real fix, and I
recommended that to the owner.

---

## ED-02 — Sensitive data in Playwright failure artifacts
**Status:** found 18:30 / option A implemented in the CI workflow (C-18), verified 20:01.

**The problem.** When a UI test fails after the login form is filled, Playwright's page snapshot
(`error-context.md`) shows the typed email and password in plain text. We saw it in
`baseline-evidence\20261104-182723-p1b-start\test-results\ui-ui-3-terms-checkbox-ui\error-context.md`.
The same data is in `trace.zip` and in the HTML report of that run, because the config keeps traces and
screenshots on failure. If the report of a failed CI run were published, the account would be exposed.

**Options.**
| Option | Pros | Cons |
|---|---|---|
| A: Publish only reports of fully green runs; never upload or publish failure artifacts publicly; never commit evidence folders | No code change; traces still help local debugging | Depends on discipline |
| B: A + keep the login step out of traces/snapshots (for example, log in through the API or a saved session) | Removes the leak at the source | Bigger change to shared login code; needs time and approval |

**Claude's recommendation.** A now, because of the time left, and B later.

**Decision:** option A, approved as part of the CI plan (19:45). Option B is not done.

**What protects us today.** Evidence folders are outside the repo (`C:\ITAC-Workspace\baseline-evidence\`) and are not
committed. `playwright-report/` and `test-results/` are git-ignored (C-03). The CI workflow (C-18) uploads and
publishes the report only when every test passed; a failed run uploads only the console log. All five CI runs passed
and published; the public report was checked at 20:01 and contains none of the credential values.

**Summary for judges.** Playwright's failure snapshots can contain what was typed into the login form. We keep those
files local and only publish reports from green runs.

---

## ED-03 — Playwright projects with baseURL
**Status:** verified.

**The problem.** Every test repeated the full product URL, and there was no way to run the suite against another environment.

**What changed.** `playwright.config.ts` now has two projects: `api` (`api.spec.ts`, `baseURL` = `STONEWAKE_API_URL`
or `https://api.stonewake.ai`) and `ui` (`ui.spec.ts`, `baseURL` = `STONEWAKE_APP_URL` or `https://app.stonewake.ai`).
Tests use relative paths. I asked for this in P1-a (item 3); Claude chose the structure.

**Trade-off.** Projects pick tests by file name, so a new spec file must be added to a project.

**Left unchanged on purpose:** `timeout: 30000`, `workers: 2`, `retries` not set (0), reporters list + html.

**Verification:** 21/21 at 18:45.

---

## ED-04 — API tests follow the published OpenAPI contract
**Status:** verified.

**The problem.** Four API tests failed (api 2, 5, 9, 10). Each one could be a product bug or a test bug.

**How we decided.** Claude read the public spec `https://api.stonewake.ai/openapi.json` (Stonewake API 1.0.0, 18:29)
and made read-only live calls (`GET` only, key never printed). The spec says: Bearer auth only; portfolio pages have
`items, limit, offset, total`; `/v1/search` has `limit.maximum: 25`. The live API matched the spec every time.
Germany's ISO code is `DE`. So in all four cases the app and the spec agreed, and the test was wrong.

**Decision (Claude, within my P1-b scope).** The spec is the source of truth. When the product and the spec agree,
the test is corrected (C-07…C-10). The checks stay exact (for example, the full error message), so nothing is weakened.

**Rejected alternative.** Loosening the checks (for example "any 4xx" or "any limit message"). That would hide real regressions.

**Follow-up.** The spec says `completeness` can be `null` (not yet assessed), but api 5 required a number for every
item. It passed only because no item was unassessed. Fixed in C-19 (I approved it at 19:45): `null` is accepted,
and any other value must still be a number from 0 to 1.

**Verification:** `npx --no-install playwright test --project=api --retries=0` → 10/10 (18:30).

---

## ED-05 — User-facing locators and no fixed waits
**Status:** verified for the fixed lines.

**The problem.** ui 1, 3, 7 and 10 failed because of wrong or brittle selectors (`#email`, the hidden native
checkbox, `/deal/`, `tile-not-assessed`). ui 1 and ui 7 also used fixed waits (`waitForTimeout(2000/3000)`) and
checked `page.url()` once instead of waiting for it.

**How we found it.** Playwright's failure snapshots (`error-context.md`) and a read-only DOM check.

**Decision (Claude, within my P1-b scope).** Fix only the failing lines. Use `getByLabel` / `getByRole` where the
element has a visible name, and `expect(page).toHaveURL(...)`, which waits on its own. Remove the fixed waits on
those lines. No big refactor (page objects, login fixture) while stabilising.

**Not done yet.** `ui 8` still has `waitForTimeout(1000)` (countries search). Many tests still use XPath/CSS and
repeat the login steps. Good candidates for a later refactor.

**Verification:** targeted run 4/4 (18:31), full 21/21 (18:45).

---

## ED-06 — UI 6 / EDD Dossiers sidebar link and new UI 11
**Status:** implemented (C-15 and C-16 at 18:44, replaced by C-17 at 19:31).

**What happened.** The original ui 6 failed because it could not find the "EDD Dossier" link in the sidebar. The
sidebar showed Deal Book, Tenders, Countries, Institutions, Network, Monitoring, Portfolio, Screenings and Scoring.
The Dossiers page itself opened directly at `/dossiers` (title "EDD Dossiers · Stonewake", heading, enabled
"New dossier" button), and a company page linked to it ("Start EDD dossier" → `/dossiers?node=n106084`).
So at first we thought the test might just be outdated.

**First step (18:42–18:46).** I gave Claude a rule (prompt P10): if the sidebar link is not a documented requirement,
remove it from ui 6, cover the page in a separate test, and record it as an unconfirmed issue. Claude checked the
in-app guide (`/guide`), which describes the feature but not the sidebar. So Claude removed the 3 EDD lines from
ui 6 (the original is kept verbatim in CHANGES C-15), added ui 11 for the page, and recorded DEF-U-01.

**What changed our view (19:00–19:12).** The public docs (https://docs.stonewake.ai/dossiers, "Where to find it") say:
"EDD Dossiers in the sidebar opens the workbench for every team whose workspace holds the dossiers module."
The workspace settings the app loads (`GET /workspace`) list `dossiers` as an enabled module, with no override, and my
user is an Administrator. So the module was enabled and the link should have been visible.

**Options Claude listed (19:00).**
| Option | Pros | Cons |
|---|---|---|
| A: File the bug; bring the sidebar check back as its own test marked `test.fail()` with the incident ID; keep ui 6 (other links) and ui 11 | Matches the docs; the failure stays visible; the suite stays predictable for the 5 runs | Must be removed by hand when fixed |
| B: Restore the original ui 6 unchanged | Closest to the original | ui 6 fails every run, so no 5 green runs |
| C: Keep C-15 as it is and ask Stonewake staff | No code change | The suite silently stops checking documented navigation until they answer |

Claude recommended option A, so that the check keeps running.

**What I decided (19:20–19:29).** This is a product bug, not a problem with the test. I decided to report it in
SpiraTest as [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) and keep a separate test for the missing link.
Instead of `test.fail()`, I chose to mark that test as skipped and document the reason, because the organisers allow
skipping tests affected by confirmed product bugs. The other tests continue to run normally.

**What changed (C-17).** New test `ui 6b sidebar edd dossiers link` with `test.skip` and an `issue` annotation
pointing to IN:86. ui 6 and ui 11 only got updated comments.

**Trade-off.** A skipped test does not run, so it will not tell us when IN:86 is fixed; the skip must be removed by
hand. The report always shows it as skipped, never as passed.

**Verification:** `npx --no-install playwright test --retries=0` (19:31) → 21 passed, 1 skipped, 0 failed.

---

## ED-07 — Test stability strategy
**Status:** verified.

**Rules (from my prompts and the project rules).** Retries are 0 for every evidence run. Every failure is
root-caused and classified (product / automation / environment / unconfirmed) before it is fixed. No hidden
failures, no weakened assertions, no longer timeouts or extra retries. The only skip is ui 6b, for the confirmed
product bug IN:86 (ED-06). Every run's console output and JSON (and the HTML report for baseline runs) is saved
under `C:\ITAC-Workspace\baseline-evidence\<timestamp>\`.

**Result so far.** 11/20 → 19/20 → 21/21 (18:27 → 18:45), then 21 passed + 1 skipped (19:31). On commit `188139e`:
five consecutive GitHub Actions runs (19:52–19:59) and five consecutive local runs (20:01–20:05), each 21 passed,
0 failed, 1 skipped (ui 6b, IN:86). Details: [STABILITY_RESULTS.md](STABILITY_RESULTS.md).

**Remaining risks.** Live product data (deal list, portfolio, search results) can change over time. All tests
share my one account. Ten green runs in one evening is good evidence, not a guarantee.

---

## ED-08 — CI and reporting
**Status:** verified. Workflow rewritten (CHANGES C-18) in commit `188139e`; repository secrets added 19:38–19:39;
GitHub Pages enabled 19:45 (source: GitHub Actions); five green runs 19:52–19:59; report public at
https://v8i8k8i8.github.io/stonewake-final-repo/.

**Before.** `.github/workflows/playwright.yml` (as received) ran on push, pull request and manual dispatch, with
Node 22, Chromium and `npx playwright test`, and uploaded `playwright-report/` as an artifact. It had no credentials
and did not publish the report. Local runs use Node v24.11.0 and Playwright 1.64.1.

**What the new workflow does.** It runs on push to `master` and on manual dispatch. It reads the three credentials
from repository secrets, runs Chromium only with `--retries=0`, and writes `build-info.json` (commit, run URL,
outcome) into the report. The HTML report is uploaded and published to GitHub Pages **only when every test passed**;
for a failed run, only the console log is kept (ED-02). Queued runs are not cancelled, so each run counts as
evidence. The `pull_request` trigger was removed, because runs from pull requests do not get the secrets.

**Result.** All three are done: repository secrets, report publication on Pages (preparation-email.md requires a
public report link) and five consecutive CI runs. Each push and publication was approved by me first.
One setup detail: `gh` in this clone first pointed at the original (upstream) repository, so the five-run script was
stopped before it started any run there, and `gh repo set-default` was pointed at the fork.
