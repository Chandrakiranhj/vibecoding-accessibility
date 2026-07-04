---
name: vibecoding-accessibility
description: Audit and fix web accessibility in AI-generated web apps, especially React, Next.js, shadcn/Radix-style component libraries, dashboards, forms, tables, custom selects, AI chat panels, and keyboard-heavy interfaces. Use when asked to improve accessibility, run an a11y audit, meet WCAG 2.2, improve screen reader support, test NVDA/VoiceOver behavior, fix keyboard navigation, add accessible names, repair form labels, or make a UI accessible.
---

# Vibecoding Accessibility

Audit and fix accessibility bugs that AI-generated apps commonly ship. Prioritize shared UI primitives before individual pages: one fix in a `Field`, `Table`, `Select`, `Dialog`, `Toast`, or `Skeleton` component often fixes dozens of call sites.

## Use The References

- Read `references/A11Y-PATTERNS.md` when implementing a concrete pattern such as form labels, skip links, modals, tabs, error summaries, live regions, or drag alternatives.
- Read `references/WCAG.md` when mapping a finding to WCAG 2.2 or when the user asks about compliance level.
- Prefer the project's existing component patterns and accessibility helpers when they already solve the same problem correctly.

## Audit Workflow

1. Inspect shared UI primitives first: form helpers, labels, inputs, selects, comboboxes, buttons, tables, dialogs, sheets, toasts, skeletons, tabs, menus, and layout shells.
2. Grep the whole codebase for the patterns below. Do not rely on page-by-page skimming.
3. Fix source components before call sites when the bug is caused by a reusable default.
4. Map each finding to user impact and, when useful, to a WCAG 2.2 criterion.
5. Verify with keyboard navigation, browser accessibility tooling, and at least one screen reader pass on the core flows.

Suggested searches:

```bash
rg "<Label|<label|placeholder=" .
rg "size=.icon.|aria-label|<button|<Button" .
rg "onClick=|onclick=" .
rg "title=|outline-none|aria-live|role=.status|role=.alert" .
rg "<th|TableHead|<Dialog|<Sheet|<Select|Combobox|CommandItem" .
```

## Vibecoding Failure Patterns

### 1. Field wrappers that never connect labels

AI-generated forms often have a helper that renders a label beside a control but never links them.

```tsx
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
```

Fix the helper once when it always wraps a single React element. Preserve existing ids and require custom input components to forward `id` to the real focusable element.

```tsx
import { cloneElement, useId } from "react";
import type { ReactElement } from "react";

type FieldChildProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactElement<FieldChildProps>;
}) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </Label>
      {cloneElement(children, { id, required })}
    </div>
  );
}
```

Use explicit `id`/`htmlFor` pairs for multi-control fields, grouped controls, fields with hint/error text, or components that do not accept a single focusable child. Placeholder-only fields need a visible label or an `aria-label`; placeholder text is not a reliable accessible name.

### 2. Decorative icons leak into the accessibility tree

Icon libraries often render plain SVG. Add `aria-hidden="true"` to decorative icons at the call site, especially inside buttons and links that already have text.

```tsx
<Button>
  <Save aria-hidden="true" />
  Save
</Button>
```

When an icon is the only visible content, give the button or link an accessible name.

```tsx
<Button size="icon" aria-label="Delete invoice">
  <Trash2 aria-hidden="true" />
</Button>
```

### 3. Custom selects and comboboxes drop native semantics

Hand-rolled `Popover` + `Command` selects are not native `<select>` elements. Check that they:

- forward `id`, `aria-label`, and `aria-labelledby` to the actual focusable trigger;
- expose selection with `aria-selected` or `aria-checked`, not only `data-*`;
- announce changing counts such as "3 selected" with `aria-live="polite"`;
- implement the keyboard behavior expected by their role.

Use native `<select>` unless the custom behavior is truly needed.

### 4. Icon-only buttons have no accessible name

Search every icon-only pattern, including `size="icon"` and bare buttons wrapping SVGs. Each needs `aria-label`, `aria-labelledby`, or visually hidden text. Make labels specific: "Delete Priya Rao" is better than "Delete".

### 5. Table wrappers omit structural defaults

Shared table primitives should provide safe defaults.

```tsx
function TableHead({
  className,
  scope = "col",
  ...props
}: React.ComponentProps<"th">) {
  return <th scope={scope} className={cn("...", className)} {...props} />;
}
```

Use `scope="row"` for row headers. For complex tables, use explicit header associations and verify with a screen reader.

### 6. Clickable divs replace native controls

Prefer native controls.

```tsx
<button type="button" onClick={() => onSelect(item.id)}>
  Open {item.name}
</button>
```

Only use `role="button"` on a non-interactive element when a native element cannot work. Then add focusability, keyboard activation, an accessible name, and a visible focus style.

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Open ${item.name}`}
  onClick={() => onSelect(item.id)}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(item.id);
    }
  }}
  className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  {item.name}
</div>
```

Do not add this manual keyboard handler to native buttons; it can double-trigger.

### 7. Color-only status uses `title` as the fallback

`title` is not a dependable screen reader alternative, especially on non-focusable elements. Keep the visual dot decorative and add real text.

```tsx
<div title={statusText}>
  <span aria-hidden="true" className={cn("size-2.5 rounded-full", dotClass)} />
  <span className="sr-only">{`${dayName}: ${statusText}`}</span>
</div>
```

Also provide visible text when space allows.

### 8. AI chat and async answers do not announce updates

Dynamic answers need a live region. Use `role="log"` for conversations and `role="status"` for single status updates.

```tsx
<div role="log" aria-live="polite" aria-label="Conversation">
  {messages.map((message) => (
    <div key={message.id}>
      <span className="sr-only">
        {message.role === "user" ? "You: " : "Assistant: "}
      </span>
      {message.text}
    </div>
  ))}
</div>
{busy ? <div role="status">Thinking...</div> : null}
```

Avoid announcing every streamed token if it becomes noisy. Announce meaningful chunks or completion.

### 9. Loading placeholders have names but no live behavior

`aria-label` alone does not announce a mounted loading skeleton. Use a status role or an existing toaster/status system.

```tsx
<div role="status" aria-live="polite" aria-label="Loading page">
  {skeletons}
</div>
```

### 10. Routes share one static page title

Prefer Next.js `metadata` or `generateMetadata` in server pages and layouts. If a page must be a client component, use a small client hook rather than restructuring the app only to set the title.

```tsx
"use client";

import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} - My App`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
```

### 11. Heading structure breaks across responsive layouts

Check for missing `h1`, skipped levels, and headings hidden with responsive `display: none`. The page's primary heading should exist at every viewport. Use CSS classes for visual size; do not pick `h3` just because it looks smaller.

## Core Fix Checklist

- Forms: every input has a programmatically associated label; hints and errors use `aria-describedby`; invalid fields use `aria-invalid`.
- Buttons and links: every control has a name, uses a native element where possible, and has visible focus.
- Keyboard: all interactive behavior works with Tab, Shift+Tab, Enter, Space, Escape, and arrow keys where the widget pattern requires them.
- Dynamic UI: loading, errors, toasts, async answers, and selection counts announce appropriately.
- Visual information: color, position, icon shape, and animation are not the only way information is conveyed.
- Layout: pages have descriptive titles, one meaningful `h1`, landmarks, skip links for repeated navigation, logical focus order, and no focus obstruction by sticky UI.
- Media and images: informative images have useful alt text; decorative images use empty alt; audio/video have captions, transcripts, or descriptions as appropriate.

## Verification

Run automated checks, but treat them as a floor.

```bash
npx lighthouse http://localhost:3000 --only-categories=accessibility
npx @axe-core/cli http://localhost:3000
```

Manual pass:

- Navigate the main flows with keyboard only.
- Test at 200% zoom and narrow viewport width.
- Check visible focus against sticky headers, drawers, and modals.
- Test with NVDA on Windows, VoiceOver on macOS/iOS, or TalkBack on Android.
- Confirm screen reader output for forms, custom selects, tables, dialogs, toasts, loading states, and AI responses.

## Severity Guide

Critical:

- Unlabeled form controls or icon-only controls.
- Keyboard traps or unreachable interactive UI.
- Missing focus indicator.
- Data conveyed only by color.
- Async responses or errors that are invisible to assistive technology.

Serious:

- Static or misleading page titles.
- Missing `h1`, skipped heading structure, or hidden primary heading.
- Non-descriptive links.
- Missing skip links or landmarks in navigation-heavy apps.
- Shared primitives with broken structural defaults.

Moderate:

- Decorative icons not hidden.
- Inconsistent navigation or help placement.
- Missing target-size checks.
- Custom widgets missing expected ARIA states.
- Loading placeholders named but not announced.
