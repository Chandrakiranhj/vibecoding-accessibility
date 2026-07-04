# vibecoding-accessibility

A Claude Code / agent skill for auditing and fixing web accessibility in AI-generated codebases. It focuses on the accessibility bugs that look fine in screenshots but fail for keyboard and screen reader users: disconnected labels, unlabeled icon buttons, custom selects with missing semantics, silent loading states, weak table defaults, and async AI responses with no live region.

## Why this exists

AI coding assistants often produce UI that is visually plausible but programmatically thin. In React, Next.js, shadcn/Radix-style component libraries, and dashboard apps, the highest-impact accessibility fixes usually live in shared primitives rather than individual pages. Fixing one `Field`, `TableHead`, `SearchableSelect`, `Dialog`, or `Toast` component can repair many screens at once.

## What's inside

- [`SKILL.md`](SKILL.md): the main workflow, high-signal failure patterns, severity guide, and verification checklist.
- [`references/A11Y-PATTERNS.md`](references/A11Y-PATTERNS.md): implementation patterns for labels, skip links, errors, live regions, modals, tabs, drag alternatives, and screen reader smoke tests.
- [`references/WCAG.md`](references/WCAG.md): compact WCAG 2.2 A/AA/AAA mapping plus common mappings for AI-generated apps.
- [`scripts/scan.mjs`](scripts/scan.mjs): zero-dependency static hotspot scanner.
- [`scripts/contrast.mjs`](scripts/contrast.mjs): zero-dependency CSS token contrast scanner.
- [`scripts/audit-live.mjs`](scripts/audit-live.mjs): optional Playwright + axe live-page audit wrapper.
- [`assets/regression-prevention`](assets/regression-prevention): starter lint, CI, and project-instruction guardrails.

## Install

### Skills CLI

Recommended for agents that support the Open Agent Skills ecosystem:

```bash
npx skills add Chandrakiranhj/vibecoding-accessibility
```

This installs the skill from this GitHub repo using the standard `owner/repo` form used by skills.sh.

### Claude Code Manual Install

If you do not use the Skills CLI, install as a personal Claude Code skill:

```bash
git clone https://github.com/Chandrakiranhj/vibecoding-accessibility.git ~/.claude/skills/vibecoding-accessibility
```

Or install as a project-local Claude Code skill:

```bash
git clone https://github.com/Chandrakiranhj/vibecoding-accessibility.git .claude/skills/vibecoding-accessibility
```

Then ask Claude Code to "audit accessibility", "improve WCAG compliance", "check screen reader support", "fix keyboard navigation", or "make this UI accessible".

### Claude Code Plugin

This repo also includes a Claude Code plugin manifest at `.claude-plugin/plugin.json`. After cloning, you can validate or test it locally:

```bash
claude plugin validate .
claude --plugin-dir .
```

Marketplace installation is separate from this repo and depends on marketplace submission/review.

### Codex and other agents

Place the folder where your agent loads skills, or paste/link `SKILL.md` and the relevant reference file into the agent context. For Codex-style project skills, a typical project-local location is:

```bash
git clone https://github.com/Chandrakiranhj/vibecoding-accessibility.git .agents/skills/vibecoding-accessibility
```

## Recommended audit flow

1. Inspect shared UI primitives first.
2. Grep for known bad patterns across the app.
3. Fix reusable defaults before individual call sites.
4. Verify with keyboard navigation, automated tooling, and a screen reader smoke test.
5. Map material findings to WCAG 2.2 when compliance reporting is needed.

## Local checks

```bash
node scripts/scan.mjs path/to/app
node scripts/contrast.mjs path/to/app
```

For live axe checks, install optional dependencies in the app being tested:

```bash
npm install -D playwright @axe-core/playwright
npx playwright install chromium
node scripts/audit-live.mjs http://localhost:3000
```

## License

MIT. See [`LICENSE`](LICENSE).

## Authors

- Chandrakiran H J ([@Chandrakiranhj](https://github.com/Chandrakiranhj))
- Claude (Anthropic)
