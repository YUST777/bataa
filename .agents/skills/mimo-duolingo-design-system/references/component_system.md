# Mobile Component System

Read `ui_tokens.json` before creating component variants. Use semantic CSS variables in application code instead of repeating hex values.

## Tactile button

Create depth with a face and bottom lip. The press state moves the face down until the lip visually collapses.

```css
.button-primary {
  min-block-size: 52px;
  padding-inline: 24px;
  color: var(--color-action-on-primary);
  background: var(--color-action-primary);
  border: 2px solid var(--color-action-primary-border);
  border-radius: var(--radius-control);
  box-shadow: 0 var(--depth-control) 0 var(--color-action-primary-depth);
  font: var(--font-button);
  transform: translateY(0);
  transition: transform 80ms ease, box-shadow 80ms ease, filter 120ms ease;
}

.button-primary:active:not(:disabled) {
  transform: translateY(var(--depth-control));
  box-shadow: 0 0 0 var(--color-action-primary-depth);
}

.button-primary:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 3px;
}
```

Never use scale-down as the only press feedback; it can make the target feel unstable. Disable press motion under reduced motion if it causes discomfort.

Required variants:

- Primary orange.
- Secondary cream/white with warm brown label and border.
- Quiet text action.
- Destructive only for actual destructive actions.
- Disabled with readable label and no fake depth interaction.
- Busy with a stable width and accessible status.

## Answer card

- Make the full card selectable.
- Use a leading icon or short illustration only when it improves recognition.
- Give the selected state a border, checkmark, subtle fill, and announced state.
- Keep labels left-aligned in English and right-aligned in Arabic using logical properties.
- Do not combine navigation and selection in the same card unless the behavior is explicit.

## Progress bar

- Use determinate progress when the total is known.
- Keep a text alternative for screen readers.
- Animate only the changed portion and honor reduced motion.
- Do not show progress as a reward currency.

## Course node

Include:

- State icon.
- Short label or an adjacent persistent label.
- Optional lesson count or time.
- Clear locked reason on activation.
- Minimum 48-pixel target.

Do not rely on a decorative icon alone to communicate lesson content or state.

## Bottom navigation

- Use three to five destinations.
- Keep labels visible in both selected and unselected states.
- Use safe-area padding.
- Pair icon, label, and current-page semantics.
- Do not place the lesson submit CTA inside global navigation.

## Lesson scaffold

Use three stable regions:

1. Top: exit, progress, and limited status.
2. Middle: instruction, task, editor/choices, and preview.
3. Bottom: feedback panel and sticky submit/continue action.

On keyboard open, preserve access to both the active input and submit action. Avoid using fixed heights that break on small phones or larger text.

## Feedback panel

- Success: icon + direct message + next CTA.
- Correction: icon + what happened + why + retry CTA.
- Warning: neutral explanation for acceptable but improvable code.
- Never encode status with green/red alone.

## Visual density

Use whitespace to separate decisions, but keep the task and CTA in one phone viewport where possible. Reduce ornament before reducing text size or touch-target size.
