# Video Summary Script (draft — about 2–3 minutes)

The preparation email asks the video to show: the starting state, the problems found, what changed, how stability
improved, and why the project is more reliable now. Facts only. Fill in or cut every PENDING item before recording.

Recording: Win+Alt+R (Xbox Game Bar). Upload as unlisted or public, and check the link in a private window.
Before recording: close `.env`, any terminal that shows environment output, and any trace or report of a failed run (ED-02).

| # | Time | Section | Say | Show on screen |
|---|---|---|---|---|
| 1 | 0:00–0:25 | Starting state | "I received 20 Playwright tests, 10 API and 10 UI. The repo had the account password and API key in the code and in a committed .env file. On the first full run with my own account, 11 tests passed and 9 failed." | BASELINE-ANALYSIS.md; `git show b4f92c9 --stat` (no values on screen) |
| 2 | 0:25–1:00 | Problems found | "I started with security. The tests now read credentials from environment variables, and secrets and reports are no longer tracked in Git. Then we looked for the root cause of every failure. Four API tests did not match the published API contract, for example the wrong auth type and a wrong field name. Four UI tests had wrong locators, and two used fixed waits." | DEFECTS.md summary; openapi.json `bearerAuth`; failure snapshot of ui 1 (**check that it shows no password**) |
| 3 | 1:00–1:40 | How I decided | "For the API, I used the official spec as the source of truth and kept every check exact. The hardest case was ui 6. It failed because the EDD Dossiers link was missing from the sidebar, but the page itself worked. At first it looked like an outdated test. Then the public docs and the workspace settings showed the link should be there. So it was a product bug. I reported it in SpiraTest as IN:86, kept a separate test for the link, and marked it as skipped, which the organisers allow for confirmed product bugs." | ENGINEERING_DECISIONS.md ED-04, ED-06; sidebar in the browser; docs page "Where to find it"; IN:86 |
| 4 | 1:40–2:05 | What changed | "We switched to user-facing locators like getByLabel and getByRole, removed fixed waits on the lines we fixed, and set up a base URL for API and UI. We added a test for the EDD Dossiers page. Claude Code wrote the code changes. I set the rules, reviewed the results and approved every step." | CHANGES.md; diff of ui.spec.ts |
| 5 | 2:05–2:30 | Stability | "Retries are zero, so a failure cannot hide behind a retry. The suite went from 11 of 20 passing to 21 passing and 1 skipped for IN:86. Then I ran the full suite five times in a row in GitHub Actions and five times locally, all on commit 188139e. Every run: 21 passed, 0 failed, 1 skipped for IN:86." | STABILITY_RESULTS.md; GitHub Actions run list (PENDING) |
| 6 | 2:30–2:50 | What is not done | "[Check at recording time] The old credentials are still in the Git history, so the owner must change them. Some XPath locators and repeated login steps remain. MCP and Screenings flows are not covered." | STP.md §11 |
| 7 | 2:50–3:00 | AI usage | "All my prompts are in AI_USAGE_LOG.md, together with the files the AI changed." | AI_USAGE_LOG.md |
