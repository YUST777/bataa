/**
 * Bataa Habit Formation & Retention Engine
 * Reverse-Engineered from Duolingo (2024) & Mimo (2024) Core Algorithms
 */

// ============================================================================
// 1. DATA TYPES & INTERFACES
// ============================================================================

export type StreakStatus = "ACTIVE" | "AT_RISK" | "FROZEN" | "LOST" | "REPAIRED";

export interface UserHabitProfile {
  userId: string;
  timezone: string; // e.g. "Africa/Cairo", "Asia/Riyadh"
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD in user local timezone
  streakFreezesAvailable: number;
  activeXpBoostMultiplier: number;
  xpBoostExpiresAt: number | null; // Unix timestamp ms
  earlyBirdChestClaimable: boolean;
  nightOwlChestClaimable: boolean;
  dailyGoalMinutes: number; // 5 (Casual), 15 (Regular), 30 (Serious)
  totalDailyXpEarned: number;
  preferredReminderTime: string; // "HH:mm"
  friendStreakPartners: Array<{
    partnerId: string;
    partnerName: string;
    sharedStreakDays: number;
    partnerActiveToday: boolean;
  }>;
}

export interface MemoryNode {
  conceptId: string;
  totalAttempts: number;
  successfulAttempts: number;
  lastReviewedTimestamp: number; // Unix ms
  halfLifeHours: number; // Estimated half-life h
}

// ============================================================================
// 2. TIMEZONE-AWARE MIDNIGHT & GRACE WINDOW CALCULATOR
// ============================================================================

export class HabitTimeEngine {
  static getLocalTimeInfo(timezone: string, nowMs: number = Date.now()): { dateStr: string; hour: number; minutes: number } {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date(nowMs));
    const pMap: Record<string, string> = {};
    parts.forEach(p => (pMap[p.type] = p.value));
    
    return {
      dateStr: pMap.year + "-" + pMap.month + "-" + pMap.day,
      hour: parseInt(pMap.hour, 10),
      minutes: parseInt(pMap.minute, 10),
    };
  }

  static getDayDifference(dateA: string, dateB: string): number {
    const dtA = new Date(dateA + "T00:00:00Z").getTime();
    const dtB = new Date(dateB + "T00:00:00Z").getTime();
    return Math.round((dtB - dtA) / (1000 * 60 * 60 * 24));
  }
}

// ============================================================================
// 3. STREAK STATE MACHINE WITH NIGHT OWL GRACE & FREEZE INSURANCE
// ============================================================================

export class StreakEngine {
  static evaluateStreak(profile: UserHabitProfile, nowMs: number = Date.now()): {
    newProfile: UserHabitProfile;
    status: StreakStatus;
    eventTriggered: "STREAK_INCREMENTED" | "STREAK_PRESERVED" | "FREEZE_CONSUMED" | "STREAK_LOST" | "NO_CHANGE";
  } {
    const { dateStr, hour } = HabitTimeEngine.getLocalTimeInfo(profile.timezone, nowMs);
    const dayDiff = HabitTimeEngine.getDayDifference(profile.lastActiveDate, dateStr);
    const updated = { ...profile };

    // Case 1: Already active today
    if (dayDiff === 0) {
      return { newProfile: updated, status: "ACTIVE", eventTriggered: "NO_CHANGE" };
    }

    // Case 2: Consecutive day active (1 day difference)
    if (dayDiff === 1) {
      updated.currentStreak += 1;
      if (updated.currentStreak > updated.longestStreak) {
        updated.longestStreak = updated.currentStreak;
      }
      updated.lastActiveDate = dateStr;
      return { newProfile: updated, status: "ACTIVE", eventTriggered: "STREAK_INCREMENTED" };
    }

    // Case 3: Missed 1 day (dayDiff == 2) -> Check Freeze or Night Owl Grace
    if (dayDiff === 2) {
      // 00:00 to 03:00 Night Owl Grace period for previous day
      if (hour < 3) {
        updated.currentStreak += 1;
        updated.lastActiveDate = dateStr;
        return { newProfile: updated, status: "ACTIVE", eventTriggered: "STREAK_INCREMENTED" };
      }

      // Check if Streak Freeze is available
      if (updated.streakFreezesAvailable > 0) {
        updated.streakFreezesAvailable -= 1;
        updated.lastActiveDate = dateStr; // Protected
        return { newProfile: updated, status: "FROZEN", eventTriggered: "FREEZE_CONSUMED" };
      }

      // Lost Streak
      updated.currentStreak = 1;
      updated.lastActiveDate = dateStr;
      return { newProfile: updated, status: "LOST", eventTriggered: "STREAK_LOST" };
    }

    // Case 4: Missed multiple days (> 2)
    updated.currentStreak = 1;
    updated.lastActiveDate = dateStr;
    return { newProfile: updated, status: "LOST", eventTriggered: "STREAK_LOST" };
  }
}

// ============================================================================
// 4. INTERLOCKING DIURNAL CHEST LOOP (EARLY BIRD & NIGHT OWL)
// ============================================================================

export class DiurnalChestEngine {
  static processLessonCompleted(profile: UserHabitProfile, nowMs: number = Date.now()): {
    newProfile: UserHabitProfile;
    chestEarned: "EARLY_BIRD" | "NIGHT_OWL" | null;
  } {
    const { hour } = HabitTimeEngine.getLocalTimeInfo(profile.timezone, nowMs);
    const updated = { ...profile };
    let chestEarned: "EARLY_BIRD" | "NIGHT_OWL" | null = null;

    if (hour >= 6 && hour < 12) {
      updated.earlyBirdChestClaimable = true;
      chestEarned = "EARLY_BIRD";
    } else if (hour >= 18 && hour < 24) {
      updated.nightOwlChestClaimable = true;
      chestEarned = "NIGHT_OWL";
    }

    return { newProfile: updated, chestEarned };
  }

  static claimChest(profile: UserHabitProfile, chestType: "EARLY_BIRD" | "NIGHT_OWL", nowMs: number = Date.now()): UserHabitProfile {
    const { hour } = HabitTimeEngine.getLocalTimeInfo(profile.timezone, nowMs);
    const updated = { ...profile };

    if (chestType === "EARLY_BIRD" && updated.earlyBirdChestClaimable && hour >= 18 && hour < 24) {
      updated.earlyBirdChestClaimable = false;
      updated.activeXpBoostMultiplier = 2.0;
      updated.xpBoostExpiresAt = nowMs + 15 * 60 * 1000; // 15 mins
    } else if (chestType === "NIGHT_OWL" && updated.nightOwlChestClaimable && hour >= 6 && hour < 12) {
      updated.nightOwlChestClaimable = false;
      updated.activeXpBoostMultiplier = 2.0;
      updated.xpBoostExpiresAt = nowMs + 15 * 60 * 1000; // 15 mins
    }

    return updated;
  }
}

// ============================================================================
// 5. HALF-LIFE REGRESSION (HLR) SPACED REPETITION ALGORITHM
// ============================================================================

export class SpacedRepetitionHLR {
  static calculateRecallProbability(node: MemoryNode, nowMs: number = Date.now()): number {
    const deltaHours = (nowMs - node.lastReviewedTimestamp) / (1000 * 60 * 60);
    return Math.pow(2, -deltaHours / Math.max(0.1, node.halfLifeHours));
  }

  static recordAttempt(node: MemoryNode, correct: boolean, nowMs: number = Date.now()): MemoryNode {
    const updated = { ...node };
    updated.totalAttempts += 1;
    if (correct) {
      updated.successfulAttempts += 1;
      const successRatio = updated.successfulAttempts / updated.totalAttempts;
      updated.halfLifeHours = Math.max(1.0, updated.halfLifeHours * (1.8 + 0.8 * successRatio));
    } else {
      updated.halfLifeHours = Math.max(0.5, updated.halfLifeHours * 0.45);
    }
    updated.lastReviewedTimestamp = nowMs;
    return updated;
  }

  static getConceptsDueForReview(nodes: MemoryNode[], nowMs: number = Date.now()): MemoryNode[] {
    return nodes
      .filter(n => this.calculateRecallProbability(n, nowMs) < 0.70)
      .sort((a, b) => this.calculateRecallProbability(a, nowMs) - this.calculateRecallProbability(b, nowMs));
  }
}

// ============================================================================
// 6. NOTIFICATION ORCHESTRATION & CADENCE SCHEDULER
// ============================================================================

export interface ScheduledPushNotification {
  id: string;
  userId: string;
  triggerTimeStr: string;
  urgencyLevel: "LOW_CURIOSITY" | "MEDIUM_REMINDER" | "HIGH_DANGER" | "CRITICAL_COUNTDOWN";
  arabicTitle: string;
  arabicBody: string;
  mascotState: "HAPPY" | "WAVING" | "CRYING" | "FIRE_ALERT";
}

export class NotificationScheduler {
  static generateDailyNotificationSchedule(profile: UserHabitProfile, nowMs: number = Date.now()): ScheduledPushNotification[] {
    const { dateStr } = HabitTimeEngine.getLocalTimeInfo(profile.timezone, nowMs);
    const dayDiff = HabitTimeEngine.getDayDifference(profile.lastActiveDate, dateStr);

    if (dayDiff === 0) {
      if (profile.earlyBirdChestClaimable) {
        return [{
          id: "early_bird_reminder",
          userId: profile.userId,
          triggerTimeStr: "19:00",
          urgencyLevel: "LOW_CURIOSITY",
          arabicTitle: "صندوق طائر الصباح جاهز!",
          arabicBody: "ضاعف نقاطك الآن! اضغط لتفعيل مضاعف الـ XP لمدة 15 دقيقة.",
          mascotState: "HAPPY",
        }];
      }
      return [];
    }

    return [
      {
        id: "soft_curiosity_nudge",
        userId: profile.userId,
        triggerTimeStr: profile.preferredReminderTime || "14:00",
        urgencyLevel: "LOW_CURIOSITY",
        arabicTitle: "بطة تنتظرك في بلندر!",
        arabicBody: "5 دقائق فقط اليوم لتتعلم مهارة جديدة وتحافظ على تقدمك.",
        mascotState: "WAVING",
      },
      {
        id: "evening_streak_warning",
        userId: profile.userId,
        triggerTimeStr: "18:30",
        urgencyLevel: "MEDIUM_REMINDER",
        arabicTitle: "حماسك في خطر! حافظ على سلسلتك",
        arabicBody: "لا تدع سلسلتك تضيع اليوم. تمرين واحد سريع يفصلك عن الحفاظ عليها!",
        mascotState: "FIRE_ALERT",
      },
      {
        id: "night_danger_alert",
        userId: profile.userId,
        triggerTimeStr: "21:45",
        urgencyLevel: "HIGH_DANGER",
        arabicTitle: "بطة حزينة... باقٍ ساعتان فقط!",
        arabicBody: "أنت على وشك خسارة سلسلتك. أكمل درساً صغيراً الآن.",
        mascotState: "CRYING",
      },
      {
        id: "critical_midnight_countdown",
        userId: profile.userId,
        triggerTimeStr: "23:15",
        urgencyLevel: "CRITICAL_COUNTDOWN",
        arabicTitle: "الفرصة الأخيرة قبل منتصف الليل!",
        arabicBody: "45 دقيقة متبقية لإنقاذ السلسلة! اضغط الآن قبل فوات الأوان.",
        mascotState: "FIRE_ALERT",
      }
    ];
  }
}
