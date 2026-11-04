# Stability Results

The preparation email asks us to show that the project is really stable, including **5 green runs in a row**.

My rules for counting: full suite, retries = 0, five separate runs (no `--repeat-each`), same commit, and no skips
added just to get green. Any failure resets the count to zero.

There is one skip: `ui 6b sidebar edd dossiers link`. I skipped it because of the confirmed product defect
[IN:86](https://itac.spiraservice.net/48/Incident/86.aspx); the organisers allow this for confirmed product bugs.
It is reported as skipped in every run below and never counted as passed. There are no other skips.

Everything below comes from command output saved under `C:\ITAC-Workspace\baseline-evidence\` (local, not committed
— see ED-02) or is marked PENDING.

Final code commit: `188139ead2aa9d868fb82f8ac2eca7c45367dfe7` (later commits, if any, change docs only) · Branch: `master` (fork `v8i8k8i8/stonewake-final-repo`) ·
Playwright 1.64.1 · Node v24.11.0 (local) / 22 (CI workflow) · Browser: Chromium (headless)

## 1. Baseline (project as received)
The original code contained the organiser's credentials. I decided not to use them (prompt 18:09), so the first run
covered only the 4 tests that need no credentials. The first full run used my own credentials, after the credential
change (C-01) and the base URL change (C-02). The only other changes at that point were C-04…C-06.

| Run | Time | Scope | Passed | Failed | Flaky | Skipped | Duration | Evidence |
|---|---|---|---|---|---|---|---|---|
| B1 | 18:12 | 4 tests without credentials, original code | 3 | 1 (api 1) | 0 | 0 | 6.8 s | `20261104-181209\` (console.log, results.json, HTML report) |
| B2 | 18:27 | Full suite, 20 tests (after C-01…C-06) | 11 | 9 | 0 | 0 | 2.2 min | `20261104-182723-p1b-start\` (console.log, results.json, HTML report, traces) |

Failing tests in B2 (each ran once, so flakiness was not measured):
api 2, api 5, api 9, api 10, ui 1, ui 3, ui 6, ui 7, ui 10. Why each one failed: [DEFECTS.md](DEFECTS.md).
Several UI failures were 30 s timeouts (for example ui 1, 3, 6), which is why the run took 2.2 min instead of 39 s when green.

## 2. Five consecutive local runs (final commit)
Planned command: `powershell -ExecutionPolicy Bypass -File C:\ITAC-Prep\competition-kit\scripts\run-five-times.ps1 -ProjectPath C:\ITAC-Workspace\stonewake-final-repo -EvidenceRoot C:\ITAC-Workspace\five-run-evidence`
Script result: **PASS-UNCOMMITTED (5/5 passed)**. All five runs passed; the script adds "UNCOMMITTED" (exit code 1)
because the working tree had uncommitted **documentation** edits at the time. I checked that tests, config, workflow
and package files were identical to `188139e` (`git diff --name-only 188139e -- tests playwright.config.ts .github package.json package-lock.json` → empty).
Evidence: `C:\ITAC-Workspace\five-run-evidence\20261104-200140\summary.md` (local; per-run console, JSON and HTML report).

| Run | Result | Passed | Failed | Flaky | Skipped | Start | Duration (s) |
|---|---|---|---|---|---|---|---|
| 1 | PASS | 21 | 0 | 0 | 1 | 20:01:40 | 47.5 |
| 2 | PASS | 21 | 0 | 0 | 1 | 20:02:28 | 39.3 |
| 3 | PASS | 21 | 0 | 0 | 1 | 20:03:07 | 41.3 |
| 4 | PASS | 21 | 0 | 0 | 1 | 20:03:49 | 39.3 |
| 5 | PASS | 21 | 0 | 0 | 1 | 20:04:28 | 39.3 |

## 3. Five consecutive GitHub Actions runs (final commit)
Command: `C:\ITAC-Prep\competition-kit\scripts\ci-five-runs.ps1 -Workflow playwright.yml -Branch master`
Result: **PASS (5/5)** — five runs one after another on the same commit, each attempt 1, `npx playwright test --retries=0`.
Summary file: `C:\ITAC-Workspace\ci-five-run-evidence\ci-five-runs-20261104-195949.md` (local).
Test counts below are taken from each run's log, not only from the run status.

| Run | Run link | Event | Attempt | Conclusion | Head SHA | Tests |
|---|---|---|---|---|---|---|
| 1 | https://github.com/v8i8k8i8/stonewake-final-repo/actions/runs/41880150646 | push | 1 | success | `188139e` | 21 passed, 1 skipped, 0 failed (52.5 s) |
| 2 | https://github.com/v8i8k8i8/stonewake-final-repo/actions/runs/41881283391 | workflow_dispatch | 1 | success | `188139e` | 21 passed, 1 skipped, 0 failed (46.9 s) |
| 3 | https://github.com/v8i8k8i8/stonewake-final-repo/actions/runs/41881587354 | workflow_dispatch | 1 | success | `188139e` | 21 passed, 1 skipped, 0 failed (52.0 s) |
| 4 | https://github.com/v8i8k8i8/stonewake-final-repo/actions/runs/41881923464 | workflow_dispatch | 1 | success | `188139e` | 21 passed, 1 skipped, 0 failed (44.4 s) |
| 5 | https://github.com/v8i8k8i8/stonewake-final-repo/actions/runs/41882225126 | workflow_dispatch | 1 | success | `188139e` | 21 passed, 1 skipped, 0 failed (48.5 s) |

The skipped test in every run is `ui 6b sidebar edd dossiers link` (IN:86). It did not run and is not counted as passed.

Published report: https://v8i8k8i8.github.io/stonewake-final-repo/ — opens without login (HTTP 200, checked 20:01).
Its `build-info.json` shows commit `188139e`, run `41882225126` (run 5), attempt 1, outcome `success`.
No credential values found in the published report (checked by value match, values not printed).

## 4. Earlier attempts (they reset the count — kept for honesty)
| Time | Where | Result | Failed test / reason | What I did next |
|---|---|---|---|---|
| 18:27 | Local | 11/20 | 9 failures, see §1 | Fixes C-07…C-14 |
| 18:32 | Local | 19/20 | ui 6 — sidebar "EDD Dossier" link not present | Investigation → C-15, C-16; later confirmed as IN:86 → C-17 (ED-06) |
| 18:45 | Local | 21/21 | — | 1 green run, but the code was still changing, so it does not start the five-run count |
| 19:31 | Local | 21 passed, 1 skipped | — (ui 6b skipped, IN:86) | Code still changing (C-18, C-19), so it does not start the count |

## 5. Execution log
| # | Time | Where | Command | Passed / failed / skipped | Evidence |
|---|---|---|---|---|---|
| 1 | 18:12 | Local | Original code, 4 tests without credentials, `--retries=0` (exact command: MISSING — not in the saved console log) | 3 / 1 / 0 | `baseline-evidence\20261104-181209\` |
| 2 | 18:25 | Local | `npx --no-install playwright test -g "api 1 health\|api 3 no token\|api 4 bad keys\|ui 4 not logged in redirect" --retries=0` | 4 / 0 / 0 | console only (recorded in CHANGES C-02) |
| 3 | 18:27 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json,html` | 11 / 9 / 0 | `baseline-evidence\20261104-182723-p1b-start\` |
| 4 | 18:30 | Local | `npx --no-install playwright test --project=api --retries=0 --reporter=list` | 10 / 0 / 0 | console only (session transcript) |
| 5 | 18:31 | Local | `npx --no-install playwright test --project=ui -g "ui 1 login ok\|ui 3 terms\|ui 7 deal\|ui 10 portfolio" --retries=0 --reporter=list` | 4 / 0 / 0 | console only (session transcript) |
| 6 | 18:32 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json` | 19 / 1 / 0 | `baseline-evidence\20261104-183243-p1b-after-fixes\` |
| 7 | 18:45 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json` | 21 / 0 / 0 | `baseline-evidence\20261104-184555-p1b-ui6\` |
| 8 | 19:31 | Local | `npx --no-install playwright test --retries=0 --reporter=list,json` | 21 / 0 / 1 (ui 6b, IN:86) | `baseline-evidence\20261104-193133-in86-skip\` |
| 9 | 19:47 | Local | `npx --no-install playwright test --retries=0 --reporter=list` (after C-19) | 21 / 0 / 1 | console only (session transcript) |
| 10–14 | 19:52–19:59 | GitHub Actions | `npx playwright test --retries=0` on `188139e`, five runs | 21 / 0 / 1 each | links in §3 |
