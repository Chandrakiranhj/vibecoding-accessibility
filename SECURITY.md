# Security

This skill is intentionally local-first.

- The core `SKILL.md` and reference files do not make network calls.
- `scripts/scan.mjs` and `scripts/contrast.mjs` read local project files and print findings.
- `scripts/audit-live.mjs` only visits the URL supplied by the user and requires optional Playwright/axe dependencies installed in the target project.
- No script reads credentials intentionally, uploads code, or writes fixes automatically.

Review third-party skill/plugin code before installing it. For reproducible installs, pin to a release tag or commit SHA.
