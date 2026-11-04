# Video Summary Script (draft 19:05 — target about 2–3 minutes)

The preparation email asks the video to show: starting state, problems found, what changed,
how stability improved, why the project is more reliable now. Facts only; PENDING items must be filled or cut before recording.
Record: Win+Alt+R (Xbox Game Bar); upload as unlisted/public; check it opens in a private window.
Before recording: close `.env`, terminals with environment output, and any trace or report of a failed run (ED-02).

| # | Time | Section | Say | Show on screen |
|---|---|---|---|---|
| 1 | 0:00–0:25 | Starting state | "We got 20 Playwright tests, 10 API and 10 UI. The repo had the account password and API key in the code and in a committed .env file. On the first full run with our own account, 11 passed and 9 failed." | BASELINE-ANALYSIS.md; `git show b4f92c9 --stat` (no values on screen) |
| 2 | 0:25–1:00 | Problems found | "First we fixed security: credentials now come from environment variables, and secrets and reports are no longer tracked. Then we found the root cause of every failure. Four API tests disagreed with the published OpenAPI contract, for example the wrong auth scheme and a wrong field name. Four UI tests had wrong locators, and two used fixed sleeps." | DEFECTS.md summary; openapi.json `bearerAuth`; error-context snapshot of ui 1 (**check it shows no password**) |
| 3 | 1:00–1:30 | How we decided | "We treated the API spec as the source of truth and kept every assertion exact. For ui 6 the sidebar link to EDD Dossiers was missing. We checked it in the browser before changing anything. [PENDING: final ED-06 decision and SpiraTest status.]" | ENGINEERING_DECISIONS.md ED-04, ED-06; browser sidebar + docs page |
| 4 | 1:30–2:00 | What changed | "We used user-facing locators like getByLabel and getByRole, removed fixed waits on the lines we fixed, and added projects with a base URL. We added ui 11 for the EDD Dossiers page. Claude Code wrote the code changes; the QA Lead set the rules and approved every step." | CHANGES.md; diff of ui.spec.ts |
| 5 | 2:00–2:30 | Stability | "Retries are zero. The suite went from 11 of 20 to 21 of 21. [PENDING: five consecutive runs locally and in GitHub Actions on commit ___.]" | STABILITY_RESULTS.md; GitHub Actions run list (PENDING) |
| 6 | 2:30–2:50 | What is not done | "[PENDING at recording time] e.g. credentials still in old Git history, so the owner must rotate them; remaining XPath locators and duplicated login; MCP and Screenings flows not covered." | STP.md §11 |
| 7 | 2:50–3:00 | AI usage | "All prompts are in AI_USAGE_LOG.md, with the files the AI changed." | AI_USAGE_LOG.md |
