import React, { useState } from 'react';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { LearningPathView } from '@/components/path/LearningPathView';
import { QuestsLeaderboardView } from '@/components/quests/QuestsLeaderboardView';
import { ProfileStatsView } from '@/components/profile/ProfileStatsView';
import { InteractiveLessonEngine } from '@/components/lesson/InteractiveLessonEngine';
import { LessonCompleteCelebration } from '@/components/lesson/LessonCompleteCelebration';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { UserProgress, Language, ScreenTab, PathNode } from '@/types';
import { Home, BookOpen, Trophy, User, Smartphone, Monitor, Globe2, RotateCcw } from 'lucide-react';
import { sound } from '@/lib/sound';

export const MobileAppShell: React.FC = () => {
  // Application Global State
  const [language, setLanguage] = useState<Language>('en');
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'android' | 'fullscreen'>('iphone');
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isCelebrationActive, setIsCelebrationActive] = useState(false);
  const [lastEarnedXp, setLastEarnedXp] = useState(50);

  const [userProgress, setUserProgress] = useState<UserProgress>({
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
    onboardingCompleted: true,
    preferredLanguage: 'en',
  });

  const toggleLanguage = () => {
    sound.playClick(480);
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
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
      className="min-h-screen bg-[#ece4d8] text-[#2d180b] flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 font-sans selection:bg-[#ff8500]/20"
    >
      {/* Top Floating Simulator Controls (Desktop Bar) */}
      <header className="w-full max-w-xl hidden sm:flex items-center justify-between py-2.5 px-4 mb-3 rounded-2xl bg-white/90 backdrop-blur-md border border-[#dbcaa7] shadow-sm text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[#ef6b0a]">bataa</span>
          <span className="text-[#895f3c] font-medium">• Mobile App Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Frame Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#f0dfcc]">
            <button
              onClick={() => setDeviceFrame('iphone')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                deviceFrame === 'iphone' ? 'bg-white shadow-sm text-[#2d180b]' : 'text-[#895f3c]'
              }`}
            >
              iPhone
            </button>
            <button
              onClick={() => setDeviceFrame('android')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                deviceFrame === 'android' ? 'bg-white shadow-sm text-[#2d180b]' : 'text-[#895f3c]'
              }`}
            >
              Pixel
            </button>
            <button
              onClick={() => setDeviceFrame('fullscreen')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                deviceFrame === 'fullscreen' ? 'bg-white shadow-sm text-[#2d180b]' : 'text-[#895f3c]'
              }`}
            >
              Full
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#ebd7c1] hover:bg-[#fff9f2] text-[#895f3c]"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Reset Onboarding Button */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#ebd7c1] hover:bg-[#fff9f2] text-[#895f3c]"
            title="View Onboarding"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Onboarding</span>
          </button>
        </div>
      </header>

      {/* Phone Container Device Frame */}
      <main
        className={`
          w-full bg-[#f7f2ea] overflow-hidden relative shadow-2xl transition-all duration-300
          ${
            deviceFrame === 'iphone'
              ? 'max-w-[400px] h-[850px] max-h-[92vh] rounded-[48px] border-[10px] border-[#2d180b] ring-1 ring-black/10'
              : deviceFrame === 'android'
              ? 'max-w-[412px] h-[860px] max-h-[92vh] rounded-[36px] border-[8px] border-[#38332d] ring-1 ring-black/10'
              : 'max-w-md min-h-screen sm:min-h-[850px] sm:rounded-3xl border-0'
          }
        `}
      >
        {/* Hardware Notch / Dynamic Island for iPhone Frame */}
        {deviceFrame === 'iphone' && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#2d180b] rounded-full z-50 flex items-center justify-end px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#180c05]" />
          </div>
        )}

        {/* Dynamic Island Camera for Android Pixel */}
        {deviceFrame === 'android' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 ring-2 ring-[#38332d]" />
        )}

        {/* Scrollable Viewport */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-4 relative">
          {showOnboarding ? (
            <OnboardingFlow
              language={language}
              onToggleLanguage={toggleLanguage}
              onComplete={() => setShowOnboarding(false)}
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
            <>
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
            </>
          )}
        </div>

        {/* 4. Bottom Sticky Navigation Tab Bar (Hidden during lessons/onboarding) */}
        {!showOnboarding && !isLessonActive && !isCelebrationActive && (
          <nav aria-label="Bottom Navigation" className="absolute bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-t-2 border-[#eedcc6] px-4 flex items-center justify-around z-40 shadow-[0_-4px_16px_rgba(45,24,11,0.05)]">
            {/* Home Tab */}
            <button
              onClick={() => {
                sound.playClick();
                setCurrentTab('home');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentTab === 'home'
                  ? 'text-[#ff8500] scale-105'
                  : 'text-[#895f3c] hover:text-[#2d180b]'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-black">{isAr ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* Courses / Path Tab */}
            <button
              onClick={() => {
                sound.playClick();
                setCurrentTab('path');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentTab === 'path'
                  ? 'text-[#ff8500] scale-105'
                  : 'text-[#895f3c] hover:text-[#2d180b]'
              }`}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-[10px] font-black">{isAr ? 'المسار' : 'Courses'}</span>
            </button>

            {/* Quests / Leaderboard Tab */}
            <button
              onClick={() => {
                sound.playClick();
                setCurrentTab('quests');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentTab === 'quests'
                  ? 'text-[#ff8500] scale-105'
                  : 'text-[#895f3c] hover:text-[#2d180b]'
              }`}
            >
              <Trophy className="w-6 h-6" />
              <span className="text-[10px] font-black">{isAr ? 'الدوري' : 'Quests'}</span>
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => {
                sound.playClick();
                setCurrentTab('profile');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentTab === 'profile'
                  ? 'text-[#ff8500] scale-105'
                  : 'text-[#895f3c] hover:text-[#2d180b]'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-[10px] font-black">{isAr ? 'حسابي' : 'Profile'}</span>
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};
