# Accessibility and Arabic RTL

The case study praises large targets, plain language, and one action per screen while identifying limited screen-reader support, visual overload, and unclear icons as weaknesses. Bataa must keep the strengths and fix the weaknesses.

## Semantic structure

- Use native `button`, `input`, `progress`, heading, and navigation elements.
- Name every icon control.
- Keep bottom-navigation labels visible.
- Expose selected, expanded, invalid, busy, and current-page state.
- Announce task feedback without forcing focus to an unrelated region.
- Keep the reading and focus order aligned with the visible order.

## Touch and focus

- Minimum target: 44 by 44 CSS pixels; prefer 48 or more.
- Keep adequate separation between destructive and primary actions.
- Show a strong focus-visible ring on every interactive element.
- Make all lesson tasks operable without drag as the only input method.
- Provide keyboard alternatives for reorder and match interactions.

## Color and contrast

- Meet WCAG AA contrast for normal text and controls.
- Pair success, correction, warning, selection, and lock states with text and icons.
- Check the orange primary button in normal, hover/pressed, disabled, and focus states.
- Do not place small cream text on orange unless contrast is verified.

## Arabic and bidirectionality

- Set the page or route container to `dir="rtl"` for Arabic.
- Use `margin-inline`, `padding-inline`, `inset-inline`, and `text-align: start`.
- Mirror navigational arrows and positional mascot gestures, not universal media or code symbols.
- Keep HTML, CSS, URLs, email, and code editor content LTR.
- Wrap mixed inline code with bidi isolation.
- Test punctuation, numbers, parentheses, and Latin property names inside Arabic sentences.
- Use an Arabic font designed for UI at small sizes; do not depend on a Latin font fallback for Arabic shaping.

## Text scaling and responsive behavior

- Test at 200% text scaling.
- Let answer cards and feedback panels grow vertically.
- Avoid fixed-height lesson bodies.
- Keep sticky CTAs from covering focused fields, feedback, or the software keyboard.
- Preserve a readable editor height without pushing the primary action out of reach.

## Motion and sensory load

- Honor `prefers-reduced-motion` in route transitions, progress, button presses, mascot cues, and celebrations.
- Never flash content.
- Use one major motion focus at a time.
- Pause nonessential animation while the learner reads or edits.
- Provide settings for sound effects, haptics, and mascot motion when those features ship.

## Plain-language feedback

- State what happened.
- State why it matters.
- State the next action.
- Keep code terms exact even when the surrounding explanation is Arabic.

## Accessibility verification

- Navigate the full onboarding and one lesson using only keyboard controls.
- Read both flows with a screen reader.
- Test Arabic and English at narrow phone width and large text.
- Test reduced motion and muted sound.
- Test every state in grayscale or a color-vision simulator.
- Confirm the learner can recover from mistakes without understanding color, sound, or mascot animation.
