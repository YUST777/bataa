# Bataa Mobile — Product and UX Concept

## Product thesis

Bataa Mobile is a daily web-development coach for beginners. It should feel as approachable and motivating as Duolingo, as practical as Mimo, and as warm and characterful as Bataa’s duck mentor.

The promise is simple:

> Spend 10–15 focused minutes a day and finish one small, real web-development task.

The important word is **finish**. Every session should produce a visible result: a button, a card, a form, a responsive section, or a small interactive page. Bataa should never become a collection of disconnected multiple-choice questions disguised as coding education.

## Language direction

Bataa is an English-only learning product for this phase. All navigation labels, lesson instructions, explanations, feedback, rewards, notifications, mentor dialogue, and settings copy should be written in clear, beginner-friendly English. Code examples keep standard English syntax and vocabulary. There is no language picker, right-to-left layout, translated copy, or mixed-language fallback in the MVP; adding localization later would be a separate product decision.

The existing repository is still a marketing-site foundation and contains legacy non-English wording in several landing-page components. This study does not change that code because it is a product/UX handoff; before an English-only launch, those strings and metadata should be audited and rewritten to match this decision.

## What the learner is actually doing

The learner is not expected to write a full application on a phone from a blank editor. That creates too much typing, too much error surface, and too little encouragement for a beginner.

Instead, Bataa uses a progressive practice ladder:

1. **Recognize** — identify what a piece of HTML/CSS does.
2. **Complete** — fill a missing tag, property, value, or selector.
3. **Arrange** — put code blocks in the correct order.
4. **Edit** — make a small change in a guided code editor.
5. **Build** — combine several learned pieces into a small project.
6. **Transfer** — optionally open the project on desktop or export/share it.

The first weeks should be guided and constrained. Free-form coding becomes more important only after the learner has enough vocabulary and confidence.

## Core daily loop

```text
Open Bataa
  → See today’s one task
  → Read a short explanation
  → Complete 3–5 guided steps
  → Preview the result
  → Check the work
  → Receive a useful explanation
  → Earn XP / extend streak
  → Continue, review, or stop
```

The app should make the next action obvious at every point. The learner should never have to decide which course, lesson, or tutorial to open after arriving on Home.

## Recommended information architecture

### Persistent bottom navigation

Use four peer destinations, matching the reference’s simple mental model:

1. **Home** — today’s task, streak, currencies, and the learner’s next action.
2. **Learn** — career paths, courses, day-by-day curriculum, and completed/reviewable lessons.
3. **Goals** — quests, progress, leaderboard, and achievements. The trophy icon can represent this area.
4. **Profile** — identity, settings, shop, and account.

Do not make Quests, Progress, Leaderboard, and Shop separate primary tabs. They are supporting systems, not four additional destinations competing for daily attention.

### Stack behavior

- Home, Learn, Goals, and Profile are tabs; switching between them should feel instant and preserve each tab’s place.
- A course/path opens with a push navigation.
- A lesson opens as a focused full-screen task flow with its own close/cancel affordance.
- Success is a state inside the lesson flow. After completion, dismiss or replace into the next meaningful destination instead of allowing Back to reopen a finished task.
- Hints, explanations, and filters are sheets or inline expansions, not full routes.
- If the learner has unsaved code, Back asks whether to keep the draft or leave it.

## Onboarding logic

The first-run flow should be short and action-oriented:

1. Welcome from the duck mentor.
2. Ask what the learner wants to make: websites, interactive pages, or eventually a broader coding path.
3. Ask current level: new to code, some basics, or returning learner.
4. Ask preferred daily commitment: 5, 10, or 15 minutes.
5. Confirm the English learning experience. The interface, lesson explanations, mentor voice, rewards, and system messages are English-only. Code uses standard English syntax and terminology.
6. Start the first task immediately.

Do not force account creation before the learner experiences a win. Let the first lesson work locally, then ask for an account when the learner wants to save progress, sync, or continue on another device.

## Curriculum model

### A path is made of short days

The reference’s path model is strong: a visible sequence gives the learner a reason to return. Each day should have:

- One outcome stated in plain language.
- One short concept explanation.
- Three to five small steps.
- A live or near-live preview.
- A check that tests the intended behavior.
- A completion reward.

### Example first week: “Build your first web component”

| Day | Learner outcome | Core concepts | Result |
| --- | --- | --- | --- |
| 1 | Make a button | HTML structure, class names | A visible “Click me” button |
| 2 | Style the button | color, background, padding, border radius | A branded button |
| 3 | Make it react | `:hover`, `:active`, transition | A button with feedback |
| 4 | Build a card | container, heading, text, spacing | A profile/product card |
| 5 | Add an image and link | `img`, `alt`, `a`, basic accessibility | A useful card |
| 6 | Make it responsive | width, max-width, media query | A card that adapts to screen size |
| 7 | Mini project review | combine HTML and CSS | A small finished landing section |

Day 7 should feel like a project checkpoint, not another isolated quiz. The next week can introduce JavaScript behavior using the same pattern.

### Unlocking rules

- The current day is prominent and available.
- Future days are visible but locked, so the learner understands the path ahead.
- Previous days remain reviewable forever.
- A missed calendar day does not erase progress or punish the learner by resetting the path.
- A streak measures consecutive active days, not perfection.
- A streak freeze is an optional recovery tool, never a reason to block learning.

## Screen-by-screen product behavior

### Home

Home answers three questions in order:

1. Who am I and how am I doing? (`Hi, Jaques`, level, XP/gems, streak.)
2. What should I do today? (one dominant “Today’s task” card.)
3. What will I achieve next? (short path preview with locked future days.)

The primary CTA should always be one label: **Start today’s task**. Avoid rotating between “Continue,” “Start learning,” “Begin,” and “Resume” for the same intent.

The greeting and rewards support motivation, but the task card must dominate. A learner should not have to scroll through decorative content to begin.

### Daily Path / Today’s Task

This is the plan before the learner enters the editor.

- Header: back, `Today’s Task`, calendar/history affordance.
- Summary card: day number, outcome, one-sentence explanation.
- Step list: current step highlighted, future steps locked, completed steps checked.
- Primary CTA: **Start lesson**.

The step list should show enough detail to reduce uncertainty but not reveal every answer.

### Lesson

Lesson is where learning happens. Its structure should be stable across the curriculum:

1. Compact progress/header row.
2. Step label and plain-language goal.
3. One concept card: what this code does and why it matters.
4. Guided editor or code interaction.
5. Preview of the result.
6. Primary validation action.
7. Secondary hint/help action.

#### Code interaction on a phone

For early lessons, use a constrained editor:

- Syntax-highlighted code in a dark, high-contrast panel.
- The editable region is visually obvious.
- Token chips or autocomplete reduce keyboard typing.
- The keyboard must never cover the Check button; the primary action moves above the keyboard or remains reachable by scrolling.
- The preview updates after meaningful edits, not on every expensive keystroke.
- The learner can reset a step without losing the whole lesson.

Do not pretend that a phone is a desktop IDE. Bataa Mobile should teach the concept and let the learner make a small real change. A later “Continue on desktop” handoff can open a richer workspace.

#### Wrong answer behavior

Wrong answers should teach:

- Keep the learner on the same step.
- Point to the exact line or property that is wrong.
- Explain the reason in one friendly sentence.
- Offer a hint that narrows the problem without immediately giving the answer.
- Allow retry without spending the learner’s ability to learn.

Never show a generic “Incorrect” state with no explanation. Never permanently lock the lesson because of mistakes.

### Success

Success is a full feedback moment, not a small toast.

- Duck celebration or a small purposeful animation.
- Clear result: `Excellent! You completed Step 1.`
- Reward cards: XP, streak progress, and optionally gems.
- One CTA: **Continue**.
- Secondary option: `Review` or `See path` if the learner wants to stop.

The animation should be reserved for meaningful completion, especially the end of a daily task or weekly project. Tiny confetti on every tap will quickly become noise.

### Learn / Courses

This area is for choosing or reviewing a path, not for daily decision overload.

- Featured path at the top: `Web Development Path`.
- Progress percentage and one-line promise.
- Ordered units: HTML Essentials, CSS Basics, JavaScript Basics, Mini Projects.
- Each unit exposes completed, current, locked, and reviewable states.
- Filters should be optional and compact.

The default screen should guide the learner back to today’s task instead of presenting a marketplace of dozens of choices.

### Goals

Combine the reference’s Quests, Progress, and Leaderboard under a single goals/progress destination:

- **Daily**: complete today’s lesson, earn XP, keep the streak.
- **Weekly**: complete a number of steps or a project.
- **Achievements**: first button, first project, seven-day streak, accessibility badge.
- **Progress**: level, XP, skill bars, weekly activity.
- **Leaderboard**: optional social comparison, with the learner’s own row highlighted.

Quests should be derived from the learning behavior, not create unrelated chores. If the learner completes the lesson, at least one quest should naturally complete too.

### Profile

Profile is identity and maintenance:

- Duck/avatar, name, level, tagline.
- Streak, total XP, badges.
- Achievements, Shop, Settings.
- English content and reminder controls.

The profile should not hide essential learning progress. Home and Goals remain the places for active progress.

### Shop

The shop can sell optional boosts, not access to basic education:

- Hint tokens, cosmetic themes, streak freezes, and temporary XP boosts.
- Never require payment or gems to retry a lesson or understand an error.
- Make the price and effect explicit before purchase.

## Detailed example: Day 1 — “Code a Button”

### Day objective

> Build a real HTML button, then give it a simple CSS style.

### Step 1 — Create the HTML structure

- Explain: HTML gives the page its structure.
- Show a small example with line numbers.
- Ask the learner to complete or edit the button element:

```html
<button class="primary-button">Click me</button>
```

- Preview: a plain native-looking button.
- Check: verify that a `button` element exists, has visible text, and has the expected class.

### Step 2 — Style the button

- Explain: CSS controls appearance.
- Guide the learner to add background, text color, padding, and rounded corners:

```css
.primary-button {
  background: #ff8500;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
}
```

- Preview updates immediately.
- Check: verify the required properties, not pixel-perfect values.

### Step 3 — Add a hover state

- Explain: interaction states tell users that a control is active.
- Add a small `:hover` rule that changes color or position.
- Preview includes a simulated press/hover control because a phone has no real hover.

### Step 4 — Test the button

- Explain that a button should be readable, visible, and usable.
- The learner taps the preview button.
- Bataa confirms the click state and checks basic accessibility conditions such as visible text and sufficient contrast.

### Completion reward

- `+10 XP`.
- Streak changes from `0` to `1` or `6` to `7`.
- A small amount of gems.
- Unlock Day 2: `Style it` if the current lesson is treated as a four-step daily task, or unlock the next day after all four steps.

The reward must be tied to demonstrated work, not simply opening the lesson.

## Gamification rules that support learning

### XP

- Award XP for completing steps, daily tasks, and weekly projects.
- Use XP for level progression and status, not to gate retries.
- Show exactly why XP was awarded.

### Gems

- Use for cosmetic themes, optional hints, or streak freezes.
- Keep the economy understandable: the learner should know how many gems an item costs and what it does.

### Hearts / attempts

The reference shows five hearts in the Lesson screen. This needs careful adaptation for education:

- Hearts may represent focus or a playful attempt counter.
- Losing a heart should never remove access to learning or force a long wait.
- A learner can always retry, review the explanation, or use practice mode.
- If hearts are retained, they should communicate effort, not punishment.

### Streaks

- Count active learning days.
- Do not reset the entire learning path after a missed day.
- Offer a grace day or streak freeze without making it feel like a failure.
- Show the next streak milestone so the number has meaning.

## Bataa’s differentiator

Duolingo and Mimo already make daily progress approachable. Bataa should be more than a warm clone by making the mentor useful at the moment of confusion:

- A **Why?** action explains why a tag, property, or pattern exists.
- A **Show me a smaller hint** action reveals one clue at a time.
- A **Bataa explains** sheet can rephrase the concept in simpler English while preserving the code vocabulary.
- A completed task includes a short “what you learned” recap.
- Projects are kept as a personal portfolio, not discarded after the reward animation.

The duck should be a coach and feedback character, not merely decoration.

## Visual/interaction rules for a native-feeling Bataa app

- Use the warm cream surface from the reference as the base.
- Lock orange as the primary action/progress color.
- Use green only for success/confirmed states.
- Use dark brown for primary text and one warm muted family for secondary text.
- Use one radius system: cards around 16–20, controls around 12–14, circular icon buttons where appropriate.
- Use a 4/8 spacing rhythm.
- Keep one dominant CTA per screen.
- Use native-feeling controls for toggles, navigation, sheets, and text input.
- Use icons consistently; reserve playful 3D art for rewards, empty states, and identity.
- Use small haptic feedback for selection and success, not for every animation.
- Respect reduced motion and dynamic text sizes.
- Keep content above the safe-area/home-indicator region.

## Empty, loading, and error states

The app should be designed beyond the happy path:

- **No current task:** show a composed “You’re caught up” state and offer review or a new path.
- **Offline:** preserve the current lesson draft and show whether checking is available locally.
- **Check unavailable:** explain the problem inline and let the learner continue practicing.
- **No leaderboard data:** show a friendly empty state, not a blank card.
- **No streak:** show the first-day invitation, not a zero that feels like failure.
- **Account sync conflict:** keep the local progress visible and explain which version will be kept.

## Recommended MVP

Do not build all twelve reference screens before proving the daily lesson loop.

### MVP screens

1. Onboarding.
2. Home.
3. Daily Path.
4. Lesson.
5. Inline incorrect/help state.
6. Success.
7. Learn/Courses.
8. Profile.

### MVP content

- One Web Development path.
- Seven days of HTML/CSS tasks.
- One reusable lesson engine with multiple exercise types.
- Local progress persistence.
- XP and streaks.
- Review of completed lessons.

### Later systems

- Quests and achievements.
- Shop and cosmetic themes.
- Leaderboard.
- Account sync.
- AI explanation layer.
- Desktop handoff and richer project workspace.

## The success test

After opening Bataa for the first time, a beginner should be able to answer these questions without thinking:

- What am I learning?
- What do I do today?
- Where do I type or tap?
- How do I know if I am right?
- What did I earn?
- What can I do next?

If any screen makes the learner search for those answers, the product is adding interface instead of reducing learning friction.
