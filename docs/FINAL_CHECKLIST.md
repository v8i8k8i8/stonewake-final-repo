# Final Checklist — ITAC 2026 Final (deadline 21:00)

Tick only with evidence. "Not verified" is an acceptable, honest answer; a false tick is not.
Status as of 20:15, 2026-11-04.

## T-60 (20:00) — code freeze
- [x] All planned fixes done; code frozen at commit `188139e` (later commits are documentation only)
- [x] Local five-run series on the final code: 5/5 passed (STABILITY_RESULTS.md §2)
- [x] Product defects in DEFECTS.md and SpiraTest: IN:86

## T-30 (20:30) — no new work
- [x] Local: 5/5 passed (script result PASS-UNCOMMITTED because of doc edits only; code identical to `188139e`)
- [x] CI: 5 runs, same SHA `188139e`, success, attempt 1 → STABILITY_RESULTS.md §3
- [x] HTML report on Pages; `build-info.json` commit = `188139e`, outcome success (checked 20:01)
- [x] SpiraTest incident created: IN:86, ID and link in DEFECTS.md
- [x] STP: `docs/STP.md` and `docs/STP.docx` (generated from STP.md; layout not checked in Word by Claude)
- [x] AI_USAGE_LOG.md: tools, verbatim prompts up to 19:05, AI-changed files, limitations
- [x] ENGINEERING_DECISIONS.md, CHANGES.md up to date
- [x] README: run instructions, links, known defects, AI usage
- [ ] VIDEO_SCRIPT.md ready (numbers filled); recording — QA Lead

## T-15 (20:45) — verify and submit
- [ ] Final docs commit pushed and its CI run green (see SUBMISSION_LINKS.md)
- [x] Docs-only commits after the five-run commit are stated as such in STABILITY_RESULTS.md
- [x] No secrets: staged files and the public report checked by value match (no `.env`, traces or screenshots committed)
- [ ] Each link opened in a private window — QA Lead (anonymous HTTP checks done by Claude)
- [ ] Video link opens without login — QA Lead
- [ ] SUBMISSION_LINKS.md complete (video link missing)
- [ ] Form submitted — **confirm which form link** (two different links, see SUBMISSION_LINKS.md) — QA Lead

## Mandatory deliverables (preparation-email.md)
| # | Deliverable | Where | Done |
|---|---|---|---|
| 1 | GitHub repository link (public) | SUBMISSION_LINKS #1 | yes (HTTP 200 anonymous) |
| 2 | GitHub Actions run link | SUBMISSION_LINKS #2 | yes |
| 3 | Run report link | SUBMISSION_LINKS #3 | yes (HTTP 200 anonymous) |
| 4 | Updated STP | docs/STP.md, docs/STP.docx | yes |
| 5 | Defect + change documentation | DEFECTS.md, CHANGES.md, ENGINEERING_DECISIONS.md | yes |
| 6 | Product defects in SpiraTest | DEFECTS.md (IN:86) | yes |
| 7 | Summary video | SUBMISSION_LINKS #7 | QA Lead |
| 8 | README: AI tools, prompt log, AI-changed parts | README + AI_USAGE_LOG.md | yes |
| 9 | 5 green runs in a row | STABILITY_RESULTS.md | yes: 5/5 CI and 5/5 local |
