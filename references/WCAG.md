# WCAG 2.2 Reference

Use this as a compact mapping aid. For normative wording and techniques, use the W3C WCAG 2.2 Recommendation and Quick Reference.

Last verified against the W3C WCAG 2.2 Recommendation on 2026-07-04.

## Principles

- Perceivable: users can perceive the content.
- Operable: users can operate the interface.
- Understandable: users can understand the content and interactions.
- Robust: content works with assistive technologies.

## Level A

| Criterion | Name | Practical check |
| --- | --- | --- |
| 1.1.1 | Non-text Content | Images, icons, and controls have text alternatives or are marked decorative. |
| 1.2.1 | Audio-only and Video-only | Prerecorded audio/video-only media has an alternative. |
| 1.2.2 | Captions | Prerecorded video with audio has captions. |
| 1.2.3 | Audio Description or Media Alternative | Prerecorded video has audio description or media alternative. |
| 1.3.1 | Info and Relationships | Structure conveyed visually is programmatic. |
| 1.3.2 | Meaningful Sequence | Reading and focus sequence preserve meaning. |
| 1.3.3 | Sensory Characteristics | Instructions do not rely only on shape, size, position, orientation, or sound. |
| 1.4.1 | Use of Color | Color is not the only way information is conveyed. |
| 1.4.2 | Audio Control | Auto-playing audio can be paused or stopped. |
| 2.1.1 | Keyboard | All functionality works with keyboard. |
| 2.1.2 | No Keyboard Trap | Focus can move into and out of components. |
| 2.1.4 | Character Key Shortcuts | Single-character shortcuts can be disabled, remapped, or limited to focus. |
| 2.2.1 | Timing Adjustable | Time limits can be extended, adjusted, or disabled. |
| 2.2.2 | Pause, Stop, Hide | Moving, blinking, scrolling, or auto-updating content can be controlled. |
| 2.3.1 | Three Flashes or Below Threshold | Content does not flash in a seizure-triggering way. |
| 2.4.1 | Bypass Blocks | Users can bypass repeated navigation. |
| 2.4.2 | Page Titled | Pages have descriptive titles. |
| 2.4.3 | Focus Order | Focus order preserves meaning and operability. |
| 2.4.4 | Link Purpose (In Context) | Link purpose is clear from text or context. |
| 2.5.1 | Pointer Gestures | Multipoint/path gestures have simpler alternatives. |
| 2.5.2 | Pointer Cancellation | Pointer actions can be cancelled or use up-event activation. |
| 2.5.3 | Label in Name | Accessible names include visible label text. |
| 2.5.4 | Motion Actuation | Motion-triggered functions have alternatives. |
| 3.1.1 | Language of Page | Default page language is set. |
| 3.2.1 | On Focus | Focus does not trigger unexpected context changes. |
| 3.2.2 | On Input | Input does not trigger unexpected context changes. |
| 3.2.6 | Consistent Help | Repeated help mechanisms appear in the same relative order. |
| 3.3.1 | Error Identification | Input errors are identified and described. |
| 3.3.2 | Labels or Instructions | Inputs have labels or instructions. |
| 3.3.7 | Redundant Entry | Previously entered information is reused or selectable when appropriate. |
| 4.1.2 | Name, Role, Value | UI components expose correct name, role, value, and state. |

## Level AA

| Criterion | Name | Practical check |
| --- | --- | --- |
| 1.2.4 | Captions (Live) | Live synchronized media has captions. |
| 1.2.5 | Audio Description | Prerecorded video has audio description. |
| 1.3.4 | Orientation | Content does not require one orientation unless essential. |
| 1.3.5 | Identify Input Purpose | Common input purposes are programmatically identifiable. |
| 1.4.3 | Contrast (Minimum) | Text contrast is at least 4.5:1, or 3:1 for large text. |
| 1.4.4 | Resize Text | Text can resize to 200% without loss of content or function. |
| 1.4.5 | Images of Text | Real text is used instead of images of text where possible. |
| 1.4.10 | Reflow | Content works at 320 CSS px width without two-dimensional scrolling except where necessary. |
| 1.4.11 | Non-text Contrast | UI components and meaningful graphics have at least 3:1 contrast. |
| 1.4.12 | Text Spacing | Content works when users override text spacing. |
| 1.4.13 | Content on Hover or Focus | Hover/focus content is dismissible, hoverable, and persistent. |
| 2.4.5 | Multiple Ways | Users have multiple ways to locate pages, except steps in a process. |
| 2.4.6 | Headings and Labels | Headings and labels describe topic or purpose. |
| 2.4.7 | Focus Visible | Keyboard focus indicator is visible. |
| 2.4.11 | Focus Not Obscured (Minimum) | Focused item is not entirely hidden by author-created content. |
| 2.5.7 | Dragging Movements | Dragging actions have a single-pointer alternative. |
| 2.5.8 | Target Size (Minimum) | Targets are at least 24 by 24 CSS px, with exceptions. |
| 3.1.2 | Language of Parts | Language changes are marked. |
| 3.2.3 | Consistent Navigation | Repeated navigation appears in consistent order. |
| 3.2.4 | Consistent Identification | Same-function components are identified consistently. |
| 3.3.3 | Error Suggestion | Known correction suggestions are provided. |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | Important submissions can be reversed, checked, or confirmed. |
| 3.3.8 | Accessible Authentication (Minimum) | Login does not require a cognitive test unless assistance or alternatives exist. |
| 4.1.3 | Status Messages | Status updates are programmatically determinable without moving focus. |

## Level AAA

| Criterion | Name | Practical check |
| --- | --- | --- |
| 1.2.6 | Sign Language | Prerecorded audio content has sign language interpretation. |
| 1.2.7 | Extended Audio Description | Extended audio description is available when needed. |
| 1.2.8 | Media Alternative | Prerecorded synchronized media has a media alternative. |
| 1.2.9 | Audio-only (Live) | Live audio-only content has an equivalent alternative. |
| 1.3.6 | Identify Purpose | UI component, icon, and region purposes can be programmatically identified where supported. |
| 1.4.6 | Contrast (Enhanced) | Text contrast is at least 7:1, or 4.5:1 for large text. |
| 1.4.7 | Low or No Background Audio | Speech audio has low/no background or controllable background. |
| 1.4.8 | Visual Presentation | Users can adapt foreground/background, width, alignment, and spacing. |
| 1.4.9 | Images of Text (No Exception) | Images of text are only decorative or essential. |
| 2.1.3 | Keyboard (No Exception) | All functionality works by keyboard with no timing exception. |
| 2.2.3 | No Timing | Timing is not essential to the activity. |
| 2.2.4 | Interruptions | Interruptions can be postponed or suppressed. |
| 2.2.5 | Re-authenticating | Data is preserved after re-authentication. |
| 2.2.6 | Timeouts | Users are warned about inactivity timeouts that can cause data loss. |
| 2.3.2 | Three Flashes | Content does not flash more than three times per second. |
| 2.3.3 | Animation from Interactions | Motion animation triggered by interaction can be disabled. |
| 2.4.8 | Location | Users can determine location within a set of pages. |
| 2.4.9 | Link Purpose (Link Only) | Link purpose is clear from link text alone. |
| 2.4.10 | Section Headings | Sections use headings. |
| 2.4.12 | Focus Not Obscured (Enhanced) | No part of focused item is hidden by author-created content. |
| 2.4.13 | Focus Appearance | Focus indicator has sufficient area, contrast, and persistence. |
| 2.5.5 | Target Size (Enhanced) | Targets are at least 44 by 44 CSS px, with exceptions. |
| 2.5.6 | Concurrent Input Mechanisms | Content does not restrict available input modalities. |
| 3.1.3 | Unusual Words | Definitions are available for unusual words. |
| 3.1.4 | Abbreviations | Expansions are available for abbreviations. |
| 3.1.5 | Reading Level | Supplemental content is available for advanced reading level text. |
| 3.1.6 | Pronunciation | Pronunciation guidance is available where meaning is ambiguous. |
| 3.2.5 | Change on Request | Context changes happen only on user request or can be disabled. |
| 3.3.5 | Help | Context-sensitive help is available. |
| 3.3.6 | Error Prevention (All) | User submissions can be reversed, checked, or confirmed. |
| 3.3.9 | Accessible Authentication (Enhanced) | Authentication does not rely on cognitive tests. |

## Common Mappings For AI-Generated Apps

| Finding | Likely WCAG criteria |
| --- | --- |
| Label and input are visually adjacent but not connected | 1.3.1, 3.3.2, 4.1.2 |
| Icon-only button has no name | 1.1.1, 2.4.6, 4.1.2 |
| Clickable div is not keyboard accessible | 2.1.1, 2.1.2, 4.1.2 |
| Focus ring removed or hidden by sticky header | 2.4.7, 2.4.11 |
| Status dot relies on color and title | 1.1.1, 1.4.1, 4.1.2 |
| Toast, loading, or AI response is silent | 4.1.3 |
| Custom select exposes state only with data attributes | 4.1.2 |
| Static page title across routes | 2.4.2 |
| Heading levels skip or primary heading is hidden | 1.3.1, 2.4.6 |
| Drag-only reorder has no button alternative | 2.5.7, 2.1.1 |
| Low-contrast design tokens repeat across pages | 1.4.3, 1.4.11, 2.4.7 |
| SPA navigation changes content without moving focus | 2.4.3, 2.4.7, 4.1.3 |
| Visual-only chart has no summary or data fallback | 1.1.1, 1.3.1, 1.4.1 |
| Non-essential animation ignores reduced motion | 2.3.3 |
| Modal background remains reachable behind dialog | 2.1.2, 2.4.3, 4.1.2 |

## Testing Tools

- W3C WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- axe rules: https://dequeuniversity.com/rules/axe/
- WAVE: https://wave.webaim.org/
- NVDA: https://www.nvaccess.org/
- Colour Contrast Analyser: https://www.tpgi.com/color-contrast-checker/
