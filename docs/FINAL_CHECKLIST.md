# Final Checklist — ITAC 2026 Final (deadline 21:00)

Tick only with evidence. "Not verified" is an acceptable, honest answer; a false tick is not.
Status as of 19:05, 2026-11-04.

## T-60 (20:00) — code freeze
- [ ] All planned fixes done — ED-06 (ui 6) decision pending
- [ ] Final commit SHA: `PENDING` — nothing committed yet
- [ ] Local five-run script started on the final commit
- [x] Product defects drafted in DEFECTS.md (0 confirmed, 1 unconfirmed: DEF-U-01) — SpiraTest batch: not approved / not needed yet

## T-30 (20:30) — no new work
- [ ] Local: `RESULT: PASS (5/5 passed)` → STABILITY_RESULTS.md §2
- [ ] CI: 5 runs, same SHA, success, attempt 1 → STABILITY_RESULTS.md §3 (needs secrets in workflow, ED-01/ED-08)
- [ ] HTML report on Pages; `build-info.json` commit = final SHA
- [ ] SpiraTest incidents created; IDs in DEFECTS.md (only if DEF-U-01 is confirmed)
- [ ] STP filled and exported: content in `docs/STP.md`; `docs/STP.docx` (still the template) and `docs/STP.pdf` PENDING
- [x] AI_USAGE_LOG.md: tools, verbatim prompts, AI-changed files (update again before submission)
- [x] ENGINEERING_DECISIONS.md, CHANGES.md up to date (as of 19:05)
- [x] README: run instructions, docs links, AI usage section (links to run/report PENDING)
- [ ] VIDEO_SCRIPT.md draft ready (drafted 19:05; final numbers PENDING); recording not started

## T-15 (20:45) — verify and submit
- [ ] Everything pushed (`git status`, `git log origin/master -1` = final docs commit)
- [ ] Docs-only commits after the five-run commit are stated as such in STABILITY_RESULTS.md
- [ ] No secrets: `git ls-files` review (no `.env`, auth state, credentials in traces/screenshots — see ED-02)
- [ ] `check-public-links.ps1` all 200; then each link opened in a private window
- [ ] Video link opens without login
- [ ] SUBMISSION_LINKS.md complete
- [ ] Form submitted — **confirm which form link** (two different links, see SUBMISSION_LINKS.md) — confirmation screenshot saved

## Mandatory deliverables (preparation-email.md)
| # | Deliverable | Where | Done |
|---|---|---|---|
| 1 | GitHub repository link (public) | SUBMISSION_LINKS #1 | fork exists; public visibility not verified |
| 2 | GitHub Actions run link | SUBMISSION_LINKS #2 | PENDING |
| 3 | Run report link | SUBMISSION_LINKS #3 | PENDING |
| 4 | Updated STP | docs/STP.md (content); docs/STP.pdf | content drafted; PDF PENDING |
| 5 | Defect + change documentation | DEFECTS.md, CHANGES.md, ENGINEERING_DECISIONS.md | drafted |
| 6 | Product defects in SpiraTest | DEFECTS.md (IDs) | none confirmed; DEF-U-01 pending |
| 7 | Summary video | SUBMISSION_LINKS #7 | PENDING |
| 8 | README: AI tools, prompt log, AI-changed parts | README + AI_USAGE_LOG.md | done (update at end) |
| 9 | 5 green runs in a row | STABILITY_RESULTS.md | PENDING (1 green run so far) |
| — | Competition-day message (kit copy of `competition-task.md`) adds: product docs links, 6 recommended flows, performance & security in scope, a different form link | STP.md §3 | noted |
