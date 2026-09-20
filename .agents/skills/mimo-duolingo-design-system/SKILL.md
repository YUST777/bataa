---
name: mimo-duolingo-design-system
description: >-
  Design, build, or audit Bataa's Duolingo-inspired mobile coding-learning app using the complete Behance Duolingo UI/UX case study. Use for mobile onboarding, course paths, daily coding lessons, tactile components, mascot behavior, progress, streaks, completion, review, Arabic RTL, accessibility, and the Web Design curriculum. Exclude the separate desktop tutor application.
---

# Bataa Mobile Learning Design System

Build Bataa as an original mobile coding-learning product. Apply the learning and interaction rules documented in the Duolingo case study; do not reproduce Duolingo artwork, layouts, copy, characters, or brand tokens.

## Fix the product boundary

- Treat the Bataa phone app as the product in scope.
- Treat the desktop tutor, desktop overlays, native-app control, installation checks, and computer vision as out of scope.
- Start the curriculum with Web Design and the first daily lesson, **Build your first button**.
- Design mobile-first. Support both Arabic RTL and English LTR.

## Work in this order

1. Inspect the existing routes, components, tokens, and content before changing them.
2. Identify the learner state, learning objective, and single primary action for each screen.
3. Read only the references routed below, plus `research_synthesis.md` when making a new product-level decision.
4. Model the complete state flow before styling: entry, valid action, mistake, explanation, retry, success, exit, and resume.
5. Build with the existing React, TypeScript, TanStack Router, shadcn-style primitives, Lucide, Framer Motion, and Rive stack unless the repository says otherwise.
6. Verify the flow on a narrow phone viewport, in Arabic RTL, by keyboard, and with reduced motion.
7. Audit the result with `evaluation_checklist.md` before declaring it finished.

When the Appllama MCP is connected, apply the installed `appllama-usage` and
`appllama-app-design-skill` skills before designing a new mobile screen. Start
with the free credit check, study the whole relevant flow in journey order,
save notes and expiring media promptly, extract the interaction grammar rather
than pixels, then run the mobile implementation and full-flow verification bar.
If the current repository is not Expo/React Native, preserve its existing
stack while applying the same research, navigation, motion, and anti-slop
principles.

## Apply the non-negotiable rules

- Give each onboarding screen one question or decision.
- Keep progress visible during onboarding and lessons.
- Use one large bottom primary CTA; disable it until the current answer is valid.
- Make the current lesson unmistakable without relying on color alone.
- Keep lesson chrome quiet so the learner focuses on the task.
- Give feedback immediately after submission.
- Explain mistakes in plain language and allow unlimited retries.
- Separate completion celebration from review and mistake correction.
- Label navigation items. Never require a new learner to memorize icons.
- Use the duck mascot to explain, point, react, wait, and celebrate at meaningful events.
- Do not animate the mascot with perpetual hopping, hovering, or attention-stealing motion.
- Use gentle streaks with rest or recovery. Do not use punitive hearts or guilt copy.
- Show progress toward real coding capability, not XP alone.
- Preserve Bataa's cream, orange, warm-brown identity and original duck mascot.

## Route to the right reference

| Task | Read |
| --- | --- |
| Understand what came from the case study | `references/research_synthesis.md` |
| Set product principles, voice, or information architecture | `references/bataa_foundations.md` |
| Build or revise mobile onboarding | `references/onboarding_patterns.md` |
| Build the course path, daily goal, streak, or progress systems | `references/course_path_and_retention.md` |
| Build a lesson, validation flow, completion, or review | `references/lesson_engine.md` |
| Animate or place the duck mascot | `references/mascot_orchestration.md` |
| Choose screen components, route graphs, guards, or back behavior | `references/ui_components_and_navigation_graphs.md` |
| Build buttons, cards, lesson shells, or visual tokens | `references/component_system.md` and `references/ui_tokens.json` |
| Implement Arabic, RTL, focus, contrast, or reduced motion | `references/accessibility_and_rtl.md` |
| Choose routes, TypeScript models, or state boundaries | `references/system_design_architecture.md` |
| Design mobile APIs, offline sync, persistence, or telemetry | `references/network_api_and_database_schemas.md` |
| Research top-grossing mobile apps with Appllama | Installed `appllama-usage` skill and connected `appllama` MCP |
| Build or polish native-feeling mobile screens | Installed `appllama-app-design-skill` skill |
| Review a screen or decide whether it is complete | `references/evaluation_checklist.md` |

## Use the core mobile learning loop

`Course path -> lesson brief -> focused task -> submit -> validate -> explain/retry or celebrate -> completion summary -> optional review -> next lesson`

Every new feature must strengthen at least one part of this loop. Reject features that add pressure, visual noise, or game currency without improving learning, clarity, or return behavior.

## Adapt coding tasks, not language exercises

Translate the case study's task variety into coding interactions:

- Reorder language tokens -> reorder HTML or CSS fragments.
- Choose an image -> choose the correct visual output.
- Match pairs -> match a property with its effect.
- Listen and choose -> inspect a requirement and choose the correct implementation.
- Speak -> explain a coding decision in the learner's own words.
- Translate -> convert a visual brief into code.
- Correct a sentence -> diagnose and repair broken code.

Use real browser output wherever practical. Do not turn coding into trivia when the learner can perform the skill.

## Return task-appropriate results

- For implementation requests, change the app and verify the complete affected flow.
- For design requests, specify learner state, hierarchy, actions, feedback, content, RTL behavior, and motion.
- For audits, report evidence against the checklist, then give concrete fixes in priority order.
- For curriculum requests, state the real-world capability, task sequence, validation rules, hints, completion evidence, and review exercise.

## Respect the source

Use the Behance project as research evidence only. Its published work is not licensed as a Bataa asset library. Encode principles and findings; do not package or redistribute its boards, mockups, mascot, copy, icons, or screenshots.
