---
name: vibecoding-accessibility
description: Audit and fix web accessibility in AI-generated ("vibecoded") codebases following WCAG 2.2 guidelines, with a focus on the specific antipatterns AI coding assistants repeatedly introduce (unlinked form labels, decorative-icon leakage, shared-component defaults, silent live regions). Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "NVDA/VoiceOver support", "keyboard navigation", or "make accessible".
license: MIT
metadata:
  author: Chandrakiran H J and Claude (Anthropic)
  version: "2.0"
  basedOn: web-quality-skills/accessibility
---

# Accessibility (a11y) for vibecoded apps

Comprehensive accessibility guidelines based on WCAG 2.2, Lighthouse accessibility audits, and real-world findings from auditing AI-generated component-library codebases (Next.js/React + shadcn-style UI primitives) with NVDA. Goal: make content usable by everyone, including people with disabilities — including the large fraction of an app's users who will never file a bug report because they simply can't use it and leave.

**Read this before anything else:** in a codebase built with an AI coding assistant, accessibility bugs are not randomly scattered — they cluster in a small number of shared building blocks (a `Field`/`Label` helper, a `Table` wrapper, a `Select`/`Dropdown` primitive, a toast/skeleton system) that get copy-pasted or reused dozens of times. **Jump to [Vibecoding failure patterns](#vibecoding-failure-patterns) first** — fixing one shared component there typically fixes 10-40 call sites at once, which is a far better use of a fix pass than going file-by-file.

## WCAG Principles: POUR

| Principle | Description |
|-----------|-------------|
| **P**erceivable | Content can be perceived through different senses |
| **O**perable | Interface can be operated by all users |
| **U**nderstandable | Content and interface are understandable |
| **R**obust | Content works with assistive technologies |

## Conformance levels

| Level | Requirement | Target |
|-------|-------------|--------|
| **A** | Minimum accessibility | Must pass |
| **AA** | Standard compliance | Should pass (legal requirement in many jurisdictions) |
| **AAA** | Enhanced accessibility | Nice to have |

---

## Vibecoding failure patterns

These are the specific bugs that show up over and over in AI-generated component-library codebases (shadcn/Radix/Base UI-style primitives, Next.js App Router, form-heavy internal tools). Each was found and fixed in a real production audit — not theoretical. Check these **first**, and check the *shared component*, not just individual pages — one fix at the source usually cascades to every consumer.

### 1. The `Field`/`Label` wrapper that never wires `htmlFor`

The single most common defect. Vibecoded forms almost always get a little local helper like:

```tsx
// ❌ Visually correct, programmatically disconnected
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
```

It looks right, it reads right, and it fails 100% of the time for screen readers — NVDA announces the input as bare "edit, blank" because `<Label>` and the control are unrelated DOM siblings. This is trivially invisible to a sighted developer because the visual proximity does all the communicating that `htmlFor`/`id` is supposed to do.

**Fix once, at the helper, not at each of its dozens of call sites:**

```tsx
// ✅ useId() + cloneElement wires every consumer automatically
import { cloneElement, useId } from "react";
import type { ReactElement } from "react";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactElement<{ id?: string; required?: boolean }>;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {cloneElement(children, { id, required })}
    </div>
  );
}
```

This only works when `Field` always wraps exactly **one** child element (the common case). If a call site ever needs to wrap two elements (e.g. input + hint text), that call site needs an explicit `id`/`htmlFor` pair instead of relying on the clone.

If there's no shared `Field` helper — labels and inputs are just written inline everywhere — grep for every `<Label` in the codebase and check each one has a matching `htmlFor`. For custom select/combobox components that don't wrap a native `<label>`-compatible element (see #3), thread `id`/`aria-label`/`aria-labelledby` all the way through to the actual focusable trigger element, not just the outer wrapper div.

**Placeholder-only fields:** `<Input placeholder="Search…" />` with no adjacent visible label at all needs `aria-label`, not just a design pass — placeholder text disappears once a value is typed and was never a reliable accessible name to begin with.

### 2. Decorative icons need `aria-hidden` at the *call site*, not just "usually"

Icon libraries (lucide-react, heroicons) render bare `<svg>` with no default `aria-hidden`. A codebase that's 95% disciplined about adding `aria-hidden` to decorative icons will still have a handful of stragglers — new components added later, or one-off inline icons that didn't go through the reviewed pattern. This causes duplicate/confusing announcements when the icon sits next to text that already names the control (mild) or a completely unlabeled control when the icon is the *only* content of a button (severe — see #4). Grep for `<IconName` usages next to buttons/links and spot-check for `aria-hidden`.

### 3. Custom Select/Combobox/Dropdown components silently drop native semantics

A hand-rolled `SearchableSelect` (Popover + Command list, common in shadcn-style codebases) looks and behaves like a `<select>` but isn't one. Three things reliably go missing when a team builds this from scratch:

- **No `id`/`aria-label` passthrough on the trigger** — so it can't be labeled by the pattern in #1 at all, even after you fix `Field`. Add `id`, `aria-label`, `aria-labelledby` to the component's public props and forward them to the actual focusable trigger element.
- **Multi-select "checked" state exposed only via a custom `data-*` attribute** (e.g. `data-checked`) instead of `aria-selected`/`aria-checked`. `data-*` attributes are invisible to assistive tech — only ARIA state attributes are exposed to the accessibility tree. Add `aria-selected={checked}` (or `aria-checked` for a checkbox-style item) alongside whatever visual state attribute already exists.
- **A live "N selected" counter with no `aria-live`** — sighted users see the count update as they check items; screen-reader users get nothing unless they manually re-navigate to that text. Wrap it in `aria-live="polite"`.

### 4. Icon-only buttons with zero accessible name

Always present in bulk in any codebase with many icon-triggered actions (delete, remove, edit rows). The 95% case is fine (`aria-label="Delete X"` is a well-known pattern most assistants apply consistently) but the 5% of stragglers — usually added later, in a rush, or copy-pasted from a bare `<Trash2 />` in a scratch file — slip through every time. **Grep for icon-only button patterns app-wide** (`<Button size="icon"` / bare `<button>` containing only an SVG-returning component and no text) and check every single match, not just the ones in files you were already going to touch.

### 5. Shared `Table`/list components don't default `scope="col"`

```tsx
// ❌ Every table built from this wrapper is missing header/cell association
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("...", className)} {...props} />;
}

// ✅ One-line fix, cascades to every consumer instantly
function TableHead({ className, scope = "col", ...props }: React.ComponentProps<"th">) {
  return <th scope={scope} className={cn("...", className)} {...props} />;
}
```
Default the prop, don't just document that consumers should pass it — they won't, consistently. Same logic applies to any other structural default a shared primitive should provide (e.g. a `Dialog`/`Sheet` wrapper should arguably warn/throw in dev if rendered without a `Title` child, the way Radix does — check whether your headless UI library enforces this before assuming it's covered).

### 6. `<div onClick>` instead of a real button, especially in canvas/graph/custom-layout views

Standard list/card views usually get this right (the assistant reaches for `<button>` or adds `role="button"` + `tabIndex={0}` + `onKeyDown` for Enter/Space). The place it reliably gets missed is in visually custom layouts — a canvas-positioned node, a drag-and-drop board, a chart annotation — where elements are absolutely positioned `<div>`s and the interactive-semantics boilerplate feels like it "doesn't fit" the layout code. It's needed exactly the same way there. If you find the correct pattern used elsewhere in the same codebase (e.g. a list view of the same data does it right), copy that pattern verbatim rather than reinventing it — this is a strong signal the codebase already has a working, reviewed reference implementation.

```tsx
// ✅ The reusable pattern, works identically whether the div is in a list or absolutely positioned in a canvas
<div
  role="button"
  tabIndex={0}
  aria-label={`Open ${item.name}`}
  onClick={() => onSelect(item.id)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(item.id);
    }
  }}
  className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
  style={{ left: x, top: y }} // positioning doesn't change the semantics needed
>
```

### 7. Color-only status indicators with a `title` attribute as the "accessible" fallback

```tsx
// ❌ title is not reliably read by screen readers, and this span isn't even focusable
<span className={`size-2.5 rounded-full ${DOT_COLOR[status]}`} title={status} />
```
`title` is a mouse-hover tooltip, not a screen-reader API — NVDA support for it is inconsistent even on focusable elements, and this span isn't focusable at all. If a UI packs multiple pieces of state into a compact visual (a week-strip of colored dots, a heatmap cell, a status chip that's just a colored square), give it real accessible text:

```tsx
// ✅ visual stays identical, adds a genuine text alternative
<div title={statusText}>
  <span aria-hidden className={`size-2.5 rounded-full ${DOT_COLOR[status]}`} />
  <span className="sr-only">{`${dayName}: ${statusText}`}</span>
</div>
```

### 8. AI chat / async-response UIs with no live region

Any "ask a question, get a streamed or async answer" panel (AI copilot, search-as-you-type results, policy Q&A) needs the response container itself — not just the input — wired for announcement:

```tsx
// ✅ role="log" for a running conversation, role="status" for a single-shot answer
<div role="log" aria-live="polite" aria-label="Conversation with AI assistant">
  {messages.map(m => (
    <div key={m.id}>
      <span className="sr-only">{m.role === "user" ? "You: " : "Assistant: "}</span>
      {m.text}
    </div>
  ))}
</div>
{busy && <div role="status">Thinking…</div>}
```
Without this, a screen-reader user asks a question, waits, and gets zero auditory confirmation a reply arrived — they have to guess when to go check.

### 9. `aria-label` on a plain `<div>` used as a loading placeholder

```tsx
// ❌ aria-label alone does not create a live announcement — this is silently never read
<div aria-label="Loading page">{skeletons}</div>

// ✅ role + aria-live actually gets announced when it mounts
<div role="status" aria-live="polite" aria-label="Loading page">{skeletons}</div>
```
`aria-label` gives an element a *name* if something else queries it or it receives focus; it does not by itself make a *live region*. A loading skeleton, a "loading navigation" placeholder, any transient status div — needs `role="status"`/`role="alert"` (or to live inside a `Toaster`-style component that already provides this) or it is functionally invisible to NVDA.

### 10. Every route sharing one static `<title>` in Next.js App Router

If pages are Client Components (`"use client"` at the top — very common in a vibecoded dashboard app because state/hooks are used immediately), they **cannot** export `metadata`/`generateMetadata` — that only works in Server Components. The symptom: `app/layout.tsx` sets one static title and it never changes across ~20+ routes, so NVDA's "read title" / Alt+Tab / browser-history announcements never distinguish Dashboard from Settings from Billing.

Don't restructure every page into a server/client split just to fix this — add a two-line hook instead:

```tsx
// lib/use-page-title.ts
"use client";
import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · My App`;
    return () => { document.title = previous; };
  }, [title]);
}
```
```tsx
// in every page.tsx
usePageTitle("Dashboard");
```

### 11. Heading level skipped straight to h3 (or h1 missing entirely below a breakpoint)

Two recurring sub-patterns:
- A shared `PageHeader` component renders the page's one `<h1>`, and then some section further down the same page renders an `<h3>` directly, with no `<h2>` in between — because whoever wrote that section wasn't thinking about the page's heading tree, just "this text should look like a smaller heading." Fix: use `<h2>` for the first level of in-page section headings, reserve `<h3>` for a level below that.
- A responsive layout puts the page's only `<h1>` inside a `hidden lg:flex` (or similar `display: none` breakpoint) container meant for a decorative desktop-only panel. `display: none` fully removes the element from the accessibility tree — it's not just visually hidden, so mobile viewport users get **no h1 at all**. Fix: make sure the one heading that describes "what this page is for" renders unconditionally (e.g. promote the always-visible secondary heading to `<h1>`, and demote the marketing-only decorative headline to a styled `<p>` since it doesn't need to be a heading semantically anyway).

---

## Perceivable

### Text alternatives (1.1)

**Images require alt text:**
```html
<!-- ❌ Missing alt -->
<img src="chart.png">

<!-- ✅ Descriptive alt -->
<img src="chart.png" alt="Bar chart showing 40% increase in Q3 sales">

<!-- ✅ Decorative image (empty alt) -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- ✅ Complex image with longer description -->
<figure>
  <img src="infographic.png" alt="2024 market trends infographic" 
       aria-describedby="infographic-desc">
  <figcaption id="infographic-desc">
    <!-- Detailed description -->
  </figcaption>
</figure>
```

**Icon buttons need accessible names:**
```html
<!-- ❌ No accessible name -->
<button><svg><!-- menu icon --></svg></button>

<!-- ✅ Using aria-label -->
<button aria-label="Open menu">
  <svg aria-hidden="true"><!-- menu icon --></svg>
</button>

<!-- ✅ Using visually hidden text -->
<button>
  <svg aria-hidden="true"><!-- menu icon --></svg>
  <span class="visually-hidden">Open menu</span>
</button>
```

**Visually hidden class:**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Color contrast (1.4.3, 1.4.6)

| Text Size | AA minimum | AAA enhanced |
|-----------|------------|--------------|
| Normal text (< 18px / < 14px bold) | 4.5:1 | 7:1 |
| Large text (≥ 18px / ≥ 14px bold) | 3:1 | 4.5:1 |
| UI components & graphics | 3:1 | 3:1 |

```css
/* ❌ Low contrast (2.5:1) */
.low-contrast {
  color: #999;
  background: #fff;
}

/* ✅ Sufficient contrast (7:1) */
.high-contrast {
  color: #333;
  background: #fff;
}

/* ✅ Focus states need contrast too (3:1 against background, WCAG 1.4.11) */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

**Don't rely on color alone:**
```html
<!-- ❌ Only color indicates error -->
<input class="error-border">
<style>.error-border { border-color: red; }</style>

<!-- ✅ Color + icon + text -->
<div class="field-error">
  <input aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" class="error-message">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Please enter a valid email address
  </span>
</div>
```

### Media alternatives (1.2)

```html
<!-- Video with captions -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default>
  <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Descriptions">
</video>

<!-- Audio with transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mp3">
</audio>
<details>
  <summary>Transcript</summary>
  <p>Full transcript text...</p>
</details>
```

---

## Operable

### Keyboard accessible (2.1)

**All functionality must be keyboard accessible.** Prefer native interactive elements — `<button>`, `<a href>`, and form controls handle Enter/Space activation, focus, and assistive-tech semantics for free. Only add manual keyboard handling when you cannot use a native element.

```html
<!-- ❌ Non-interactive element with click only: not focusable, no keyboard activation -->
<div class="card" onclick="handleAction()">Open</div>

<!-- ✅ Best: use a native button -->
<button type="button" onclick="handleAction()">Open</button>
```

```javascript
// ✅ When you MUST use a non-interactive element (e.g. div with role="button"),
// make it focusable AND handle keyboard activation. Do NOT add this to a native
// <button> — Enter/Space already fire click, so you'd double-trigger.
element.setAttribute('role', 'button');
element.setAttribute('tabindex', '0');
element.addEventListener('click', handleAction);
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
});
```

**No keyboard traps.** Users must be able to Tab into and out of every component. Use the [modal focus trap pattern](references/A11Y-PATTERNS.md#modal-focus-trap) for dialogs—the native `<dialog>` element handles this automatically.

### Focus visible (2.4.7)

```css
/* ❌ Never remove focus outlines */
*:focus { outline: none; }

/* ✅ Use :focus-visible for keyboard-only focus */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid currentColor; /* inherits text color → already contrast-checked */
  outline-offset: 2px;
}

/* ✅ Or pick a brand color and verify ≥3:1 contrast against every background it lands on */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
}
```

### Focus not obscured (2.4.11) — new in 2.2

When an element receives keyboard focus, it must not be entirely hidden by other author-created content such as sticky headers, footers, or overlapping panels. At Level AAA (2.4.12), no part of the focused element may be hidden.

```css
/* ✅ Account for sticky headers when scrolling to focused elements */
:target {
  scroll-margin-top: 80px;
}

/* ✅ Ensure focused items clear fixed/sticky bars */
:focus {
  scroll-margin-top: 80px;
  scroll-margin-bottom: 60px;
}
```

### Skip links (2.4.1)

Provide a skip link so keyboard users can bypass repetitive navigation. See the [skip link pattern](references/A11Y-PATTERNS.md#skip-link) for full markup and styles.

### Target size (2.5.8) — new in 2.2

Interactive targets must be at least **24 × 24 CSS pixels** (AA). Exceptions: inline text links, elements where the browser controls the size, and targets where a 24px circle centered on the bounding box does not overlap another target.

```css
/* ✅ Minimum target size */
button,
[role="button"],
input[type="checkbox"] + label,
input[type="radio"] + label {
  min-width: 24px;
  min-height: 24px;
}

/* ✅ Comfortable target size (recommended 44×44) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### Dragging movements (2.5.7) — new in 2.2

Any action that requires dragging must have a single-pointer alternative (e.g., buttons, inputs). See the [dragging movements pattern](references/A11Y-PATTERNS.md#dragging-movements) for a sortable-list example.

### Timing (2.2)

```javascript
// Allow users to extend time limits
function showSessionWarning() {
  const modal = createModal({
    title: 'Session Expiring',
    content: 'Your session will expire in 2 minutes.',
    actions: [
      { label: 'Extend session', action: extendSession },
      { label: 'Log out', action: logout }
    ],
    timeout: 120000
  });
}
```

### Motion (2.3)

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Understandable

### Page language (3.1.1)

```html
<!-- ❌ No language specified -->
<html>

<!-- ✅ Language specified -->
<html lang="en">

<!-- ✅ Language changes within page -->
<p>The French word for hello is <span lang="fr">bonjour</span>.</p>
```

### Consistent navigation (3.2.3)

```html
<!-- Navigation should be consistent across pages -->
<nav aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### Consistent help (3.2.6) — new in 2.2

If a help mechanism (contact info, chat widget, FAQ link, self-help option) is repeated across multiple pages, it must appear in the **same relative order** each time. Users who rely on consistent placement shouldn't have to hunt for help on every page.

### Form labels (3.3.2)

Every input needs a programmatically associated label. See the [form labels pattern](references/A11Y-PATTERNS.md#form-labels) for explicit, implicit, and instructional examples.

### Error handling (3.3.1, 3.3.3)

Announce errors to screen readers with `role="alert"` or `aria-live`, set `aria-invalid="true"` on invalid fields, and focus the first error on submit. See the [error handling pattern](references/A11Y-PATTERNS.md#error-handling) for full markup and JS.

### Redundant entry (3.3.7) — new in 2.2

Don't force users to re-enter information they already provided in the same session. Auto-populate from earlier steps, or let users select from previously entered values. Exceptions: security re-confirmation and content that has expired.

```html
<!-- ✅ Auto-fill shipping address from billing -->
<fieldset>
  <legend>Shipping address</legend>
  <label>
    <input type="checkbox" id="same-as-billing" checked>
    Same as billing address
  </label>
  <!-- Fields auto-populated when checked -->
</fieldset>
```

### Accessible authentication (3.3.8) — new in 2.2

Login flows must not rely on cognitive function tests (e.g., remembering a password, solving a puzzle) unless at least one of:
- A copy-paste or autofill mechanism is available
- An alternative method exists (e.g., passkey, SSO, email link)
- The test uses object recognition or personal content (AA only; AAA removes this exception)

```html
<!-- ✅ Allow paste in password fields -->
<input type="password" id="password" autocomplete="current-password">

<!-- ✅ Offer passwordless alternatives -->
<button type="button">Sign in with passkey</button>
<button type="button">Email me a login link</button>
```

---

## Robust

### ARIA usage (4.1.2)

**Prefer native elements:**
```html
<!-- ❌ ARIA role on div -->
<div role="button" tabindex="0">Click me</div>

<!-- ✅ Native button -->
<button>Click me</button>

<!-- ❌ ARIA checkbox -->
<div role="checkbox" aria-checked="false">Option</div>

<!-- ✅ Native checkbox -->
<label><input type="checkbox"> Option</label>
```

**When ARIA is needed,** use the correct roles and states. See the [ARIA tabs pattern](references/A11Y-PATTERNS.md#aria-tabs) for a complete tablist example.

### Live regions (4.1.3)

Use `aria-live` regions to announce dynamic content changes without moving focus. See the [live regions pattern](references/A11Y-PATTERNS.md#live-regions-and-notifications) for markup and a `showNotification()` helper.

---

## Testing checklist

### Automated testing
```bash
# Lighthouse accessibility audit
npx lighthouse https://example.com --only-categories=accessibility

# axe-core
npm install @axe-core/cli -g
axe https://example.com
```

### Manual testing

- [ ] **Keyboard navigation:** Tab through entire page, use Enter/Space to activate
- [ ] **Screen reader:** Test with VoiceOver (Mac), NVDA (Windows), or TalkBack (Android)
- [ ] **Zoom:** Content usable at 200% zoom
- [ ] **High contrast:** Test with Windows High Contrast Mode
- [ ] **Reduced motion:** Test with `prefers-reduced-motion: reduce`
- [ ] **Focus order:** Logical and follows visual order
- [ ] **Target size:** Interactive elements meet 24×24px minimum

See the [screen reader commands reference](references/A11Y-PATTERNS.md#screen-reader-commands) for VoiceOver and NVDA shortcuts.

---

## Common issues by impact

### Critical (fix immediately)
1. Missing form labels (see [Vibecoding failure patterns #1](#vibecoding-failure-patterns))
2. Missing image alt text / unlabeled icon-only buttons ([#4](#vibecoding-failure-patterns))
3. Insufficient color contrast
4. Keyboard traps / non-interactive `<div onClick>` ([#6](#vibecoding-failure-patterns))
5. No focus indicators
6. Data conveyed only by color with an inaccessible fallback ([#7](#vibecoding-failure-patterns))
7. Async responses (AI chat, live search) with no live region ([#8](#vibecoding-failure-patterns))

### Serious (fix before launch)
1. Missing page language
2. Every route sharing one static page title ([#10](#vibecoding-failure-patterns))
3. Missing/skipped heading structure ([#11](#vibecoding-failure-patterns))
4. Non-descriptive link text
5. Auto-playing media
6. Missing skip links
7. Shared component missing a structural default (e.g. `scope="col"`) ([#5](#vibecoding-failure-patterns))

### Moderate (fix soon)
1. Missing ARIA labels on icons ([#2](#vibecoding-failure-patterns))
2. Inconsistent navigation
3. Missing error identification
4. Timing without controls
5. Missing landmark regions
6. Custom select/combobox losing native semantics ([#3](#vibecoding-failure-patterns))
7. `aria-label` on a non-live-region loading placeholder ([#9](#vibecoding-failure-patterns))

## How to run this audit on a codebase

1. **Read every shared UI primitive first** (`Table`, `Select`/`Combobox`, `Dialog`/`Sheet`, `Button`, form `Field` helpers, `Toast`/`Skeleton`). Fixing a default here fixes every consumer — do this before touching individual pages.
2. **Grep, don't skim.** For each pattern in this file, search the whole codebase rather than relying on spot checks: every `<Label`, every icon-only button (`size="icon"` or bare `<button>` wrapping only an SVG), every `<div onClick`, every `title=` used as the sole non-visual signal, every `outline-none` (confirm each is paired with a `focus-visible` replacement, never bare).
3. **Cross-reference "this pattern done right" against "this pattern done wrong" in the same codebase.** Vibecoded apps are rarely uniformly bad — usually one view (e.g. a list) implements a pattern correctly and a sibling view (e.g. a canvas/graph) doesn't. Find the good implementation first and reuse it verbatim.
4. **Map every finding to a WCAG 2.2 success criterion and a concrete assistive-tech impact** ("NVDA announces X" / "a keyboard-only user cannot reach Y"), not just "this seems bad." See [WCAG.md](references/WCAG.md) for the full criteria table.
5. **Rank Critical / Serious / Moderate** using the "Common issues by impact" list above as the starting taxonomy, then fix Critical shared-component issues first (highest fix-to-impact ratio), then Serious per-page issues, then Moderate polish.
6. **Verify with real assistive tech, not just axe/Lighthouse.** Automated tools catch missing `alt`/`aria-label`/contrast reliably but cannot detect a live region that never fires, a `Field` wrapper that silently fails to link `htmlFor`, or a `data-*` attribute masquerading as ARIA state. A short manual NVDA (Windows, free) or VoiceOver (Mac, built-in) pass through the core flows — sign-in, the main data-entry form, the primary list/table view — catches what automation misses.

## References

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Deque axe Rules](https://dequeuniversity.com/rules/axe/)
- [Web Quality Audit](../web-quality-audit/SKILL.md)
- [WCAG criteria reference](references/WCAG.md)
- [Accessibility code patterns](references/A11Y-PATTERNS.md)
