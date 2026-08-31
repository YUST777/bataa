import React from 'react';
import { motion } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { GlassCard } from '@/components/ui/GlassCard';
import { TactileButton } from '@/components/ui/TactileButton';
import { UserProgress, Language, ScreenTab } from '@/types';
import { Flame, Gem, Heart, Play, BookOpen, Target, Trophy, User, Gift, ChevronRight } from 'lucide-react';

interface HomeDashboardProps {
  progress: UserProgress;
  language: Language;
  onStartLesson: () => void;
  onNavigateTab: (tab: ScreenTab) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  progress,
  language,
  onStartLesson,
  onNavigateTab,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="flex flex-col space-y-6 pb-24 max-w-md mx-auto p-4 sm:p-5">
      {/* 1. Sticky Top Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-3xl font-black text-[#ef6b0a] tracking-tight">bataa</span>

        <div className="flex items-center gap-2.5">
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#ebd7c1] shadow-sm">
            <Flame className="w-5 h-5 text-[#ff8500] fill-[#ff8500]" />
            <span className="font-extrabold text-sm text-[#2d180b]">{progress.streakDays}</span>
          </div>

          {/* Gems Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#ebd7c1] shadow-sm">
            <Gem className="w-4 h-4 text-[#1cb0f6] fill-[#1cb0f6]" />
            <span className="font-extrabold text-sm text-[#2d180b]">{progress.gems}</span>
          </div>

          {/* Hearts Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#ebd7c1] shadow-sm">
            <Heart className="w-4 h-4 text-[#ff4b4b] fill-[#ff4b4b]" />
            <span className="font-extrabold text-sm text-[#2d180b]">{progress.hearts}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Greeting & Animated Mascot */}
      <div className="relative pt-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#2d180b] tracking-tight">
            {isAr ? 'صباح الخير! 👋' : 'Good morning! 👋'}
          </h1>
          <p className="text-sm font-bold text-[#ff8500]">
            {isAr ? 'جاهز لبرمجة مهارة جديدة اليوم؟ 🔥' : 'Ready to build today? 🔥'}
          </p>
        </div>

        {/* Mascot Center Card */}
        <div className="flex items-center justify-between mt-3 bg-gradient-to-br from-white to-[#fff8f0] border-2 border-[#edd8c4] rounded-3xl p-4 shadow-[0_4px_0_0_#ebd7c1]">
          <div className="space-y-2 max-w-[190px]">
            <div className="inline-block bg-[#ff8500]/15 text-[#d45900] text-xs font-black px-2.5 py-1 rounded-xl">
              {isAr ? 'خطوة بخطوة 🚀' : 'Small steps. Big skills.'}
            </div>
            <p className="text-xs text-[#895f3c] font-medium leading-relaxed">
              {isAr
                ? 'تمرين واحد يومياً في تطوير الويب يبني مستقبلك البرمجي بثقة.'
                : '5 minutes of hands-on coding today keeps your streak on fire!'}
            </p>
          </div>

          <div className="flex-shrink-0">
            <BataaDuckMascot pose="laptop" size={130} />
          </div>
        </div>
      </div>

      {/* 3. Continue Learning Hero Card (Primary Action) */}
      <GlassCard className="relative overflow-hidden border-2 border-[#ff8500]/40 shadow-[0_6px_0_0_#edd8c4]">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d45900]">
              {isAr ? 'المسار النشط' : 'Continue learning'}
            </span>
            <h2 className="text-lg font-black text-[#2d180b]">
              {isAr ? 'مسار تطوير الويب' : 'Web Development Path'}
            </h2>
            <p className="text-xs font-bold text-[#895f3c]">
              {isAr ? 'اليوم 1 • برمج أول زر تفاعلي' : 'Day 1 • Code a Button'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartLesson}
            className="w-14 h-14 rounded-2xl bg-[#ff8500] hover:bg-[#ff941a] text-white flex items-center justify-center shadow-[0_4px_0_0_#d45900] active:shadow-none active:translate-y-1 transition-all"
            aria-label="Start Lesson"
          >
            <Play className="w-7 h-7 fill-white ml-0.5" />
          </motion.button>
        </div>
      </GlassCard>

      {/* 4. Daily Goal Tracker */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#ff8500]" />
            <span className="text-xs font-extrabold text-[#2d180b]">
              {isAr ? 'هدفك اليومي' : 'Your Daily Goal'}
            </span>
          </div>
          <span className="text-xs font-black text-[#d45900]">
            {progress.completedTasksToday}/{progress.dailyGoalTarget} {isAr ? 'مهام' : 'tasks'}
          </span>
        </div>

        {/* Progress Checkpoint Dots */}
        <div className="flex items-center justify-between pt-1">
          {Array.from({ length: progress.dailyGoalTarget }).map((_, idx) => {
            const isDone = idx < progress.completedTasksToday;
            return (
              <div
                key={idx}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isDone
                    ? 'bg-[#58cc02] text-white shadow-[0_2px_0_0_#58a700]'
                    : 'bg-[#ebdcc8] text-[#895f3c]/60'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
            );
          })}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#ff8500]/15 text-[#ff8500]">
            <Gift className="w-4 h-4" />
          </div>
        </div>
      </GlassCard>

      {/* 5. Quick Navigation Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Courses */}
        <GlassCard
          hoverable
          onClick={() => onNavigateTab('path')}
          className="flex flex-col items-start justify-between p-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#ff8500]/15 text-[#ff8500] flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-[#2d180b]">
            {isAr ? 'المسارات التعليمية' : 'Courses & Paths'}
          </span>
          <span className="text-[11px] font-bold text-[#895f3c]">
            {progress.activePathProgressPct}% {isAr ? 'مكتمل' : 'complete'}
          </span>
        </GlassCard>

        {/* Quests & Leagues */}
        <GlassCard
          hoverable
          onClick={() => onNavigateTab('quests')}
          className="flex flex-col items-start justify-between p-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#ffd600]/25 text-[#d48800] flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-[#2d180b]">
            {isAr ? 'الدوري والمهام' : 'Leaderboard'}
          </span>
          <span className="text-[11px] font-bold text-[#58cc02]">
            {isAr ? 'المركز #3 (ترقية)' : 'Rank #3 (Promoting)'}
          </span>
        </GlassCard>
      </div>

      {/* 6. Big Action Button to Start Learning */}
      <div className="pt-2">
        <TactileButton
          onClick={onStartLesson}
          variant="primary"
          size="lg"
          fullWidth
          icon={<Play className="w-5 h-5 fill-white" />}
        >
          {isAr ? 'ابدأ تمرين اليوم (10 XP)' : 'Start Today\'s Task (+10 XP)'}
        </TactileButton>
      </div>
    </div>
  );
};
