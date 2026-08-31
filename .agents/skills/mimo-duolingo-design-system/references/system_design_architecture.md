# Mobile Learning Application Architecture

This architecture covers Bataa's phone learning app only.

## Route model

```text
/
/onboarding/:step
/learn
/course/:courseId
/lesson/:lessonId
/lesson/:lessonId/review
/practice
/projects
/glossary
/profile
/settings/accessibility
```

Use TanStack Router loaders to resolve course and lesson data. Keep ephemeral task interaction inside the lesson feature, and persist resumable progress separately.

## Core domain models

```ts
type Locale = 'ar' | 'en'
type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'mastered'
type TaskKind = 'reorder' | 'fill' | 'choose-output' | 'match' | 'edit' | 'debug' | 'predict' | 'explain' | 'build'

interface Course {
  id: string
  title: Record<Locale, string>
  unitIds: string[]
}

interface Unit {
  id: string
  courseId: string
  title: Record<Locale, string>
  capability: Record<Locale, string>
  lessonIds: string[]
}

interface Lesson {
  id: string
  unitId: string
  title: Record<Locale, string>
  objective: Record<Locale, string>
  estimatedMinutes: number
  tasks: TaskDefinition[]
}

interface TaskDefinition {
  id: string
  kind: TaskKind
  conceptIds: string[]
  instruction: Record<Locale, string>
  content: unknown
  validator: string
  hints: Array<Record<Locale, string>>
}

interface LessonProgress {
  lessonId: string
  status: LessonStatus
  currentTaskIndex: number
  attempts: Attempt[]
  startedAt: string
  completedAt?: string
}

interface Attempt {
  id: string
  taskId: string
  submittedAt: string
  accepted: boolean
  checkIds: string[]
  hintLevel: number
}
```

Do not store hearts because mistakes do not block learning.

## State boundaries

- **Server/catalog state:** courses, units, lessons, glossary entries, localization.
- **Learner progress:** enrollment, completed lessons, concept strength, streak/rest day, reminders.
- **Active lesson state:** current task, draft answer, validation, feedback, hint level, mascot cue.
- **Presentation state:** open sheets, animation completion, selected tab.

Do not mix animation state with learning truth. A task becomes complete because validation accepted it, not because a celebration ended.

## Persistence rules

- Save accepted task progress immediately.
- Save drafts on backgrounding and at safe intervals.
- Resume the exact active task after interruption.
- Use idempotency keys for submitted attempts.
- Queue progress offline and reconcile without duplicating rewards.
- Version lesson content so progress remains interpretable after curriculum updates.

## Code execution and preview

- Render learner HTML/CSS in a constrained sandboxed preview.
- Sanitize or isolate user markup from the application shell.
- Apply deterministic validation to lesson objectives.
- Separate required checks from optional style warnings.
- Keep preview failure recoverable and preserve learner code.
- Never execute arbitrary remote scripts in beginner lessons.

## Localization architecture

- Store user-facing content by translation key or localized content object.
- Keep HTML/CSS syntax LTR inside Arabic screens.
- Mark code blocks with `dir="ltr"` and isolate bidi content.
- Use logical CSS properties for layout.
- Test routes and validation messages in both locales.

## Analytics events

Collect only events that answer product or learning questions:

- onboarding step viewed/completed/skipped.
- lesson started/resumed/completed.
- task attempted/accepted.
- hint requested by level.
- correction category.
- review started/completed.
- reminder changed.

Do not optimize solely for time in app. Pair engagement metrics with lesson completion, transfer success, and mistake resolution.
