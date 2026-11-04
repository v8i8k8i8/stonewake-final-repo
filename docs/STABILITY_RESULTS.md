# Stability Results

Requirement (preparation-email.md): show the project is really stable, including **5 green runs in a row**.
Rules: full suite, retries = 0, five separate runs (no `--repeat-each`), same commit, no skips added to get green.
Any failure resets the count.
One skip exists: `ui 6b sidebar edd dossiers link`, skipped for confirmed product defect
[IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) by QA Lead decision (organisers allow this for confirmed
product bugs). It is reported as skipped in every run below, never counted as passed. No other skips. Everything below comes from command output saved under
`C:\ITAC-Workspace\baseline-evidence\` (local, not committed — see ED-02) or is marked PENDING.

Final commit: **PENDING** (all changes uncommitted at 19:05) · Branch: `master` (fork `v8i8k8i8/stonewake-final-repo`) ·
Playwright 1.64.1 · Node v24.11.0 (local) / 22 (CI workflow) · Browser: Chromium (headless)

## 1. Baseline (project as received)
The original code contained the organiser's credentials. The QA Lead decided not to use them (prompt 18:09), so the
first run was limited to the 4 tests that need no credentials. The first full run used the QA Lead's own credentials
after the credential change (C-01) and the base URL change (C-02), with no fixes to test logic other than C-04…C-06.

| Run | Time | Scope | Passed | Failed | Flaky | Skipped | Duration | Evidence |
|---|---|---|---|---|---|---|---|---|
| B1 | 18:12 | 4 credential-free tests, original code | 3 | 1 (api 1) | 0 | 0 | 6.8 s | `20261104-181209\` (console.log, results.json, HTML report) |
| B2 | 18:27 | Full suite, 20 tests (after C-01…C-06) | 11 | 9 | 0 | 0 | 2.2 min | `20261104-182723-p1b-start\` (console.log, results.json, HTML report, traces) |

Failing tests in B2 (each failed once; no reruns, so flakiness was not measured):
api 2, api 5, api 9, api 10, ui 1, ui 3, ui 6, ui 7, ui 10 → root causes in [DEFECTS.md](DEFECTS.md).
Note: 4 UI failures were 30 s timeouts (ui 1, 3, 6), which made the suite slow (2.2 min vs 39 s when green).

## 2. Five consecutive local runs (final commit)
Command (planned): `powershell -ExecutionPolicy Bypass -File C:\ITAC-Prep\competition-kit\scripts\run-five-times.ps1 -ProjectPath C:\ITAC-Workspace\stonewake-final-repo -EvidenceRoot C:\ITAC-Workspace\five-run-evidence`
Script result: **PENDING — not started.** Blocked by: ED-06 decision (ui 6) and the final commit.

| Run | Result | Passed | Failed | Flaky | Skipped | Start | Duration (s) |
|---|---|---|---|---|---|---|---|
| 1 | PENDING | | | | | | |
| 2 | PENDING | | | | | | |
| 3 | PENDING | | | | | | |
| 4 | PENDING | | | | | | |
| 5 | PENDING | | | | | | |

## 3. Five consecutive GitHub Actions runs (final commit)
Script result: **PENDING — not started.** Blocked by: workflow has no credential `env:` (ED-01/ED-08), nothing pushed yet.

| Run | Run link | Event | Attempt | Conclusion | Head SHA |
|---|---|---|---|---|---|
| 1–5 | PENDING | | | | |

Published report: **PENDING** (no Pages publication configured).

## 4. Earlier attempts (count resets — kept for honesty)
| Time | Where | Result | Failed test / reason | Action |
|---|---|---|---|---|
| 18:27 | Local | 11/20 | 9 failures, see §1 | C-07…C-14 |
| 18:32 | Local | 19/20 | ui 6 — sidebar "EDD Dossier" link not present | Investigation → C-15, C-16 (under review, ED-06) |
| 18:45 | Local | 21/21 | — | 1 green run; code may still change, so it does not start the five-run count |

## 5. Execution log
| # | Time | Where | Command | Passed / failed / skipped | Evidence |
|---|---|---|---|---|---|
| 1 | 18:12 | Local | Original code, 4 credential-free tests, `--retries=0` (exact command: MISSING — not in the saved console log) | 3 / 1 / 0 | `baseline-evidence\20261104-181209\` |
| 2 | 18:25 | Local | `npx --no-install playwright test -g "api 1 health\|api 3 no token\|api 4 bad keys\|ui 4 not logged in redirect" --retries=0` | 4 / 0 / 0 | console only (recorded in CHANGES C-02) |
| 3 | 18:27 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json,html` | 11 / 9 / 0 | `baseline-evidence\20261104-182723-p1b-start\` |
| 4 | 18:30 | Local | `npx --no-install playwright test --project=api --retries=0 --reporter=list` | 10 / 0 / 0 | console only (session transcript) |
| 5 | 18:31 | Local | `npx --no-install playwright test --project=ui -g "ui 1 login ok\|ui 3 terms\|ui 7 deal\|ui 10 portfolio" --retries=0 --reporter=list` | 4 / 0 / 0 | console only (session transcript) |
| 6 | 18:32 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json` | 19 / 1 / 0 | `baseline-evidence\20261104-183243-p1b-after-fixes\` |
| 7 | 18:45 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json` | 21 / 0 / 0 | `baseline-evidence\20261104-184555-p1b-ui6\` |
| 8 | 19:31 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json` | 21 / 0 / 1 (ui 6b, IN:86) | `baseline-evidence\20261104-193133-in86-skip\` |
