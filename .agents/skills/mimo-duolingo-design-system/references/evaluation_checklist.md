# Bataa Mobile Evaluation Checklist

Run this checklist on every completed flow. A critical failure blocks completion.

## 1. Learning integrity

- [ ] The screen has one explicit learning objective.
- [ ] The learner performs a real or representative coding action.
- [ ] Validation checks the objective rather than irrelevant exact formatting.
- [ ] The visible output makes code consequences understandable.
- [ ] Mistakes produce explanation and unlimited retry.
- [ ] Completion states what the learner can now do.

Critical failures: trivia replaces a feasible hands-on task; correct equivalent code is rejected; mistakes block the lesson.

## 2. Hierarchy and system status

- [ ] The primary action is obvious within three seconds.
- [ ] Onboarding/lesson progress is visible and accurate.
- [ ] Selected, busy, invalid, completed, and locked states are distinct.
- [ ] The next available lesson is unmistakable.
- [ ] Loading longer than a brief response has purposeful feedback.

Critical failures: two actions compete as primary; a user cannot tell whether work saved or submitted.

## 3. Cognitive load

- [ ] Each onboarding screen asks one question.
- [ ] Choice sets are limited and grouped clearly.
- [ ] Instructions are short and use recognition rather than hidden recall.
- [ ] Lesson chrome contains only information needed now.
- [ ] Completion shows a small set of meaningful results.

## 4. Control and recovery

- [ ] Back navigation preserves valid answers and drafts.
- [ ] The learner can leave and resume a lesson.
- [ ] Recommendations can be overridden.
- [ ] Help and hints are visible in context.
- [ ] Locked states explain their prerequisites.
- [ ] There is no punitive heart gate or guilt copy.

## 5. Navigation and discoverability

- [ ] New users do not need to memorize icons.
- [ ] Bottom navigation items have persistent labels.
- [ ] Current location is exposed visually and semantically.
- [ ] Empty destinations are not shown.
- [ ] Glossary, mistake review, and settings are reachable without deep hunting.

Critical failure: essential navigation or help is icon-only.

## 6. Bataa identity

- [ ] Cream, orange, and warm-brown tokens are used consistently.
- [ ] Components use the Bataa tactile language without copying Duolingo assets.
- [ ] The duck supports instruction or feedback rather than filling space.
- [ ] Mascot motion is event-driven and does not constantly hover or hop.
- [ ] Copy sounds supportive, specific, and appropriate for coding learners.

## 7. Accessibility and RTL

- [ ] All targets meet the minimum touch size.
- [ ] All controls are keyboard and screen-reader operable.
- [ ] Feedback does not depend on color, sound, or animation alone.
- [ ] Focus is visible and moves predictably after feedback.
- [ ] Arabic RTL and English LTR both render correctly.
- [ ] Code remains LTR inside Arabic screens.
- [ ] Large text and reduced motion remain usable.

Critical failures: inaccessible primary task; unreadable contrast; broken RTL order; keyboard traps.

## 8. Retention ethics

- [ ] The reward emphasizes the artifact or skill before XP.
- [ ] Streaks allow rest/recovery.
- [ ] Notifications are factual, controllable, and non-manipulative.
- [ ] Review strengthens mistakes rather than farming activity.
- [ ] Social competition is optional.

## 9. Mobile QA matrix

Test at minimum:

- 360 x 800 and 390 x 844 CSS pixels.
- Arabic RTL and English LTR.
- Default and 200% text size.
- Touch, keyboard, and screen reader.
- Reduced motion on and off.
- Offline interruption and resume during a lesson.
- Software keyboard open during code input.

## Completion gate

Call the work complete only when:

1. No critical failures remain.
2. The primary path works from entry through resume/exit.
3. Arabic RTL and accessibility checks pass.
4. The learning objective can be demonstrated in the final output.
5. The screen remains recognizably Bataa rather than a reskinned Duolingo screen.
