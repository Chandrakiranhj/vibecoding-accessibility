# Accessibility Code Patterns

Use these patterns when implementing concrete fixes. Prefer native HTML and mature component-library primitives before hand-rolled ARIA.

## Visually Hidden Text

```css
.sr-only {
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

## Skip Link

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>...</header>
  <main id="main-content" tabindex="-1">...</main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(-120%);
  z-index: 1000;
  padding: 0.5rem 1rem;
  background: #000;
  color: #fff;
}

.skip-link:focus {
  transform: translateY(0);
}
```

## Form Labels

```html
<!-- Bad: placeholder only -->
<input type="email" placeholder="Email" />

<!-- Good: explicit label -->
<label for="email">Email address</label>
<input id="email" name="email" type="email" autocomplete="email" required />

<!-- Good: label plus hint -->
<label for="password">Password</label>
<input
  id="password"
  name="password"
  type="password"
  autocomplete="current-password"
  aria-describedby="password-hint"
/>
<p id="password-hint">Use at least 12 characters.</p>
```

For grouped controls, use `fieldset` and `legend`.

```html
<fieldset>
  <legend>Notification preference</legend>
  <label><input type="radio" name="notify" value="email" /> Email</label>
  <label><input type="radio" name="notify" value="sms" /> SMS</label>
</fieldset>
```

## Error Summary And Field Errors

```html
<div id="error-summary" tabindex="-1" role="alert" aria-labelledby="error-title">
  <h2 id="error-title">Fix 2 errors before continuing</h2>
  <ul>
    <li><a href="#email">Enter a valid email address.</a></li>
    <li><a href="#password">Enter your password.</a></li>
  </ul>
</div>

<label for="email">Email address</label>
<input
  id="email"
  name="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error">Enter a valid email address, such as name@example.com.</p>
```

```js
function focusErrorSummary(errors) {
  const summary = document.getElementById("error-summary");
  if (!summary || errors.length === 0) return;

  const title = summary.querySelector("#error-title");
  if (title) {
    title.textContent = `Fix ${errors.length} ${errors.length === 1 ? "error" : "errors"} before continuing`;
  }

  summary.focus();
}
```

Set focus to the summary on submit when multiple fields fail. If there is only one failing field, focusing that field can be acceptable when the error text is connected with `aria-describedby`.

## Live Regions And Notifications

```html
<div id="polite-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<div id="assertive-announcer" class="sr-only" aria-live="assertive" aria-atomic="true"></div>
```

```js
function announce(message, urgency = "polite") {
  const id = urgency === "assertive" ? "assertive-announcer" : "polite-announcer";
  const container = document.getElementById(id);
  if (!container) return;

  container.textContent = "";
  window.requestAnimationFrame(() => {
    container.textContent = message;
  });
}
```

Use `role="status"` for non-urgent status and `role="alert"` for urgent errors. Do not overuse assertive announcements.

## Modal Dialog

Prefer a tested dialog primitive or native `<dialog>` where it fits the project. A custom modal needs:

- `role="dialog"` or `role="alertdialog"`;
- `aria-modal="true"`;
- `aria-labelledby` pointing to the visible title;
- initial focus moved into the dialog;
- Escape support unless the workflow has a strong reason to block it;
- focus returned to the opener when the dialog closes.

```js
function openModal(dialog, opener = document.activeElement) {
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const focusable = Array.from(dialog.querySelectorAll(focusableSelector));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(dialog, opener, onKeyDown);
      return;
    }

    if (event.key !== "Tab" || focusable.length === 0) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  dialog.hidden = false;
  dialog.addEventListener("keydown", onKeyDown);
  (first ?? dialog).focus();
}

function closeModal(dialog, opener, onKeyDown) {
  dialog.hidden = true;
  dialog.removeEventListener("keydown", onKeyDown);
  if (opener && typeof opener.focus === "function") {
    opener.focus();
  }
}
```

Give the dialog container `tabindex="-1"` if it may need to receive focus when no focusable child exists.

## Tabs

Use the WAI-ARIA APG tabs pattern for full behavior. Minimum structure:

```html
<div role="tablist" aria-label="Product information">
  <button role="tab" id="tab-description" aria-selected="true" aria-controls="panel-description">
    Description
  </button>
  <button role="tab" id="tab-reviews" aria-selected="false" aria-controls="panel-reviews" tabindex="-1">
    Reviews
  </button>
</div>

<section role="tabpanel" id="panel-description" aria-labelledby="tab-description">
  ...
</section>
<section role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" hidden>
  ...
</section>
```

Required keyboard behavior:

- Tab moves into and out of the tablist.
- Left/Right move focus between horizontal tabs.
- Up/Down move focus between vertical tabs.
- Home/End may move to first/last tab.
- Space or Enter activates a tab when activation does not follow focus automatically.

## Dragging Alternatives

Any drag-only action needs a single-pointer and keyboard-accessible alternative.

```html
<ul>
  <li>
    <span>Item 1</span>
    <button type="button" aria-label="Move Item 1 up">Move up</button>
    <button type="button" aria-label="Move Item 1 down">Move down</button>
  </li>
  <li>
    <span>Item 2</span>
    <button type="button" aria-label="Move Item 2 up">Move up</button>
    <button type="button" aria-label="Move Item 2 down">Move down</button>
  </li>
</ul>
```

Apply the same principle to sliders, map panning, color pickers, canvas tools, and sortable boards.

## Screen Reader Smoke Test

Common shortcuts:

| Action | VoiceOver macOS | NVDA Windows |
| --- | --- | --- |
| Start or stop | Command + F5 | Ctrl + Alt + N |
| Next item | VO + Right Arrow | Down Arrow |
| Previous item | VO + Left Arrow | Up Arrow |
| Activate | VO + Space | Enter |
| Headings list | VO + U | Insert + F7, then headings |
| Links list | VO + U | Insert + F7, then links |

Smoke-test at least: page title, headings, labels, errors, table headers, dialog open/close, custom select operation, toast/status messages, loading states, and async AI responses.
