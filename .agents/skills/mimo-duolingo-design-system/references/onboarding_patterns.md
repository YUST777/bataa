# Mobile Onboarding System

Use onboarding to prove the learning experience before demanding commitment. Keep one decision per screen, a persistent top progress indicator, and one large bottom CTA.

## Recommended Bataa sequence

| Stage | Screen purpose | Primary learner action | Bataa adaptation |
| --- | --- | --- | --- |
| 1 | Welcome | Start or sign in | Duck introduces hands-on coding in one sentence. |
| 2 | Course selection | Pick a starting course | Feature Web Design first; show future courses as unavailable, not selectable clutter. |
| 3 | Acquisition source | Choose how they heard about Bataa | Keep optional and skippable if analytics do not justify the friction. |
| 4 | Experience | Choose current level | New, tried tutorials, or already built pages. |
| 5 | Motivation | Choose why they are learning | Career, school, own project, or curiosity. |
| 6 | Daily goal | Choose a sustainable duration | 5, 10, 15, or 20 minutes; recommend 10. |
| 7 | Starting point | Accept recommendation or choose manually | Explain why Bataa recommends the level. Always allow override. |
| 8 | Sample task | Complete a tiny real task | Assemble or edit a simple HTML button and preview the result. |
| 9 | Gentle commitment | Choose reminders and rest day | Never use guilt or a forced streak pledge. |
| 10 | Profile | Save progress | Offer Google, Apple, or email; delay until value has been demonstrated when feasible. |
| 11 | Path reveal | See the first course path | Highlight Day 1: Build your first button. |

Do not automatically reproduce survey screens from the reference. Keep a screen only when its answer changes curriculum, pacing, reminders, or measurement.

## Screen anatomy

1. Back or close control in the safe area.
2. Thin progress bar with a text alternative such as `Step 3 of 8` for assistive technology.
3. Optional mascot dialogue that explains why the question matters.
4. One concise title and optional supporting line.
5. Two to five large answer cards.
6. Sticky bottom action area with safe-area padding.
7. Primary CTA in an enabled, disabled, busy, or error state.

Avoid decorative elements between the answer region and CTA. Keep the next action visible without scrolling on common phone sizes when content permits.

## Interaction rules

- Select a card with the entire card surface, not a tiny radio control.
- Use a checkmark, border, weight, and color together for selection.
- Keep at least 44 by 44 CSS pixels for every target; prefer 48–56 pixels for primary controls.
- Enable `Continue` only after a valid choice.
- Preserve answers when moving back.
- Let the learner change the recommended level and daily goal later in settings.
- Use a fast skeleton or local transition if a recommendation requires computation.
- Announce validation errors near the affected control and move focus appropriately.

## Onboarding state

```ts
type ExperienceLevel = 'new' | 'some-practice' | 'built-projects'
type LearningReason = 'career' | 'school' | 'project' | 'curiosity'
type DailyMinutes = 5 | 10 | 15 | 20

interface OnboardingProfile {
  courseId: 'web-design'
  experience?: ExperienceLevel
  reason?: LearningReason
  dailyMinutes?: DailyMinutes
  recommendedUnitId?: string
  selectedUnitId?: string
  reminderTime?: string
  restDay?: number
  sampleTaskCompleted: boolean
  accountSaved: boolean
}
```

Persist after every accepted screen so an interruption resumes at the correct step. Derive progress from the active sequence rather than hard-coding a percentage.

## Sample-task standard

The sample must behave like a lesson, not a fake animation:

1. State the observable goal: make a button that says `Start learning`.
2. Let the learner choose or arrange a real HTML element.
3. Render a live visual result.
4. Validate the semantic element and visible label.
5. Explain a mistake without consuming a life.
6. Celebrate briefly and reveal the course path.

## Onboarding completion criteria

- The learner understands that Bataa teaches coding through practice.
- The app knows enough to choose a starting lesson and daily pace.
- The learner has completed one authentic interaction.
- Account creation never hides unclear billing or a surprise subscription.
- The learner can identify the first lesson and what to do next.
