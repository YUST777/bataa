# Mobile Coding Lesson Engine

## Lesson anatomy

1. **Brief:** state one observable outcome and estimated time.
2. **Teach:** introduce only the concept needed for the next action.
3. **Try:** let the learner edit, choose, reorder, or diagnose.
4. **Preview:** show the browser result or expected visual behavior.
5. **Submit:** make validation an explicit learner action unless instant validation teaches cause and effect better.
6. **Feedback:** show success or correction immediately.
7. **Retry:** preserve useful work and focus the correction area.
8. **Complete:** show output, capability, progress, and a next action.
9. **Review:** separately recap concepts and resolved mistakes.

## Task types for Web Design

| Task type | Learner action | Example |
| --- | --- | --- |
| Reorder code | Arrange a short valid fragment | Build `<button>Start learning</button>`. |
| Fill a token | Enter one syntax item | Choose `button` instead of `div`. |
| Choose output | Compare rendered results | Select the accessible button style. |
| Match | Pair concepts and effects | `padding` -> inner space. |
| Edit code | Modify a constrained editor | Add `border-radius: 12px`. |
| Debug | Find and repair a defect | Fix missing closing tag or low contrast. |
| Predict | Select what code will render | Identify the result of a CSS rule. |
| Explain | Choose or write the reason | Explain why a semantic button matters. |
| Build | Combine concepts in a mini-project | Create a complete button component. |

Do not repeat the same task shell more than twice in sequence when another format can test the same concept.

## State machine

```text
loading -> briefing -> active -> validating
validating -> success -> active | complete
validating -> correction -> active
active -> hint -> active
active -> paused -> active
complete -> review | path
```

Never route a mistake to a terminal failure state.

## Validation contract

Validation must distinguish:

- Syntax validity.
- Semantic correctness.
- Required visible output.
- Accessibility requirements.
- Optional style differences that should not fail the learner.

```ts
type CheckResult = {
  id: string
  status: 'pass' | 'fail' | 'warning'
  conceptId: string
  message: { ar: string; en: string }
  sourceRange?: { from: number; to: number }
  previewTarget?: string
}

type SubmissionResult = {
  accepted: boolean
  checks: CheckResult[]
  nextHintLevel?: 1 | 2 | 3
}
```

Use warnings for equivalent styling choices. Fail only when the learning objective or an explicit requirement is unmet.

## Correction pattern

1. Keep the learner's work visible.
2. State what happened without judgment.
3. Point to the relevant code and/or preview region.
4. Explain the underlying concept in one or two sentences.
5. Give the smallest useful next step.
6. Return focus to the relevant control or editor.
7. Allow unlimited retry.

Use red as one signal, paired with an icon, heading, and explanatory text.

## Progressive hints

- Hint 1 names the concept.
- Hint 2 points to the relevant line or property.
- Hint 3 shows a partial structure, not the full answer when avoidable.
- After repeated difficulty, offer a worked example and a similar retry task.

Record hint use for adaptation, not punishment.

## Completion screen

Keep completion statistics within a small, meaningful set:

- Artifact built.
- Capability learned.
- Course/unit progress.
- Accuracy or mistakes resolved when it helps the learner.
- Time spent only as neutral context.

Use one primary action, `Continue`, and a secondary `Review lesson`. Do not stack multiple currencies, chests, league changes, and upsells before the learner can exit.

## Review screen

Separate review into:

1. Concepts introduced with short examples.
2. Mistakes and why the corrected answer works.
3. One transfer question that uses the concept in a slightly different context.
4. A glossary link for future recall.

## Day 1: Build your first button

Suggested task sequence:

1. Choose the semantic element for a clickable action.
2. Reorder tokens to create the button and label.
3. Preview the raw HTML button.
4. Add background and text colors.
5. Add padding and border radius.
6. Diagnose a low-contrast or non-semantic alternative.
7. Build the final button in a constrained editor.
8. Complete with a working preview and capability statement.

Acceptance rules:

- Uses a `<button>` element.
- Has a non-empty accessible name.
- Remains keyboard focusable.
- Meets the explicit visual requirements without enforcing irrelevant exact pixel values.
- Provides visible focus behavior in the final build.
