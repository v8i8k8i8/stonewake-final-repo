# AI Usage Log — transparency

Official requirement (preparation-email.md, "שימוש ב-AI"): the README must state which AI tools were used,
a log of the main prompts, and which parts of the project were created or changed with AI.

## 1. Tools
| Tool | Model / version | Used for |
|---|---|---|
| Claude Code (VS Code extension) | Claude Opus 5.5 (`claude-opus-5-5`, from session transcripts) | Repository analysis, test runs, root-cause analysis, all code changes in CHANGES.md, documentation drafts |
| Claude in Chrome (browser extension, "Browser 1") | same model, driven from Claude Code | Read-only inspection of the Stonewake app (sidebar, `/dossiers`, `/guide`, a company page) and the public docs `docs.stonewake.ai` |
| Playwright (scripts written by Claude, run locally) | 1.64.1 | Read-only API/DOM probes from Claude's scratch folder (not in the repo); printed shapes and status codes only, never credentials |

No other AI tools were used during the final (as far as recorded in this log).

**How it was used:** Claude Code worked as an assistant under the QA Lead's direction, in separate sessions.
The QA Lead set scope and rules in each prompt (no commits/pushes, no weakened assertions, presence-only checks
of credentials) and made the decisions. Claude implemented within that scope and reported results with evidence.
Nothing has been committed or pushed at the time of writing.

## 2. Timeline
| Time (local) | Session | What happened | Human decision |
|---|---|---|---|
| 18:03 | `aba4d946` | `/qa` start: read task + guide, inspect repo, propose plan (P01) | Plan approved (P02) |
| 18:09–18:15 | `aba4d946` | Fork + clone, `npm ci`, Chromium, 4-test credential-free baseline (18:12: 3/1) (P02) | QA Lead chose not to reuse the organiser's committed credentials |
| 18:15–18:25 | `aba4d946` | P1-a: credentials → env vars, baseURL projects, `.gitignore` + untrack, `/health` fix, docs skeleton (C-01…C-06) (P03) | QA Lead approved; uses own credentials |
| 18:20–18:25 | `a2e379d6` | Second session as read-only documentation reviewer drafted the ED-01 security text; then integrated it into ENGINEERING_DECISIONS.md and README (P04, P05) | QA Lead requested both steps |
| 18:26–18:33 | `1a52ba76` | Env presence check; full run 11/9; root causes from OpenAPI spec, probes, snapshots; C-07…C-14; 19/1 (P06) | Approved scope in prompt |
| 18:37–18:40 | `1a52ba76` | Claude in Chrome demonstration of ui 6 / EDD Dossiers; plain-language explanation (P07–P09) | QA Lead inspected the browser personally |
| 18:42–18:46 | `1a52ba76` | Investigation (in-app guide, company page), C-15, C-16, DEF-U-01; full run 21/21 (P10) | QA Lead's conditional rule applied by Claude |
| 18:55– | `1a52ba76` | Documentation finalisation (P11). While doing it, the public docs page `docs.stonewake.ai/dossiers` was checked and contradicts the premise of C-15 → ED-06 reopened | Decision PENDING |

Session `ad47dec4` (started 17:19) has no prompts after 18:00 (export: 0 prompts); it is not part of the final's work.

## 3. Main prompts (verbatim)
Exported with `node C:\ITAC-Prep\competition-kit\scripts\export-claude-prompts.cjs <transcript.jsonl> --since 2026-11-04T16:00:00Z`
(18:00 Israel time) from the four transcripts in `%USERPROFILE%\.claude\projects\c--ITAC-QA-Agent\`. Reviewed for
secrets before copying: none found. Text is verbatim; only the paste-wrapper tags the IDE adds around pasted text were
removed. One IDE-generated context line in P02 is kept and marked. Nothing below is reconstructed.

### P01 — 18:03 — Claude Code (`aba4d946`) — start, plan
~~~text
/qa

The official ITAC 2026 Finals repository is:
https://github.com/AlexKomanov/stonewake-final-repo

Competition deadline: 21:00 Israel time.
Target submission: 20:50.

Read the official task instructions and COMPETITION-DAY-GUIDE.md.

First:
1. Inspect the repository README and setup instructions.
2. Determine whether the competition requires a fork or clone.
3. Check the required Node.js, Playwright and dependency versions.
4. Identify existing tests, architecture and CI configuration.
5. Identify the highest-priority fixes and mandatory deliverables.
6. Propose the exact Git setup commands and an execution plan.

Do not modify files or clone/fork until I approve.

Prioritize stabilizing existing tests before adding new coverage.

Keep the plan concise and actionable.
~~~
- Result: plan proposed (analysis only). Human decision: approved in P02.

### P02 — 18:09 — Claude Code (`aba4d946`) — Phase 1 setup and baseline
~~~text
[IDE context line, not typed: "The user opened the file c:\ITAC-QA-Agent\.env in the IDE. This may or may not be related to the current task."]

Approved. Start Phase 1 immediately.

1. Fork AlexKomanov/stonewake-final-repo into my GitHub account and clone the fork into C:\ITAC-Workspace.
2. Verify the Git remotes and original commit SHA.
3. Run npm ci and install the required Playwright Chromium browser.
4. Verify repository access and available tests.
5. Run one baseline test suite and save the results.
6. Do not expose or reuse the credentials committed in the original repository.

You may perform the approved local setup and fork operations.

Do not push code, change permissions, modify Git history, or create external resources beyond the fork without separate approval.

Report the baseline results and blockers.

Work quickly. Competition deadline is 21:00.
~~~
- Result: fork `v8i8k8i8/stonewake-final-repo`, clone, remotes (`origin` fork, `upstream` original), original SHA `b4f92c9`;
  baseline limited to 4 credential-free tests (3 passed, api 1 failed 404). Files: none in repo.

### P03 — 18:15 — Claude Code (`aba4d946`) — P1-a credentials and setup fixes
~~~text
Approved. Start P1-a immediately.

I have already added my personal STONEWAKE_EMAIL, STONEWAKE_PASSWORD and STONEWAKE_API_KEY to C:\ITAC-QA-Agent\.env.

First, check whether all three variables are available in your current process (presence only, never reveal values).

If they are not loaded, tell me exactly how to reload them. Do not use the committed organiser credentials.

Proceed with:
1. Remove all hardcoded credentials from test files.
2. Configure tests to use STONEWAKE_* environment variables.
3. Add baseURL configuration.
4. Update .gitignore to exclude .env, node_modules, playwright-report and test-results.
5. Remove generated files and .env from Git tracking without deleting local files or rewriting history.
6. Fix the confirmed /v1/health endpoint defect.
7. Create the documentation skeleton.
8. Run the full 20-test baseline using my own credentials once available.

Keep changes minimal, secure and maintainable.

Do not commit or push yet.
Do not modify the agent .env.example; it is not necessary.

Report the full test results and prioritize remaining failures.

Time is critical. Do not spend time on optional improvements.
~~~
- Result: C-01…C-06 implemented; subset 4/4 passed (18:25). The full 20-test run was done in the next session
  (P06). Files: tests/support/credentials.ts, tests/*.spec.ts, playwright.config.ts, .gitignore, docs/*.

### P04 — 18:20 — Claude Code (`a2e379d6`) — read-only security write-up
~~~text
Act as a read-only documentation reviewer.

Another Claude session is currently working on P1-a.

Prepare the security finding documentation for ENGINEERING_DECISIONS.md and a short README reference.

IMPORTANT:
- Do not modify any files.
- Do not run Git commands that change state.
- Do not interfere with the other session.
- Do not expose credentials.
- Return the exact Markdown text ready to insert.

Document:
1. Hardcoded credentials and API key in the original repository.
2. Exposure through the public Git history.
3. Remediation using environment variables and .gitignore.
4. Remaining risk and recommendation to rotate credentials.

Clearly distinguish completed remediation from planned remediation.
~~~
- Result: ED-01 Markdown draft (analysis only).

### P05 — 18:23 — Claude Code (`a2e379d6`) — integrate ED-01
~~~text
Please integrate the security finding prepared by the documentation reviewer.

Update:
1. docs/ENGINEERING_DECISIONS.md
2. README.md

Document the original repository's exposed credentials and API key, the remediation using environment variables and .gitignore, and the remaining Git history exposure.

Keep the full technical analysis in ENGINEERING_DECISIONS.md and only a short security note in README.md.

Important:
- Verify the current implementation before marking anything completed.
- Do not overwrite existing engineering decisions.
- Use the next available ED number.
- Do not include actual credentials or tokens.
- Do not claim GitHub Actions secrets are configured until verified.
- Do not rewrite Git history.
- Do not commit or push yet.

Keep this documentation update short. Then return immediately to the full 20-test run and P1-b fixes. Prioritize test stability over documentation polish.
~~~
- Result: ED-01 in ENGINEERING_DECISIONS.md, security note in README.md.

### P06 — 18:26 — Claude Code (`1a52ba76`) — baseline run and P1-b fixes
~~~text
Continue the ITAC Finals work from the current repository state.

P1-a is complete, and security finding ED-01 has been documented.

First verify that STONEWAKE_EMAIL, STONEWAKE_PASSWORD and STONEWAKE_API_KEY are available in the current process (presence only, no values).

Then:
1. Run all 20 tests with --retries=0.
2. Save baseline evidence.
3. Identify the exact root cause of each failure.
4. Begin P1-b: fix the failing API and UI tests using minimal, maintainable changes.
5. Rerun each affected test after fixing it.
6. Do not weaken assertions or hide failures.
7. Keep CHANGES.md and AI_USAGE_LOG.md updated.

Do not commit or push yet.

Report the results and remaining blockers. Prioritize achieving a stable, fully passing test suite.
~~~
- Result: all 3 variables set; 11/9 → root causes (OpenAPI spec, live GET probes, error-context snapshots, DOM probe)
  → C-07…C-14 → 19/1; ui 6 escalated; credential exposure in failure artifacts reported (ED-02). Files: tests/*.spec.ts, docs/CHANGES.md, docs/AI_USAGE_LOG.md.

### P07 — 18:37 — Claude Code + Claude in Chrome (`1a52ba76`) — visual demonstration of ui 6
~~~text
Before fixing UI 6, I want to visually inspect the issue myself.

Use Claude in Chrome (Browser 1) to demonstrate the problem.

1. Open the authenticated Stonewake application.
2. Navigate to the main dashboard.
3. Show me the sidebar and identify the six existing navigation links.
4. Show me where the "EDD Dossiers" link was expected.
5. Navigate directly to /dossiers.
6. Show me that the EDD Dossiers page is accessible.

IMPORTANT:
- Keep the browser visible so I can inspect it myself.
- Do not modify application data.
- Do not change the test code yet.
- Do not create a SpiraTest incident yet.
- Do not make assumptions about whether this is a product defect.

After the demonstration, explain what the original UI 6 test expected versus what the application actually displays.

Wait for my decision before changing UI 6.
~~~
- Result: read-only navigation and screenshots; no data changed, no code changed.

### P08 — 18:38 — (`1a52ba76`)
~~~text
there is a button new dossier
~~~
- Result: button inspected without clicking (plain enabled button, no link); click offered only with approval.

### P09 — 18:39 — (`1a52ba76`)
~~~text
can u explain simply what is the problem with tests and the dossier?
~~~
- Result: plain-language explanation (analysis only).

### P10 — 18:42 — Claude Code + Claude in Chrome (`1a52ba76`) — investigation and ui 6 change
~~~text
Before changing UI 6, investigate the EDD Dossiers navigation using Claude in Chrome.

1. Check whether EDD Dossiers is accessible through any existing UI navigation, button, or link.
2. Inspect the "New dossier" button and its context without creating data.
3. Compare the current UI with any available product documentation.
4. Determine whether there is evidence that EDD Dossiers should appear in the sidebar.

Then:
- If the sidebar link is not a documented requirement, update UI 6 to validate the existing sidebar links, including Scoring.
- Add a separate test verifying that the EDD Dossiers page loads directly and displays its heading and New dossier button.
- Document the removed sidebar expectation as an unconfirmed navigation issue, not a confirmed product defect.
- Preserve the original expectation in the test change log.
- Do not skip tests or weaken existing valid assertions.

Run the full suite with --retries=0 and report the results.

Do not commit or push yet.
~~~
- Result: Claude checked the in-app guide (`/guide`), a company page and two other pages, but **not** the public docs site;
  concluded "not documented" and applied C-15, C-16, DEF-U-01; full run 21/21. **Limitation found later (P11):** the public docs
  (`docs.stonewake.ai/dossiers`) do document the sidebar link → ED-06 reopened. Files: tests/ui.spec.ts, docs/CHANGES.md, docs/DEFECTS.md, docs/AI_USAGE_LOG.md.

### P11 — 18:55 — Claude Code (`1a52ba76`) — documentation finalisation
~~~text
# ITAC 2026 FINALS — COMPLETE DOCUMENTATION FINALIZATION

PAUSE all implementation work.

[... 90 lines of instructions omitted: sources of truth, list of documents to finalise, required content of AI_USAGE_LOG.md, ENGINEERING_DECISIONS.md and CHANGES.md. The prompt as received ends after "CHANGES.md … For each change, include: Affected files. Original problem. Root cause." (confirmed in the transcript export) ...]
~~~
- Result: this documentation set (CHANGES, ENGINEERING_DECISIONS, DEFECTS, STABILITY_RESULTS, SUBMISSION_LINKS,
  FINAL_CHECKLIST, AI_USAGE_LOG, BASELINE-ANALYSIS, STP.md, VIDEO_SCRIPT, README). No code changed.

## 4. Files created or changed with AI
| File | Created / modified | What | Human validation | Ref |
|---|---|---|---|---|
| tests/support/credentials.ts | Created | Reads credentials from env vars | Reviewed by QA Lead in P1-a; 21/21 run | P03, C-01 |
| tests/api.spec.ts | Modified | Env credentials, relative URLs, `/health`, log removed, 4 contract fixes | 10/10 api run | P03, P06, C-01…C-10 |
| tests/ui.spec.ts | Modified | Env credentials, relative URLs, web-first URL checks, 4 locator fixes, ui 6 change, new ui 11, skipped ui 6b (IN:86) | 5/5 CI + 5/5 local (21 passed, 1 skipped) | P03, P06, P10, C-01…C-17 |
| tests/api.spec.ts (api 5) | Modified | Accept documented `null` completeness | same runs | C-19 |
| playwright.config.ts | Modified | `api`/`ui` projects with `baseURL` | same runs | P03, C-02 |
| .gitignore | Modified | Ignore `.env`, artifacts, `node_modules` | `git check-ignore -v` | P03, C-03 |
| .github/workflows/playwright.yml | Modified | Secrets, retries 0, Pages only for green runs | 5/5 CI runs, report public | C-18 |
| README.md | Modified | Security note; setup/run/docs/AI sections; known defects | QA Lead approved the commits | P05, P11 |
| docs/*.md, docs/STP.docx | Created / filled | All documentation in `docs/`; STP.docx generated from STP.md | QA Lead approved the commits; several files were reworded in a separate documentation session (19:50–19:53) and fact-checked before the final commit | P03, P05, P06, P10, P11 |

Not AI-assisted: none of the code changes. Decisions, approvals and the choice of credentials were the QA Lead's.
SpiraTest incident IN:86 was filled in by Claude through Claude in Chrome and saved after the QA Lead's review.

## 5. Limitations of this log
- Claude's answers are not copied here; they are in the local transcripts listed above.
- The 18:12 baseline's exact command was not saved in its console log (MISSING).
- Prompts after 19:05 (module check, IN:86, skip decision, CI and five runs, final commit) are not copied verbatim
  here because of time; they are in session transcript `1a52ba76` and can be exported with the command in §3.

## 6. Engineering decisions
See [ENGINEERING_DECISIONS.md](ENGINEERING_DECISIONS.md). AI proposed options; the QA Lead decided.
