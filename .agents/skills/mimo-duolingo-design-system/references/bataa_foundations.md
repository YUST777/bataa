# Bataa Mobile Product Foundations

## Product definition

Bataa is an Arabic-first mobile app that teaches coding through short daily, hands-on lessons. It uses a friendly duck mentor and a guided course path. The first course is Web Design.

The separate desktop tutor is outside this product's implementation scope.

## Product promise

`Learn a real coding skill each day by building something small and seeing it work.`

Every screen must support that promise. Prefer evidence of ability over abstract points.

## Learning principles

1. **Do before explain:** let learners manipulate real HTML and CSS early.
2. **One objective per lesson:** remove unrelated concepts from the task.
3. **Short instruction, fast attempt:** avoid lecture-heavy screens.
4. **Visible cause and effect:** connect code changes to browser output.
5. **Explain and retry:** correction is part of learning, not a punishment.
6. **Vary the task, preserve the concept:** prevent repetition without adding randomness.
7. **End with evidence:** show what the learner can now build.
8. **Review mistakes deliberately:** do not rely on repeated guessing.

## Visual identity

- Use warm cream as the app background.
- Use Bataa orange as the primary action and progress accent.
- Use deep warm brown for primary text and outlines.
- Use white/cream cards with visible warm borders and tactile depth.
- Use yellow only for instructional emphasis and limited highlights.
- Keep the duck original to Bataa; do not mimic Duo's silhouette or expressions.
- Prefer rounded, friendly geometry without turning every surface into a pill.

Use `ui_tokens.json` as the source of truth. When the app already defines an approved token, preserve it and update the reference rather than creating competing raw values.

## Content voice

- Friendly, direct, and specific.
- Short enough to scan while holding a phone.
- Explain why a correction matters to the visible result.
- Address the learner without shame, urgency, or guilt.
- Use code terms in English when they are the actual syntax, with an Arabic explanation around them.
- Avoid childish praise for adult learners; celebrate the work they completed.

Examples:

- Good: `استخدم <button> لأن هذا العنصر قابل للضغط من لوحة المفاتيح تلقائياً.`
- Good: `Your button works. Next, give it a clear hover state.`
- Avoid: `Wrong! You lost a heart.`
- Avoid: `Bataa is sad because you missed yesterday.`

## Mobile information architecture

Use five labeled destinations only if all five ship with meaningful content:

1. **Learn** — course path and next lesson.
2. **Practice** — mistakes, spaced review, and quick exercises.
3. **Projects** — completed and in-progress outputs.
4. **Glossary** — searchable HTML/CSS concepts and examples.
5. **Profile** — goals, reminders, accessibility, language, and account.

If the initial product is smaller, launch with Learn, Practice, and Profile. Do not show empty destinations simply to resemble another app.

## First Web Design course arc

1. HTML elements and page structure.
2. Buttons, links, and semantic interaction.
3. Text, color, spacing, and borders.
4. Box model and layout.
5. Flexbox.
6. Responsive design.
7. Accessible forms.
8. A small responsive landing-page project.

Each unit ends in a build challenge that combines the preceding skills.
