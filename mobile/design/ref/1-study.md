# Bataa Mobile Reference Study — `ref/1.jpg`

## Purpose of this note

This document records the visual and product structure of the supplied reference image before any implementation work. It is a screen-by-screen study, not a code specification. The image shows a gamified mobile learning app for a beginner learning web development through short, guided tasks.

The reference is a 4-column × 3-row contact sheet containing twelve iPhone-style screens:

1. Home
2. Daily Path
3. Lesson
4. Success
5. Courses
6. Quests
7. Progress
8. Profile
9. Streak
10. Shop
11. Leaderboard
12. Settings

Image dimensions: 2730 × 4096 px. Each phone is portrait-oriented and presented on a warm cream/yellow canvas with a small screen title above it.

## Product concept inferred from the reference

The app turns learning into a daily game loop:

`Home → Daily task → Lesson step → Success reward → Continue`

The learner accumulates XP, gems, badges, streak days, and unlocked lessons. A web-development path is the example content, but the information architecture is reusable for other skills. The duck mascot is the learner identity/companion and appears in the home, success, and profile experiences.

The product is not a passive video course. It is a progression system built around small actions, visible progress, locked next steps, immediate feedback, and reward loops.

## Shared visual language

### Palette and surfaces

- Overall canvas: soft buttery cream / pale yellow; warm, friendly, low-contrast rather than white.
- Phone surfaces: slightly lighter cream with a very subtle warm gradient.
- Cards: cream-to-near-white panels, usually separated by a thin tan border and a soft warm shadow.
- Primary action: saturated orange, sometimes with a slightly darker orange edge/shadow to create a tactile button.
- Success state: medium leaf green for checks and the Lesson “Check” action.
- Text: deep brown/near-black instead of pure black.
- Secondary text and dividers: muted caramel/brown.
- Supporting accents: yellow/gold stars and gems, red/orange flames and hearts, purple XP item, blue freeze item.

Approximate semantic tokens (visual estimates, not sampled production values):

| Role | Appearance |
| --- | --- |
| App background | pale butter yellow |
| Primary text | dark chocolate brown |
| Primary CTA | vivid orange |
| Positive/success | green |
| Reward/gold | amber/yellow |
| Danger/logout | warm red |
| Card border | low-contrast tan |
| Muted copy | dusty caramel |

### Typography

- Rounded, friendly sans-serif with high legibility at small sizes.
- Screen titles and section headings are bold or semibold.
- Body copy is compact, medium-weight, and dark enough to remain readable on cream.
- Labels such as “Daily”, “Weekly”, “Level 3”, and “Stats” are smaller and often semibold.
- Numbers in counters and rewards are visually prominent and bold.
- The visual hierarchy is achieved more through size, weight, spacing, and color than through many font families.

### Geometry and depth

- Portrait phone frame with large rounded outer corners.
- Most internal cards use generous rounding (roughly 14–22 px relative to a typical mobile viewport).
- Buttons are orange rounded pills/rounded rectangles with a visible lower shadow or darker edge.
- List rows are individual rounded cream cards rather than flat table rows.
- Shadows are soft, diffuse, and warm; there are no harsh black shadows.
- Icons are friendly and chunky: outlined navigation icons, emoji-like 3D rewards, lock symbols, stars, flames, trophies, hearts, and checkmarks.
- Decorative 3D objects and the duck provide personality without competing with the task hierarchy.

### System chrome

- Every screen reserves a top status bar area showing `9:41`, signal, Wi‑Fi, and battery symbols.
- The status bar uses dark text/icons against the cream surface.
- Screens with an in-app back flow use a left arrow in the app header.
- Screens with a dismiss/close flow use an X at the top right.

### Bottom navigation

Most screens share a four-item bottom navigation bar:

1. Home icon
2. List/path/courses icon
3. Trophy/quests/progress icon
4. Profile/person icon

The active destination is communicated with an orange icon and/or a white rounded capsule behind it. Inactive icons are thin brown outlines. The nav is visually persistent, sits inside the phone’s bottom safe area, and is separated from content by a faint horizontal divider.

The exact active state on the Lesson, Success, Streak, and Shop captures is subtle; preserve the shared nav but do not infer a stronger state than the image clearly shows.

## Screen studies

### 1. Home

**Purpose:** orient the learner, show the current identity/rewards, and provide the next action in the learning path.

**Header/state:**

- Circular user avatar at left.
- Greeting: `Hi, Jaques`.
- Gem counter: diamond icon + `300`.
- Streak counter: flame icon + `7`.

**Main content:**

- Large rounded hero panel with the message: `You are about to code amazing things`.
- The word `amazing` is orange while the rest is dark brown.
- Section label: `Continue your path`.
- Vertical/diagonal progression with four day chips:
  - Day 1 — `Code a Button` (active, orange code icon).
  - Day 2 — `Style it` (locked).
  - Day 3 — `Add Hover Effect` (locked).
  - Day 4 — `Make it Interactive` (locked).
- Decorative green leaves on the left, green cactus on the right, and a small treasure chest near the lower right.

**Primary behavior implied:** tapping the active Day 1 item enters the Daily Path. Future days remain unavailable until the preceding work is complete.

### 2. Daily Path / Today’s Task

**Purpose:** give the learner a compact overview of today’s lesson and its four sequential steps.

**Header:**

- Back arrow.
- Centered title: `Today’s Task`.
- Calendar icon in a rounded square at right.

**Task card:**

- Eyebrow: `Day 1`.
- Title: `Code a Button`.
- Description: `Let’s build your first HTML button.`

**Step list:**

- Label: `Steps (1/4)`.
- Step 1 selected with orange numbered circle: `Create the HTML structure`.
- Step 2 locked: `Style the button`.
- Step 3 locked: `Add hover effect`.
- Step 4 locked: `Test your button`.

**Action:** full-width orange `Start Lesson` button.

**Primary behavior implied:** only the current step is actionable; completing a step unlocks the next one and updates the fraction.

### 3. Lesson

**Purpose:** present one focused learning step, an editable/code-like activity, a preview, and a validation action.

**Header/state:**

- X/close icon at left.
- Horizontal progress indicator: first segment orange, remaining segments pale gold.
- Heart counter at right: heart icon + `5`.

**Instruction:**

- Eyebrow: `Step 1 of 4`.
- Heading: `Create the HTML structure`.
- Supporting text: `Add the HTML code for a button element.`

**Practice area:**

- Dark charcoal code panel with line numbers 1–3.
- Example content visually resembles:

  - `<button>`
  - `Click me`
  - `</button>`

- Light preview card below with label `Preview` and a small cream `Click me` button.

**Actions:**

- Green full-width `Check` button for validation.
- Small circular lightbulb button for a hint/help affordance.

**Primary behavior implied:** learner edits or completes the code, previews the result, checks it, and either receives success or corrective feedback. The heart count represents a limited mistake/energy resource.

### 4. Success

**Purpose:** close the feedback loop immediately after a correct lesson step and motivate continuation.

**Header:** X at top right.

**Celebration:**

- Duck mascot floating/waving in the center.
- Orange star below the duck.
- Small orange and green confetti around the mascot.

**Copy:**

- `Excellent!`
- `You completed Step 1 🎉`
- `Keep going!`

**Rewards:** two side-by-side cards:

- Star icon + `+10 XP`.
- Flame icon + `1 Day streak`.

**Action:** full-width orange `Continue` button.

**Primary behavior implied:** award XP, update streak/progress, then return to the next step or Daily Path.

### 5. Courses

**Purpose:** show the available learning path and lesson completion state.

**Header:**

- Centered title: `Courses`.
- Filter/sliders icon in a rounded button at right.

**Path summary card:**

- Title: `Web Development Path`.
- Copy: `Learn step by step. Build real skills.`
- Progress text: `20% complete`.
- Short orange progress bar.

**Course units:**

1. `HTML Essentials` — `4/6 lessons` (available).
2. `CSS Basics` — `0/6 lessons` (locked icon).
3. `JavaScript Basics` — `Locked`.
4. `Mini Projects` — `Locked`.

The active Courses/path destination is represented by the orange list icon in the bottom nav.

### 6. Quests

**Purpose:** add optional daily/weekly goals that reinforce practice and reward consistency.

**Header:**

- Centered title: `Quests`.
- Small orange reward/quest badge at right with `3`.

**Tabs:**

- `Daily` selected with an orange underline.
- `Weekly`.
- `Achievements`.

**Daily quest cards:**

- `Complete today’s lesson` — `1/1`, green check badge.
- `Earn 20 XP` — `12/20`, yellow/orange XP badge.
- `Code 2 days in a row` — `1/2`, flame badge.
- `Complete 4 steps` — `1/4`, orange code badge.

Each row uses a short progress bar and a large right-side status/reward icon.

The trophy destination is active in the bottom nav.

### 7. Progress

**Purpose:** provide a compact dashboard for level, XP, streak, badges, weekly activity, and skill mastery.

**Level card:**

- Orange hexagonal badge with number `3`.
- `Level 3`.
- `Web Developer`.
- `120 / 250 XP`.
- Horizontal XP progress bar.

**Stats:** three small cards:

- Flame — `7` / `Day streak`.
- Star — `320` / `Total XP`.
- Trophy — `5` / `Badges`.

**Weekly Activity:**

- Labels Mon through Sun.
- Mon, Tue, Wed completed with orange check circles.
- Thu through Sun empty outlined circles.

**Skills:** a rounded card with horizontal bars:

- HTML — `60%`.
- CSS — `20%`.
- JavaScript — `0%`.

The trophy/progress destination is active in the bottom nav.

### 8. Profile

**Purpose:** provide identity, a quick personal summary, and links to account-related destinations.

**Header:**

- Settings gear at top right.

**Identity block:**

- Large circular duck avatar inside a pale round frame.
- Small pencil/edit control overlapping the lower-right edge.
- Name: `Jaques`.
- Tagline: `Keep coding, keep growing.`
- Rounded level pill: `Beginner` with a small gold icon.

**Stats:**

- Flame — `7` / `Day streak`.
- Star — `320` / `Total XP`.
- Trophy — `5` / `Badges`.

**Menu rows:**

- `Achievements` with trophy icon and chevron.
- `Shop` with gift/bag icon and chevron.
- `Settings` with gear icon and chevron.

The profile destination is active in the bottom nav.

### 9. Streak / Day Streak

**Purpose:** celebrate habit consistency and show the current weekly run.

**Header:** back arrow + `Day Streak`.

**Hero metric:**

- Large flame icon.
- Large number `7`.
- Caption: `days in a row!`.

**Week tracker:**

- Seven circular day markers labeled `M T W T F S S`.
- The first six are orange with checkmarks.
- The final Sunday marker is outlined and not completed.

**Encouragement card:**

- `Great job!`
- `You’re building an amazing habit.`

This screen is primarily motivational; it should feel spacious and celebratory rather than data-dense.

### 10. Shop

**Purpose:** let learners spend gems on boosts and recovery items.

**Header:** back arrow + `Shop`; gem balance `300` at right.

**Tabs:**

- `Items` selected with orange underline.
- `Themes`.

**Item grid:** 2 columns × 2 rows, each item in a rounded card with a large 3D/emoji-style icon, title, optional duration, and gem price:

- Blue crystal — `Streak Freeze` — gem icon `100`.
- Purple XP cube — `Double XP` — `(30 min)` — gem icon `150`.
- Yellow bulb — `Hint` — gem icon `100`.
- Red heart — `Health Refill` — flame icon `80`.

The cards should feel purchasable but remain soft and friendly; the gem cost is the main secondary emphasis.

### 11. Leaderboard

**Purpose:** introduce social comparison while keeping the learner’s own position visible.

**Header:** back arrow + `Leaderboard`.

**Tabs:**

- `Global` selected with orange underline.
- `Friends`.
- `Country`.

**Ranking list:** each row contains rank, avatar, name, and XP:

1. `Alex` — `1250 XP`.
2. `Maya` — `950 XP`.
3. `Omar` — `780 XP`.
4. `You` — `320 XP` (duck avatar and highlighted pale-orange row).
5. `Zain` — `280 XP`.

The highlighted self row is important: the screen should not make the learner search for their rank.

### 12. Settings

**Purpose:** manage preferences and account actions.

**Header:** back arrow + `Settings`.

**Preferences card:**

- Section label: `Preferences`.
- `Daily reminder` — green toggle on.
- `Sound effects` — green toggle on.
- `Dark mode` — pale/off toggle.
- `Language` — `English` on the right with a chevron. This is part of the supplied reference; Bataa’s English-only MVP can omit this row or show a non-interactive `English` label instead of offering a language switcher.

**Account card:**

- `Change password` with chevron.
- `Log out` with chevron and red text.

Rows are divided into two semantic cards, not one long undifferentiated list. Toggle controls are large enough to read as stateful controls at a glance.

## Interaction/state model inferred from the full set

### Learning progression

- A course is divided into ordered lessons/steps.
- Current content is available; future content is visibly locked.
- Completion updates the path, course percentage, XP, streak, and possibly quests.
- The success screen is a distinct state, not merely a toast.

### Gamification

- XP is the primary progress currency.
- Gems are a spendable currency.
- Streak days reward daily return behavior.
- Hearts/health represent limited failed attempts or energy during a lesson.
- Badges and achievements provide longer-term recognition.
- Quests create short-term, medium-term, and collection goals.

### Navigation

- Home is the motivational dashboard.
- The list/path tab owns Courses and Daily Path.
- The trophy tab owns Quests, Progress, and likely Leaderboard.
- Profile owns identity, settings, and account utilities.
- Detail screens use a back arrow; success/lesson contexts may use a close X.

### Content state examples visible in the reference

- Current step: selected orange row.
- Future step: lock icon and muted treatment.
- Completed quest: green check.
- In-progress quest: partial orange progress bar.
- Completed day: filled orange check circle.
- Uncompleted day: outlined circle.
- Self leaderboard row: highlighted background.
- Enabled preference: green switch.
- Disabled preference: pale switch.

## Assets and illustration direction

- The duck mascot is the central brand character and should retain a soft 3D, toy-like appearance.
- Reward objects are similarly dimensional and slightly glossy rather than flat line icons.
- Decorative objects are sparse and localized: leaves, cactus, treasure chest, confetti, star, crystals, bulb, heart, flame.
- Use illustrations to reinforce meaning and celebration; do not let decoration obscure task text or controls.

## Relationship to the existing repository

The current repository is a Bataa marketing site with a landing route and a registration route. It does not yet implement these twelve product screens, learner state, course data, authentication, or reward mechanics. This reference therefore represents a future logged-in mobile product/app experience, not a direct description of the current web landing page.

Existing brand elements that align with this reference include the warm cream/orange palette, duck mascot assets, and career-learning positioning. Bataa’s mobile experience is English-only; the reference adds a concrete gamified information architecture and should be treated as a product-flow reference if the app experience is built later.

## Design principles to preserve

1. Always show the learner what to do next.
2. Make locked content understandable, not mysterious.
3. Reward completion immediately and visibly.
4. Keep copy short, encouraging, and beginner-friendly.
5. Prefer warm cream surfaces and dark brown text over stark white/black.
6. Use orange for action and progress, green for success, and gold for rewards.
7. Keep the bottom navigation consistent across the product.
8. Make the learner’s own progress and leaderboard position obvious.
9. Use the duck as a companion and celebration device, not as a distraction.
10. Preserve generous rounded cards, soft depth, and a tactile mobile-game feel.
