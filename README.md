# vibecoding-accessibility

A [Claude Code skill](https://docs.claude.com/en/docs/claude-code/skills) that audits and fixes web accessibility (WCAG 2.2) in AI-generated ("vibecoded") codebases — with a focus on the specific antipatterns AI coding assistants repeatedly introduce, not just generic WCAG advice.

This isn't a generic accessibility checklist. It was distilled from a real audit of a production Next.js + React component-library codebase, where dozens of concrete NVDA-breaking bugs were found and fixed. The skill leads with those **real, recurring failure patterns** — the ones that show up over and over specifically in AI-assisted codebases — before falling back to the full WCAG 2.2 reference.

## Why this exists

AI coding assistants are good at making UI *look* right and bad at an invisible layer: whether a `<Label>` is actually wired to its `<input>` via `htmlFor`/`id`, whether a decorative icon is `aria-hidden`, whether a custom dropdown exposes ARIA state instead of a `data-*` attribute, whether a loading spinner is in a live region. None of this is visible in a screenshot or a sighted code review — it only shows up when you test with a screen reader, or grep for the pattern deliberately. This skill encodes what to grep for and why.

## What's inside

- **[`SKILL.md`](SKILL.md)** — the skill itself. Leads with 11 "vibecoding failure patterns" (each with a real before/after code fix), then the full WCAG 2.2 POUR framework, a fix-by-impact taxonomy (Critical/Serious/Moderate), and a practical audit workflow.
- **[`references/WCAG.md`](references/WCAG.md)** — the complete WCAG 2.2 success-criteria table (A/AA/AAA), common ARIA patterns, and what's new in 2.2.
- **[`references/A11Y-PATTERNS.md`](references/A11Y-PATTERNS.md)** — copy-paste-ready code patterns: modal focus trap, skip link, form labels, error handling, live regions, ARIA tabs, screen-reader keyboard shortcuts.

## The core insight

> In a codebase built with an AI coding assistant, accessibility bugs are not randomly scattered — they cluster in a small number of shared building blocks (a `Field`/`Label` helper, a `Table` wrapper, a `Select`/`Dropdown` primitive, a toast/skeleton system) that get reused dozens of times. Fix the shared component once, and the fix cascades to every consumer — that's a far better use of an audit pass than going file-by-file.

## Using this skill

### With Claude Code

Drop this repo's contents into your project or global skills directory:

```bash
# Global (available in every project)
git clone https://github.com/Chandrakiranhj/vibecoding-accessibility.git ~/.claude/skills/vibecoding-accessibility

# Or project-local
git clone https://github.com/Chandrakiranhj/vibecoding-accessibility.git .agents/skills/accessibility
```

Then just ask Claude Code to "audit accessibility," "improve WCAG compliance," "check screen reader support," or "make this accessible" — the skill will be picked up automatically based on its `description` frontmatter.

### With any other AI coding assistant

`SKILL.md` is plain markdown with a small YAML frontmatter header. Paste its contents (or link the file) into any assistant's context and ask it to apply the patterns to your codebase — nothing here is Claude-specific.

### Manually

Read [`SKILL.md`](SKILL.md) yourself. The "Vibecoding failure patterns" section alone is a fast, high-signal checklist to run against any AI-assisted frontend before shipping it.

## License

MIT — see [LICENSE](LICENSE).

## Authors

- Chandrakiran H J ([@Chandrakiranhj](https://github.com/Chandrakiranhj))
- Claude (Anthropic)
