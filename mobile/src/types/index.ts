export type Language = 'en' | 'ar';

export type ScreenTab = 'home' | 'path' | 'quests' | 'profile';

export type MascotPose = 
  | 'waving'
  | 'laptop'
  | 'teacher'
  | 'screen_point'
  | 'celebrating'
  | 'thinking'
  | 'trophy'
  | 'peeking'
  | 'sad';

export interface UserProgress {
  streakDays: number;
  totalXp: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  completedTasksToday: number;
  dailyGoalTarget: number;
  activePathTitle: string;
  activePathProgressPct: number;
  currentLessonId: string;
  hasClaimedEarlyBird: boolean;
  hasClaimedNightOwl: boolean;
  leagueDivision: string;
  leagueRank: number;
  onboardingCompleted: boolean;
  preferredLanguage: Language;
}

export interface LessonStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  instructionEn: string;
  instructionAr: string;
  promptSpeechEn: string;
  promptSpeechAr: string;
  filename: string;
  codePrefix: string;
  codeSlot: string; // The blank placeholder [ ? ]
  codeSuffix: string;
  correctAnswer: string;
  options: string[];
  explanationEn: string;
  explanationAr: string;
  previewTemplate: (code: string) => string;
}

export interface PathNode {
  id: string;
  dayNumber: number;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  status: 'COMPLETED' | 'ACTIVE' | 'LOCKED';
  type: 'LESSON' | 'CHEST' | 'CHECKPOINT' | 'BOSS';
  rewardXp: number;
  chestReward?: { gems: number; xp: number; titleEn: string; titleAr: string };
}

export interface BadgeItem {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold';
}
