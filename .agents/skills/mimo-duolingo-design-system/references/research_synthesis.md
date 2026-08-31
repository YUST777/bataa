# Behance Case Study Research Synthesis

## Source and scope

Primary source: [Duolingo UI/UX Case Study and Redesign](https://www.behance.net/gallery/223329667/Duolingo-UIUX-Case-Study-And-Redesign).

The study was reviewed across the complete project rather than a single linked module: its long case-study board, toolkit, competitive analysis, user journey, screen analysis, UX-law annotations, onboarding flow, lesson flow, heuristic evaluation, information architecture, wireframes, high-fidelity redesign, prototype, accessibility notes, and user-testing findings.

Treat this reference as a synthesis of reusable rules. Do not copy its visual assets.

## Strong patterns supported by the study

### Reduce each moment to one decision

- Hick's Law: limit choices and reveal complexity progressively.
- Tesler's Law: let the product absorb complexity instead of making the learner configure everything.
- Fitts's Law: make primary targets large, near the thumb zone, and easy to reach.
- Proximity, similarity, common region, and uniform connectedness: group related answers and keep unrelated actions visually separate.

### Make state and momentum obvious

- Keep progress visible through onboarding and a lesson.
- Use the Von Restorff effect sparingly to distinguish the primary CTA or active lesson.
- Use the Goal Gradient effect to make a nearby lesson or unit finish feel achievable.
- Use the Zeigarnik effect through a visible incomplete next step, not through guilt notifications.
- Use the Doherty Threshold: react quickly enough that input feels acknowledged; use purposeful loading feedback when work is not instant.

### Protect working memory

- Keep instructions short and in plain language.
- Show only the tools and choices needed for the current task.
- Limit completion statistics to a small set with clear meaning.
- Use recognition through visible labels, examples, and previews instead of recall of hidden icon meanings.

### Structure the learning loop

- Begin with a clear task and visible remaining progress.
- Mix task forms to avoid repetition while preserving one learning objective.
- Give immediate, consistent success or correction feedback.
- Separate lesson completion from recap, concepts learned, and mistake review.
- Make help, hints, and recovery visible inside the learning context.

## Problems identified by the study

- New users struggled with unclear iconography even when existing users found the redesign intuitive.
- Icon-only bottom navigation creates a learned-interface tax.
- Over-gamification can weaken real-world relevance.
- Repetitive task formats lead to boredom.
- Limited screen-reader support and accessibility settings exclude learners.
- Color-only or overly visual feedback creates ambiguity.
- Help hidden several layers deep harms recovery.
- Rigid paths and limited undo reduce learner control.
- Streak loss creates guilt and notification pressure.

Turn every one of these findings into a guardrail for Bataa.

## Bataa translation matrix

| Reference insight | Bataa mobile rule |
| --- | --- |
| Language course map | Web Design path organized by demonstrable projects and concepts. |
| Word/sentence exercise | HTML/CSS task with live browser output. |
| Correct translation | Code satisfies semantic and visual acceptance rules. |
| Mistake feedback | Point to the incorrect code or outcome, explain why, and allow retry. |
| XP and streak | Secondary motivation behind project progress and skill mastery. |
| Mascot dialogue | Duck provides concise instruction, hint, correction, and celebration. |
| Lesson recap | Show concepts used, output built, mistakes resolved, and next capability. |
| Dictionary | Searchable HTML/CSS glossary with examples. |
| Hearts | Do not copy; Bataa allows unlimited learning retries. |

## Evidence hierarchy

When patterns conflict, prefer:

1. Real learning and correct coding behavior.
2. Accessibility and learner control.
3. Clear system status and recovery.
4. Consistent Bataa product language.
5. Motivation and delight.
6. Decorative similarity to any reference.

The last item must never overrule the first five.
