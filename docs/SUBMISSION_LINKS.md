# Submission Links

**Form — CONFLICT, QA Lead to confirm before submitting:**
- `preparation-email.md`: https://forms.gle/5Gzxy1XheLwrFkxu6 (closes 21:00 sharp)
- Competition-day message (copy found in the prep kit as `competition-task.md`; the official
  `competition-info\competition-task.md` is empty): https://forms.gle/TuATq3R2cu8hL8yY9

Every link must open **without sign-in** (preparation-email.md: "כל הקישורים ... חייבים להיות נגישים לצפייה ללא הרשמה").

| # | Item (official) | Link | Anonymous HTTP | Private window | Checked at |
|---|---|---|---|---|---|
| 1 | GitHub repository | https://github.com/v8i8k8i8/stonewake-final-repo (public fork) | 200 | not verified | 19:55 |
| 2 | GitHub Actions run | https://github.com/v8i8k8i8/stonewake-final-repo/actions/runs/41882225126 (run 5 of 5, all green on `188139e`; all five links in STABILITY_RESULTS.md §3) | 200 | | 20:01 |
| 3 | Run report (HTML) | https://v8i8k8i8.github.io/stonewake-final-repo/ (from run 5) | 200 | | 20:01 |
| 4 | STP (updated) | https://github.com/v8i8k8i8/stonewake-final-repo/blob/master/docs/STP.md · DOCX: https://github.com/v8i8k8i8/stonewake-final-repo/blob/master/docs/STP.docx (live after the docs commit is pushed) | PENDING | | |
| 5 | Defect report | https://github.com/v8i8k8i8/stonewake-final-repo/blob/master/docs/DEFECTS.md | 200 | | 19:55 |
| 6 | SpiraTest incidents | [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) — Spira requires login | n/a | n/a | 19:29 |
| 7 | Summary video | (https://jam.dev/c/384cd4eb-2ded-4afe-ba01-43cfdd631351) | | | |

Report ↔ commit: `build-info.json` commit `188139ead2aa9d868fb82f8ac2eca7c45367dfe7` = final code commit; testOutcome `success`; runUrl = link #2.

Anonymous check command (once links exist):
`powershell -ExecutionPolicy Bypass -File C:\ITAC-Prep\competition-kit\scripts\check-public-links.ps1 -Links <1>,<2>,<3>,<4>,<5>,<7> -ReportUrl <3> -ExpectedSha <sha>`

Submitted at: PENDING · Confirmation screenshot: PENDING
