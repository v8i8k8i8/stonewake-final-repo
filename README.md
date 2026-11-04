# Stonewake Test Automation

This is the test automation project for **Stonewake**, our product. It contains API and UI tests written with [Playwright](https://playwright.dev).

- **App:** https://app.stonewake.ai
- **API:** https://api.stonewake.ai
- **Documentation:** https://docs.stonewake.ai (quickstart, API reference and OpenAPI spec)

## Getting started

### Fork this repository

Don't work in this repository directly. First, **fork** it to your own GitHub account and do all your work in your fork.

Not sure what a fork is? Read GitHub's guides:
- [About forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)
- [Fork a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)

## Credentials and security

Tests read credentials only from environment variables: `STONEWAKE_EMAIL`, `STONEWAKE_PASSWORD`, `STONEWAKE_API_KEY`.
Optional URL overrides: `STONEWAKE_APP_URL`, `STONEWAKE_API_URL`. Never commit real values; `.env` is git-ignored.

> **Security note:** the original repository committed credentials and an API key. They are removed from the code,
> but they remain in the public Git history and should be treated as compromised until the owner rotates them.
> Details: [ED-01](docs/ENGINEERING_DECISIONS.md#ed-01--hardcoded-credentials-and-api-key-exposed-in-public-git-history).

## Project structure

```text
playwright.config.ts          two projects: "api" (baseURL api.stonewake.ai) and "ui" (baseURL app.stonewake.ai)
tests/api.spec.ts             10 API tests (health, auth, portfolio, entities, countries, search)
tests/ui.spec.ts              12 UI tests (login, terms, redirects, logout, sidebar, Deal Book, Countries,
                              Institutions, Portfolio, EDD Dossiers); ui 6b is skipped because of IN:86
tests/support/credentials.ts  reads credentials from environment variables
.github/workflows/playwright.yml  GitHub Actions run
docs/                         test plan, changes, decisions, defects, stability evidence, AI usage
```

## Setup and execution

Requirements: Node.js LTS, Git. Then:

```bash
npm ci
npx playwright install --with-deps chromium
# set STONEWAKE_EMAIL, STONEWAKE_PASSWORD, STONEWAKE_API_KEY in your environment (never in files that are committed)
npx playwright test --retries=0            # full suite
npx playwright test --project=api          # API tests only
npx playwright test --project=ui           # UI tests only
npx playwright show-report                 # open the HTML report
```

Retries are 0 on purpose: a failure must be visible, not hidden by a retry.
Do not share or publish reports of failed UI runs: Playwright's failure snapshots can contain what was typed into
the login form ([ED-02](docs/ENGINEERING_DECISIONS.md#ed-02--sensitive-data-in-playwright-failure-artifacts)).

## Reporting and results

| What | Where |
|---|---|
| Latest results and five-run evidence | [docs/STABILITY_RESULTS.md](docs/STABILITY_RESULTS.md) |
| GitHub Actions run / published HTML report | PENDING — see [docs/SUBMISSION_LINKS.md](docs/SUBMISSION_LINKS.md) |
| Test plan (STP) | [docs/STP.md](docs/STP.md) (PDF PENDING) |
| Defects (product / automation / unconfirmed) | [docs/DEFECTS.md](docs/DEFECTS.md) |
| Every code change | [docs/CHANGES.md](docs/CHANGES.md) |
| Engineering decisions | [docs/ENGINEERING_DECISIONS.md](docs/ENGINEERING_DECISIONS.md) |
| Original state | [docs/BASELINE-ANALYSIS.md](docs/BASELINE-ANALYSIS.md) |

Current status (local, 2026-11-04 19:31): `npx --no-install playwright test --retries=0` → 21 passed, 0 failed, 1 skipped.
Five consecutive runs: PENDING.

## Known product defects

| Incident | Problem | Effect on the tests |
|---|---|---|
| [IN:86](https://itac.spiraservice.net/48/Incident/86.aspx) | The sidebar does not show "EDD Dossiers", although the dossiers module is enabled and the [docs](https://docs.stonewake.ai/dossiers) say it should be there. The page itself works at `/dossiers`. | `ui 6b sidebar edd dossiers link` is skipped (shown as skipped in reports) until the defect is fixed. `ui 11` covers the page itself. |

SpiraTest requires a login. Full details: [docs/DEFECTS.md](docs/DEFECTS.md).

## AI usage

- **Tools:** Claude Code (VS Code extension, model Claude Opus 5.5) and Claude in Chrome for read-only inspection of the app and its docs.
- **What AI did:** analysed the repository and failures, wrote all code changes listed in [CHANGES.md](docs/CHANGES.md)
  (C-01…C-16, including `tests/support/credentials.ts` and the new test ui 11) and drafted the documentation.
- **What the QA Lead did:** set the scope and rules for every step, chose to use personal credentials, approved each
  change set and decided on open questions. Nothing is committed or pushed without the QA Lead's approval.
- **Prompt log (verbatim):** [docs/AI_USAGE_LOG.md](docs/AI_USAGE_LOG.md).
