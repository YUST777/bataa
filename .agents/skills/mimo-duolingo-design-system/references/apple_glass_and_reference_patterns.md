# Apple, Glass, and Reference Pattern Guidance

This guide records the free research completed for Bataa's phone app. It turns
the references into constraints and patterns; it does not copy their pixels,
assets, code, or brand language.

## Contents

- [Product boundary](#product-boundary)
- [Apple-inspired mobile baseline](#apple-inspired-mobile-baseline)
- [Restrained Bataa glass](#restrained-bataa-glass)
- [What the linked sites contribute](#what-the-linked-sites-contribute)
- [Open-source reference audit](#open-source-reference-audit)
- [Recommended Bataa implementation direction](#recommended-bataa-implementation-direction)
- [QA gate before implementation](#qa-gate-before-implementation)

## Product boundary

- Bataa is a phone app for iPhone and Android. The separate desktop tutor is
  out of scope here.
- The first course is Web Design, taught through short, hands-on daily builds.
- Apple is the platform baseline, not Bataa's visual identity. Bataa keeps its
  warm cream, orange, brown, and original duck.

## Apple-inspired mobile baseline

Use the installed `apple-ui-designer` and `ios-liquid-glass` skills as platform
references when a screen needs native-feeling behavior. Apply their principles
to React Native/Expo rather than importing SwiftUI code.

- Prefer platform typography hierarchy, readable system-like sans text, and
  semantic color roles over decorative type or color coding.
- Respect safe areas, the home indicator, Dynamic Type, keyboard avoidance, and
  one-handed reach. Every important control is at least 44pt and has a visible
  label or accessible name.
- Use standard push navigation for deeper content, sheets for short self-contained
  tasks, and replacement navigation after a completed one-way onboarding flow.
- Keep tabs as peer destinations with visible labels. Do not make a learner
  memorize icon-only navigation.
- Use calm fades and short spatial transitions. Avoid bounce, perpetual mascot
  motion, and animation that moves text the learner is reading.
- Prefer native controls, continuous corners, and one consistent spacing/radius
  scale. A custom component must earn its place by improving the coding task.

## Restrained Bataa glass

Liquid/glass material belongs to the navigation and control layer. It must not
become the default treatment for lesson content, code, or every card.

1. Use a translucent warm-cream surface for a floating tab bar, compact toolbar,
   or temporary control cluster over changing content.
2. Tint glass toward Bataa's cream (`surfaceWarm`) and orange only for active
   controls. Never import the reference skills' blue, purple, or neon tokens.
3. Pair translucency with a quiet warm border and shadow so hierarchy survives
   screenshots, low contrast displays, and Android fallbacks.
4. When Reduce Transparency or Increase Contrast is enabled, switch to the
   opaque `surface`/`surfaceWarm` token with a stronger border. When Reduce
   Motion is enabled, remove morphing and use a cross-fade.
5. Multiple glass elements that morph together belong to one container. Keep
   transitions rare and functional: reveal a related action group or preserve
   spatial continuity after a tap. Never use gooey motion to celebrate an answer.

Suggested semantic tokens (to be reconciled with the app token file):

| Token | Default | Fallback/use |
| --- | --- | --- |
| `surface.glass` | `rgba(255, 249, 241, 0.78)` | `surfaceWarm` when transparency is reduced |
| `surface.glassStrong` | `rgba(255, 255, 255, 0.9)` | `surface` |
| `border.glass` | `rgba(191, 174, 157, 0.52)` | `border.strong` |
| `shadow.glass` | `0 8px 24px rgba(97, 61, 28, 0.12)` | `depth.card` |

## What the linked sites contribute

### VibeUI

VibeUI is a 92-prompt library organized by task (auth, pricing, hero, bento,
navigation, onboarding, and empty states). Useful patterns for Bataa include:

- Split visual + form for an optional account entry screen.
- Minimal single-column content when a learner has one decision to make.
- Stacked mobile-first cards when a path needs comparison without a dense table.
- Guided-tour tooltips, checklist progress, and an illustrated empty state for
  onboarding or first-run education.
- A consistent card anatomy: preview, short title, explanation, then one clear
  action. This maps well to lesson previews and project cards.

Use the information architecture and action hierarchy, not the site's copy,
artwork, or exact card styling. VibeUI is a desktop prompt library, so test
every pattern at a narrow phone width before adoption.

### Liquid Gooey

Liquid Gooey demonstrates a small `Liquid` container with items that morph or
move around a single trigger. It is a useful reference for a compact overflow
menu or related action cluster. For Bataa:

- Keep the trigger, resulting actions, and labels discoverable and accessible.
- Use one calm, short transition with a non-animated fallback.
- Do not use blur/contrast filters behind code editors, lesson text, or the
  course path; sampled content becomes harder to read and the effect adds noise.
- Treat the library as an optional implementation reference, not a required
  dependency. A simple opacity/position transition is preferable when it is
  clearer or more performant.

## Open-source reference audit

These repositories were checked on 2026-08-31. They are references, not a
license to reuse Duolingo artwork, copy, characters, or screenshots.

| Repository | Evidence | Bataa use | Reuse rule |
| --- | --- | --- | --- |
| [`sanidhyy/duolingo-clone`](https://github.com/sanidhyy/duolingo-clone) | 635 stars, MIT, active TypeScript/Next.js app; Drizzle, Radix/shadcn-style UI, Zustand, lesson/progress actions | Strongest structural reference for course units, lesson state, progress, and admin/data boundaries | MIT permits reuse with notice; port behavior, not branding or web layout |
| [`bryanjenningz/react-duolingo`](https://github.com/bryanjenningz/react-duolingo) | 469 stars, MIT, React/Next/Tailwind/Zustand; small web clone | Useful for simple state modeling and responsive path ideas | MIT permits reuse with notice; web-only and older dependencies |
| [`adrianhajdin/react-native-lingua`](https://github.com/adrianhajdin/react-native-lingua) | 133 stars, Expo/RN/TypeScript/NativeWind; real-time AI teacher and onboarding | Closest stack reference for Expo navigation, auth boundaries, and lesson shells | No repository license was found; study only unless the author grants permission |
| [`mohannadofficial/duolingo-nextjs`](https://github.com/mohannadofficial/duolingo-nextjs) | 76 stars, MIT; Next.js, shadcn, Drizzle/Postgres, quests and progress | Reference for data-backed lesson/quest schemas and shadcn component composition | MIT permits reuse with notice; server-heavy and not a phone baseline |
| [`Kavi-priyan/Offline-first-Digital-learning-Platform-for-organizations`](https://github.com/Kavi-priyan/Offline-first-Digital-learning-Platform-for-organizations) | 2 stars; Expo + SQLite + video + offline sync monorepo | Architecture ideas for offline lesson data and sync | No repository license was found; study only |

Do not clone a repository wholesale. Build Bataa's own Expo Router + React
Native + TypeScript foundation, then borrow only compatible, licensed generic
patterns. Keep a NOTICE file if MIT code is ever copied, and record the source
and commit in the engineering notes.

## Recommended Bataa implementation direction

- Expo Router, React Native, and TypeScript for one iPhone/Android codebase.
- `react-native-safe-area-context`, native controls, and platform symbols for
  platform fidelity.
- Reanimated only for purposeful interaction feedback, sheets, and rare mascot
  moments; honor reduced motion.
- Zustand (or an equivalent small store) for learner/session state, with a
  repository boundary around lesson progress.
- SQLite/Expo SQLite for offline-first lesson progress once persistence is
  needed; sync must be idempotent and conflict-safe.
- Keep Bataa's existing token file as the color/radius/spacing source of truth.
  Add semantic glass tokens only when a real control needs them.

## QA gate before implementation

- Does the screen have one learner decision and one primary action?
- Are all destinations labeled and all touch targets at least 44pt?
- Does the screen remain legible with glass disabled, larger text, RTL, and
  reduced motion/transparency?
- Is the accent still Bataa orange, with no purple/blue glass drift?
- Is any morphing transition rare, short, and tied to a user action?
- Are borrowed assets/code covered by an explicit permissive license?
