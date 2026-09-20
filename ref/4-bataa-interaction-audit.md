# Bataa interaction audit — `src/app/BataaApp.tsx`

Review mode: implementation audit (static control/state pass plus production
build). The audit does not change product files. Evidence references the current
file as of 2026-09-06. `npm run build` passes; the findings below are behavioral
and interaction gaps rather than TypeScript/build failures.

## Release decision

**Conditional pass for visual prototype; not ready for a learning beta.** The
main Home → Today’s Task → Lesson → Success loop is wired, and the tab/filter,
shop, leaderboard, and progress overlays now have state transitions. Before a
learner beta, fix the draft-loss path, onboarding choices, and deceptive/inert
controls below.

## Findings

### P1 — Lesson close can discard a learner’s code

- **Evidence:** `LessonScreen` close button at `BataaApp.tsx:250` calls
  `onBack` immediately. `answer` is component state only and is not persisted.
- **Impact:** A beginner who taps X after typing loses the work without a warning;
  this conflicts with the product contract's `Keep my draft` / `Leave lesson`
  recovery path.
- **Fix:** Track `dirty = answer !== starterCode` (and preview interaction state).
  On close, show a confirmation sheet with `Keep my draft` and `Leave lesson`.
  Persist `lessonId`, `stepId`, answer, and hint index in local storage; restore
  it when the lesson reopens.
- **Verify:** Type code, close, choose Keep, reopen and see the exact draft;
  choose Leave and confirm the lesson exits with no draft.

### P1 — Onboarding presents choices that do not change state

- **Evidence:** At `BataaApp.tsx:335`, the `Websites` and `Interactive pages`
  buttons have no `onClick`, and the time options are `<span>` elements with a
  permanently selected `10 minutes` class. The content model also defines a
  third option and a level question that the screen never renders.
- **Impact:** Onboarding asks for preferences but records none, so the learner's
  answers cannot personalize the first task or reminders. The visual state lies
  about selection.
- **Fix:** Make options controlled buttons with `aria-pressed`; store goal,
  current level, and daily time in onboarding state/local storage. Either add
  the level screen from `APP_COPY.onboarding.levelOptions` or remove the question
  from the content contract until it is implemented.
- **Verify:** Select each option, advance/back through onboarding, and confirm
  only the selected value is highlighted and saved.

### P1 — Settings account actions are dead buttons

- **Evidence:** `SettingsScreen` account rows at `BataaApp.tsx:283` render
  `Manage account`, `Privacy and data`, and `Log out` as `<button>` elements
  without handlers.
- **Impact:** Tapping a control that looks functional produces no result. A
  learner cannot understand account/privacy behavior, and Log out has no
  confirmation path.
- **Fix:** Implement a small sheet/route for account and privacy content. For
  Log out, show an explicit confirmation before clearing session state. If
  those systems are intentionally out of MVP, render the rows as static text
  with a `Coming soon` label rather than fake buttons.
- **Verify:** Every row either opens a named destination/sheet or is visibly
  marked unavailable; Log out requires confirmation and preserves/clears data
  according to the stated policy.

### P1 — The code-step preview looks tappable but has no behavior

- **Evidence:** The preview button in the non-preview branch at
  `BataaApp.tsx:250` is a `.demo-button` with no `onClick`; it even has pointer
  styling. The `Why does this work?` button in `.lesson-bottom-tools` also has
  no handler.
- **Impact:** The learner cannot tell whether the preview is an interactive
  result or a static illustration, and the app promises a contextual
  explanation that never appears.
- **Fix:** For code steps, either render a non-button preview element or wire it
  to the simulated interaction/check state. Connect `Why does this work?` to an
  inline explanation/sheet using `step.explanation`. Keep the Step 4 test path
  as the only required validation interaction.
- **Verify:** A screen-reader and pointer user can tell whether Preview is
  interactive; tapping the explanation always reveals the relevant concept.

### P1 — Locked path rows still open today’s lesson

- **Evidence:** Every Home path row at `BataaApp.tsx:156` calls
  `onOpen('task')`, regardless of `done`, `current`, or future locked state.
- **Impact:** Future steps show a lock icon but are actionable. This breaks the
  progression promise and can confuse a beginner about what to do next.
- **Fix:** Only current and completed rows should open the task/review flow.
  Disable future rows with `disabled`, `aria-disabled`, and a lock explanation
  (or open a tiny sheet: `Finish Step 1 to unlock this step`).
- **Verify:** Tap each of the four rows at 0/1/2/3 completed steps; only the
  current or reviewable rows respond, and future rows never jump into a lesson.

### P2 — Review-after-completion uses the active editor and success award copy

- **Evidence:** Once `completedSteps === FIRST_LESSON.steps.length`, Home still
  labels the CTA `Continue today’s task` (`BataaApp.tsx:147`). Task opens
  `Review lesson`, but `LessonScreen` derives the last step and `SuccessScreen`
  treats it as a daily win. `completeStep` is reward-idempotent, but the success
  surface still says `DAILY WIN` and presents completion rewards.
- **Impact:** A learner can repeatedly see a completion celebration after the
  day is already complete, and the primary action wording suggests unfinished
  work.
- **Fix:** Use `Review today's task` after completion and pass a `mode:
  'review'` flag. In review mode, make the lesson read-only or practice-only,
  label success `Practice complete`, and suppress XP/gem/streak awards.
- **Verify:** Finish all four steps, return Home, and confirm the CTA says Review;
  repeated review does not change XP, gems, streak, or daily-win copy.

### P2 — Lesson validation timers are not cancellable

- **Evidence:** `LessonScreen.check` at `BataaApp.tsx:234–246` schedules a
  280 ms timeout and, on success, a second 420 ms timeout. Neither is cleared
  on unmount; the Check button becomes enabled again after the first timeout.
- **Impact:** Closing or changing state during a check can still call
  `onComplete`; repeated valid taps can queue multiple transitions. Rewards are
  currently guarded, but the overlay can flicker and future reward side effects
  could duplicate.
- **Fix:** Store timeout IDs in refs, clear them in an effect cleanup, and set a
  `completionQueued` guard until the parent transition occurs. Keep Check
  disabled while valid feedback is awaiting transition.
- **Verify:** Start a check, close immediately, and confirm no success overlay
  appears. Click Check repeatedly and confirm one transition and one reward.

### P2 — Settings toggles reset and dark mode is not applied

- **Evidence:** `SettingsScreen` owns `reminder`, `sounds`, and `darkMode`
  state at `BataaApp.tsx:282`. The component unmounts when the overlay closes;
  `darkMode` is never used to add a theme class or change tokens.
- **Impact:** The learner receives no durable setting behavior; Dark mode is a
  deceptive toggle that changes no appearance.
- **Fix:** Lift settings to `BataaApp` or persist them in local storage. Apply a
  `data-theme="dark"`/class to the app device and define semantic dark tokens;
  expose a clear saved state for reminder/sounds.
- **Verify:** Toggle each setting, close/reopen Settings and reload the app;
  confirm values persist. Dark mode visibly changes the app while preserving
  text/control contrast.

### P2 — English-only Language row has a navigation affordance but no action

- **Evidence:** The Language row at `BataaApp.tsx:283` is a `<div>` with a
  chevron and `English`, but has no click behavior.
- **Impact:** Users reasonably expect a language picker, yet the product is
  intentionally English-only in this MVP.
- **Fix:** Either make it static (`Language · English`, no chevron) or make it a
  disabled row with `English only in this release`; do not imply a missing
  destination.
- **Verify:** The row's visual semantics match its behavior and keyboard users
  do not focus a non-action.

### P2 — Profile “Achievements” opens the leaderboard

- **Evidence:** The Achievements row at `BataaApp.tsx:211` calls
  `onOpen('leaderboard')`.
- **Impact:** The label and destination disagree; learners looking for badges
  land in a social ranking view.
- **Fix:** Add an achievements overlay or route, or rename the row to
  `Leaderboard`. The Goals → Badges tab can be reused as the content source.
- **Verify:** Tap Achievements and confirm the title, copy, and back behavior all
  refer to badges/earned work.

### P3 — Learn unit cards imply navigation but are noninteractive

- **Evidence:** Curriculum units at `BataaApp.tsx:192` are `<div className="unit-card">`
  elements with a trailing chevron and no handler. Locked and unlocked cards
  look structurally alike apart from opacity.
- **Impact:** The chevron suggests a drill-in path, but tapping does nothing.
  This is a comprehension and affordance mismatch.
- **Fix:** Make unlocked units buttons that open the unit/day list; make locked
  units static or show an unlock explanation. Remove the chevron from static
  rows.
- **Verify:** Every chevron-bearing unit has a destination or no chevron.

## Existing controls that are wired correctly

- Bottom navigation calls `handleTab`, clears overlays, and marks the active tab.
- Home CTA, View path, streak shortcut, task Start, Learn filters/tabs, Goals
  tabs/shortcuts, Shop tabs/items, Leaderboard tabs, lesson Check/Hint/Reset,
  success Continue/close, and onboarding Next/Skip all have handlers.
- `TaskScreen` calendar now opens the streak overlay.
- `completeStep` guards XP/gems/streak against duplicate completion by checking
  whether the step is new.
