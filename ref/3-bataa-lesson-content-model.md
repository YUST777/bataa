# Bataa lesson/content model (English-only MVP)

This is the content contract for the mobile learning loop. It is intentionally
small enough to ship with local data, but structured so a later API can return
the same shape. It follows the reference's path → lesson → feedback rhythm and
keeps every check tied to a real web-development outcome.

The implementation companion is [`src/data/bataaContent.ts`](../src/data/bataaContent.ts).

## Learning object hierarchy

```text
LearningPath
  └─ Unit
      └─ LessonDay
          └─ LessonStep
              ├─ explanation
              ├─ starterCode
              ├─ expectation (intent-level validator)
              ├─ preview
              └─ hints (progressive disclosure)
```

### `LessonDay`

Each day has one observable outcome, 3–5 concepts, a 5–15 minute estimate, a
sequence of steps, and a completion reward. Future days are visible but locked;
previous days are always reviewable. A missed calendar day does not reset the
path.

```ts
type LessonDay = {
  id: string
  dayNumber: number
  title: string
  shortTitle: string
  description: string
  outcome: string
  concepts: string[]
  estimatedMinutes: number
  steps: LessonStep[]
  completionReward: { xp: number; gems: number; badge?: string }
}
```

### `LessonStep`

The first lesson moves the learner through the practice ladder: complete a
snippet, style it, add a state, then test the result. The same object can later
support arrange/token exercises by adding another `ExerciseKind`.

```ts
type LessonStep = {
  id: string
  kind: 'code' | 'preview-interaction'
  stepNumber: number
  title: string
  goal: string
  explanation: string
  language?: 'html' | 'css'
  starterCode?: string
  expectation?: CodeExpectation
  preview: PreviewSpec
  hints: Hint[]
  success: string
  xp: number
}
```

Content rules:

- Say what the learner can do after the step (`Add a button element`), not what
  the interface contains (`HTML editor`).
- Use one term for one action: `Check` validates code, `Continue` advances, and
  `Review` revisits completed work.
- Keep the first hint directional; only the last hint should reveal a pattern.
- Explain the reason in one sentence before showing syntax.
- Avoid pixel-perfect checks. Learners may use a different valid spacing or
  color value while still demonstrating the concept.

## First week content map

| Day | Outcome | Practice ladder | Completion reward |
| --- | --- | --- | --- |
| 1 — Code a Button | A visible, labelled HTML button | Complete → style → state → test | 40 XP, 5 gems, `First button` badge |
| 2 — Style It | A clear branded control | Recognize properties → edit CSS → compare preview | 50 XP, 5 gems |
| 3 — Add Hover Effect | A button that gives feedback | Arrange selector → edit state → simulate on phone | 50 XP, 5 gems |
| 4 — Build a Card | A readable grouped component | Complete structure → spacing → hierarchy | 60 XP, 6 gems |
| 5 — Add an Image + Link | A useful, accessible card | Add `alt` → label link → inspect preview | 60 XP, 6 gems |
| 6 — Make It Responsive | A card that fits a small screen | Add flexible width → media query → resize preview | 70 XP, 7 gems |
| 7 — Mini Project Review | A finished hero section | Combine → test → recap | 100 XP, 10 gems, `First project` badge |

The first day is fully specified in the TypeScript content file. Days 2–7 have
outcomes and concepts ready for the same reusable engine; add steps as each
lesson is implemented.

## Validation contract

Validation should answer three questions in order:

1. **Is there enough input to check?** If not, focus the editor and say `Add the
   code for this step, then check it again.`
2. **Does the input demonstrate the concept?** Check for a required tag, selector,
   or property. Ignore whitespace, quote style, property ordering, and optional
   formatting.
3. **Can the learner act on the feedback?** Return one missing item and a line or
   region to focus, not a wall of compiler output.

`validateStep` in `src/data/bataaContent.ts` implements this contract for the
first four steps. It returns:

```ts
type ValidationResult = {
  valid: boolean
  message: string
  focus?: 'editor' | 'preview'
}
```

### Step 1 — HTML structure

Accept any case-insensitive button element with visible `Click me` text:

```html
<button class="primary-button">Click me</button>
```

Reject with a specific clue if the learner is missing `Click me` or either
button tag. Do not require the exact class until the styling step.

### Step 2 — CSS styling

Require declarations for `background`, `color`, `padding`, and `border-radius`.
Do not require the reference's exact orange or pixel values; explain that each
property controls a different visual result.

### Step 3 — hover state

Require a `.primary-button:hover` selector and at least one changed visual
property (`background`, `color`, or `transform`). Because a phone has no hover,
the preview exposes a `Press and hold` simulation control.

### Step 4 — test the result

Do not parse code again. Require an actual preview tap. Check that the preview
has a visible label and then announce the result. This teaches that testing is
part of writing code.

## Lesson state machine

State lives at the lesson level, not only in individual controls. Persist the
draft and current step locally so an interrupted session can resume safely.

```text
idle
  └─ start → editing
editing
  ├─ show hint → editing (hint index +1)
  ├─ reset → editing (starter code)
  ├─ check → checking
  └─ close with draft → confirm-leave
checking
  ├─ valid → step-success
  ├─ invalid → correction (same step)
  └─ unavailable/offline → unavailable (draft retained)
correction
  ├─ edit → editing
  ├─ show hint → correction
  └─ try again → checking
step-success
  ├─ more steps → editing (next step)
  └─ last step → day-success
day-success
  ├─ continue → next meaningful destination (next step/path)
  ├─ review → read-only recap
  └─ see path → daily path
```

Important behavior:

- A wrong answer never spends the learner's access to education. Hearts may
  animate for flavor, but retries, hints, and explanations remain available.
- The primary button label is stable: `Check` while editing/checking, `Try again`
  after an error, and `Continue` after success.
- While checking, disable duplicate submissions and announce `Checking your
  work…` to assistive technology.
- On an offline check, preserve the draft and explain what is unavailable;
  never silently discard code.
- Closing with unsaved text opens a confirmation sheet with `Keep my draft` and
  `Leave lesson`. The destructive action is explicit.
- After the final step, success is a full screen feedback moment. Award XP and
  streak only once, keyed by `lessonId`, so a repeated tap cannot double-award.

## Key screen copy and states

### Home

- Greeting: `Hi, {name}`
- Hero: `You are about to code amazing things`
- Section: `Continue your path`
- CTA: `Start today's task`
- No task: `You're all caught up` / `Take a victory lap, or review a lesson to
  keep your skills fresh.`

The task card is the dominant object. Rewards and mascot support the action;
they should not force the learner to hunt for today's lesson.

### Daily path

- Header: `Today's Task`
- Day card: `Day 1` / `Code a Button` / `Let's build your first HTML button.`
- Progress: `Steps (1/4)`
- CTA: `Start lesson`

Only the current step is actionable. Locked rows remain visible to make the
near-term path legible.

### Lesson

- Progress label: `Step {current} of {total}`
- Goal: plain-language instruction above the editor
- Preview label: `Preview` or `Try it yourself`
- Primary CTA: `Check`
- Secondary action: `Show a hint`

Correction copy should name the next action, for example:

> `Add a border-radius declaration. It helps complete this visual change.`

### Success

- Title: `Excellent!`
- Detail: `You completed Step 1 🎉`
- Encouragement: `Keep going!`
- Reward labels: `+10 XP`, `1 day streak`
- CTA: `Continue`

At day completion add a short recap: `HTML gives a page structure. CSS gives
that structure its look and feel.`

## Screen-state matrix

| Screen | Loading | Empty | Error/offline | Success |
| --- | --- | --- | --- | --- |
| Home | Skeleton task card and reward counters | `You're all caught up` with review CTA | Local progress remains visible; sync message is inline | Reward counters update and next day unlocks |
| Daily path | Placeholder day card and step rows | Never empty for an enrolled path | Calendar/history can retry without losing place | Current row checkmark and fraction updates |
| Lesson | Keep editor visible; only Check shows `Checking your work…` | N/A — step always has starter content | Draft retained; `We cannot check this step right now…` | Success surface with one Continue CTA |
| Goals | Skeleton quest cards | `Your leaderboard is warming up…` | Show local XP and retry sync | Quest completion explains which behavior earned it |
| Profile | Avatar and stats skeleton | `Complete one lesson to earn your first badge.` | Account sync conflict offers explicit choice | Stats and badges refresh after award |

## Reward and progression invariants

- XP is for level/status, never a price for retries or explanations.
- Gems buy optional cosmetics, hint tokens, or a streak freeze; basic learning
  is always available.
- A streak counts active learning days. Missing a day does not lock lessons or
  reset the path.
- Daily and weekly quests mirror learning behavior (`Complete today's lesson`,
  `Finish 3 steps`, `Review one lesson`) rather than creating unrelated chores.
- Unlocking is deterministic: `lessonCompleted[day - 1]` unlocks the next day.
- A completed lesson is reviewable forever in read-only mode with a `Practice
  again` action that does not award duplicate completion XP.
