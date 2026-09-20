import React, { useState, useEffect } from 'react';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { LearningPathView } from '@/components/path/LearningPathView';
import { QuestsLeaderboardView } from '@/components/quests/QuestsLeaderboardView';
import { ProfileStatsView } from '@/components/profile/ProfileStatsView';
import { InteractiveLessonEngine } from '@/components/lesson/InteractiveLessonEngine';
import { LessonCompleteCelebration } from '@/components/lesson/LessonCompleteCelebration';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { UserProgress, Language, ScreenTab, PathNode } from '@/types';
import { Home, BookOpen, Trophy, User } from 'lucide-react';
import { sound } from '@/lib/sound';

const STORAGE_KEY = 'bataa_user_progress_v1';

export const MobileAppShell: React.FC = () => {
  // Load initial progress from localStorage or use defaults
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      streakDays: 3,
      totalXp: 120,
      gems: 120,
      hearts: 5,
      maxHearts: 5,
      completedTasksToday: 1,
      dailyGoalTarget: 5,
      activePathTitle: 'Web Development Path',
      activePathProgressPct: 20,
      currentLessonId: 'day_1_code_button',
      hasClaimedEarlyBird: true,
      hasClaimedNightOwl: false,
      leagueDivision: 'Bronze',
      leagueRank: 3,
      onboardingCompleted: false, // Default to true on first visit or can be triggered
      preferredLanguage: 'en',
    };
  });

  const [language, setLanguage] = useState<Language>(userProgress.preferredLanguage || 'en');
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(!userProgress.onboardingCompleted);
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isCelebrationActive, setIsCelebrationActive] = useState(false);
  const [lastEarnedXp, setLastEarnedXp] = useState(50);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch {
      // ignore
    }
  }, [userProgress]);

  const toggleLanguage = () => {
    sound.playClick(480);
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    setUserProgress(prev => ({ ...prev, preferredLanguage: newLang }));
  };

  const handleStartLesson = () => {
    sound.playClick(440);
    setIsLessonActive(true);
    setIsCelebrationActive(false);
  };

  const handleFinishLesson = (xpEarned: number) => {
    setLastEarnedXp(xpEarned);
    setUserProgress(prev => ({
      ...prev,
      totalXp: prev.totalXp + xpEarned,
      completedTasksToday: Math.min(prev.dailyGoalTarget, prev.completedTasksToday + 1),
      activePathProgressPct: Math.min(100, prev.activePathProgressPct + 20),
    }));
    setIsLessonActive(false);
    setIsCelebrationActive(true);
  };

  const handleCelebrationContinue = () => {
    sound.playClick(440);
    setIsCelebrationActive(false);
    setCurrentTab('path');
  };

  const handleSelectPathNode = (node: PathNode) => {
    if (node.status !== 'LOCKED') {
      handleStartLesson();
    }
  };

  const isAr = language === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen w-full bg-[#f7f2ea] text-[#2d180b] font-sans antialiased overflow-x-hidden relative flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Main Full-Screen Body */}
      <main className="flex-1 w-full max-w-lg mx-auto relative flex flex-col min-h-screen">
        {showOnboarding ? (
          <OnboardingFlow
            language={language}
            onToggleLanguage={toggleLanguage}
            onComplete={() => {
              setShowOnboarding(false);
              setUserProgress(prev => ({ ...prev, onboardingCompleted: true }));
            }}
          />
        ) : isLessonActive ? (
          <InteractiveLessonEngine
            progress={userProgress}
            language={language}
            onFinishLesson={handleFinishLesson}
            onExit={() => setIsLessonActive(false)}
          />
        ) : isCelebrationActive ? (
          <LessonCompleteCelebration
            progress={userProgress}
            earnedXp={lastEarnedXp}
            language={language}
            onContinue={handleCelebrationContinue}
          />
        ) : (
          <div className="flex-1 pb-24 w-full">
            {currentTab === 'home' && (
              <HomeDashboard
                progress={userProgress}
                language={language}
                onStartLesson={handleStartLesson}
                onNavigateTab={tab => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'path' && (
              <LearningPathView
                progress={userProgress}
                language={language}
                onSelectNode={handleSelectPathNode}
              />
            )}

            {currentTab === 'quests' && (
              <QuestsLeaderboardView
                progress={userProgress}
                language={language}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileStatsView
                progress={userProgress}
                language={language}
                onToggleLanguage={toggleLanguage}
              />
            )}
          </div>
        )}

        {/* Native Fixed Bottom Navigation Bar */}
        {!showOnboarding && !isLessonActive && !isCelebrationActive && (
          <nav
            aria-label="App Navigation"
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#eedcc6] shadow-[0_-4px_20px_rgba(45,24,11,0.06)]"
            style={{
              paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="max-w-lg mx-auto h-16 flex items-center justify-around px-4">
              {/* Home Tab */}
              <button
                onClick={() => {
                  sound.playClick(440);
                  setCurrentTab('home');
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all select-none ${
                  currentTab === 'home'
                    ? 'text-[#ff8500] font-black scale-105'
                    : 'text-[#895f3c] font-bold hover:text-[#2d180b]'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[11px] leading-none">{isAr ? 'الرئيسية' : 'Home'}</span>
              </button>

              {/* Courses / Path Tab */}
              <button
                onClick={() => {
                  sound.playClick(440);
                  setCurrentTab('path');
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all select-none ${
                  currentTab === 'path'
                    ? 'text-[#ff8500] font-black scale-105'
                    : 'text-[#895f3c] font-bold hover:text-[#2d180b]'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-[11px] leading-none">{isAr ? 'المسار' : 'Courses'}</span>
              </button>

              {/* Quests / Leaderboard Tab */}
              <button
                onClick={() => {
                  sound.playClick(440);
                  setCurrentTab('quests');
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all select-none ${
                  currentTab === 'quests'
                    ? 'text-[#ff8500] font-black scale-105'
                    : 'text-[#895f3c] font-bold hover:text-[#2d180b]'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span className="text-[11px] leading-none">{isAr ? 'الدوري' : 'Quests'}</span>
              </button>

              {/* Profile Tab */}
              <button
                onClick={() => {
                  sound.playClick(440);
                  setCurrentTab('profile');
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all select-none ${
                  currentTab === 'profile'
                    ? 'text-[#ff8500] font-black scale-105'
                    : 'text-[#895f3c] font-bold hover:text-[#2d180b]'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[11px] leading-none">{isAr ? 'حسابي' : 'Profile'}</span>
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
};
