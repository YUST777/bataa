# UI View Hierarchy, Custom Components & Navigation Graphs

## 1. Duolingo Juicy Component Hierarchy

### `JuicyButton` (3D Physical Button)
- **Lip Height**: `4.0dp` (`@dimen/juicyLipHeight`)
- **Corner Radius**: `16.0dp` (`@dimen/duoSpacing16`)
- **Minimum Height**: `52.0dp`
- **Face Layer**: `@color/juicyOwl` (`#58cc02`) / `@color/juicyMacaw` (`#1cb0f6`)
- **Lip Layer**: `@color/juicyTreeFrog` (`#58a700`) / `@color/juicyWhale` (`#1899d6`)

### `PointingCardView` (Mascot Speech Bubble)
- Attributes: `app:arrowDirection="start|top|end|bottom"`, `app:arrowOffset="20.0dp"`, `app:arrowWidth="12.0dp"`, `app:arrowHeight="16.0dp"`, `app:cornerRadius="16.0dp"`.

---

## 2. Mimo Navigation Graph (12-Step Psychological Flow)

Graph: `res/navigation/nav_onboarding_graph.xml`
1. `IntroductionFragment`
2. `SetMotiveFragment` -> `OnboardingMotiveReassuranceFragment`
3. `SetOccupationFragment`
4. `SetExperienceFragment`
5. `OnboardingSelectPathContainerFragment` -> `OnboardingPathReassuranceFragment`
6. `OnboardingSetDailyGoalFragment` -> `PathCompletionEstimationFragment`
7. `SetReminderTimeFragment`
8. `OnboardingDevicePreferenceFragment` -> `OnboardingDeviceReassuranceFragment`
9. `HonestFreeTrialFragment` (7-Day Soft Paywall with Day 5 reminder)
10. `OnboardingPreparingCurriculumFragment`
