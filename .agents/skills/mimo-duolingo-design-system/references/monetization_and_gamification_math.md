# Monetization Psychology & Gamification Math

## 1. The "Honest Free Trial" Timeline (Mimo Pattern)

Layout: `free_trial_honest_fragment.xml`
- Visual 3-node timeline:
  - **Node 1 (Today)**: Instant unlock of Pro features (No charge today).
  - **Node 2 (Day 5)**: Push notification & email reminder sent: "Your trial ends in 2 days".
  - **Node 3 (Day 7)**: Billing begins (Cancel anytime with 1-click in Settings).
- Result: Lowers friction and builds user trust, increasing trial-to-paid conversion by ~28%.

## 2. Streak Drawer & Society Retention (Duolingo Pattern)

Layout: `full_page_streak_drawer_status.xml`
- Pinned flame icon in header opens full-height bottom sheet.
- **Streak Status Card**: Calendar heat map showing completed vs missed days with active Freeze icon.
- **Streak Society Milestones**:
  - 7 Days: Flame Bronze Badge
  - 30 Days: Custom VIP App Icon Unlocked
  - 100 Days: Free Streak Freeze bundle + VIP avatar frame
  - 365 Days: Diamond Hall of Fame
- **Friend Streaks**: Shared accountability mechanic requiring daily check-in from both participants.

## 3. Weekly League Promotion Math

Layout: `fragment_leagues_session_end.xml`
- Cohort Size: 30 users grouped by similar XP generation velocity.
- Division Ranks:
  - Rank 1-7: **Promote** to next division + Bonus Gem Chest.
  - Rank 8-25: **Stay** in current division.
  - Rank 26-30: **Demote** to lower division.
- Reset Timer: Every Sunday 23:59 UTC.
