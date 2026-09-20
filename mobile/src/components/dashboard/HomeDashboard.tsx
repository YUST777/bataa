import React from 'react';
import { motion } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { GlassCard } from '@/components/ui/GlassCard';
import { TactileButton } from '@/components/ui/TactileButton';
import { UserProgress, Language, ScreenTab } from '@/types';
import { Flame, Gem, Heart, Play, BookOpen, Target, Trophy, Sparkles, ChevronRight, Gift } from 'lucide-react';
import { sound } from '@/lib/sound';

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
    <div className="flex flex-col space-y-5 max-w-lg mx-auto p-4 sm:p-5 select-none">
      {/* 1. Status Bar Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#ef6b0a] tracking-tight">bataa</span>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff8500]/10 text-[#ef6b0a] border border-[#ff8500]/20">
            PRO
          </span>
        </div>

        {/* Currency & Life HUD */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-[0_2px_4px_rgba(45,24,11,0.05),0_0_0_1px_rgba(45,24,11,0.06)]">
            <Flame className="w-4 h-4 text-[#ff8500] fill-[#ff8500] animate-pulse" />
            <span className="font-black text-xs text-[#2d180b]">{progress.streakDays}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-[0_2px_4px_rgba(45,24,11,0.05),0_0_0_1px_rgba(45,24,11,0.06)]">
            <Gem className="w-3.5 h-3.5 text-[#1cb0f6] fill-[#1cb0f6]" />
            <span className="font-black text-xs text-[#2d180b]">{progress.gems}</span>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-[0_2px_4px_rgba(45,24,11,0.05),0_0_0_1px_rgba(45,24,11,0.06)]">
            <Heart className="w-3.5 h-3.5 text-[#ff4b4b] fill-[#ff4b4b]" />
            <span className="font-black text-xs text-[#2d180b]">{progress.hearts}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Mascot Workspace Card */}
      <div className="relative bg-gradient-to-br from-white via-[#fff9f2] to-[#fff1e0] rounded-3xl p-5 shadow-[0_4px_16px_rgba(45,24,11,0.06),0_0_0_1px_rgba(45,24,11,0.06)] border border-white/60 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2 max-w-[190px]">
            <div className="inline-flex items-center gap-1 bg-[#ff8500]/15 text-[#d45900] text-[11px] font-black px-2.5 py-1 rounded-xl">
              <Sparkles className="w-3 h-3 text-[#ff8500]" />
              <span>{isAr ? 'صباح النشاط البرمجي' : 'Daily Power Session'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#2d180b] leading-tight">
              {isAr ? 'جاهز لبرمجة مهارة جديدة؟' : 'Ready to build something real?'}
            </h1>

            <p className="text-xs text-[#895f3c] font-medium leading-relaxed">
              {isAr
                ? '5 دقائق من التطبيق المباشر تصنع فارقاً حقيقياً في مهاراتك.'
                : '5 minutes of hands-on coding keeps your streak on fire.'}
            </p>
          </div>

          {/* Animated Duck Mascot */}
          <div className="flex-shrink-0 -mr-2 -my-2">
            <BataaDuckMascot pose="laptop" size={135} />
          </div>
        </div>
      </div>

      {/* 3. Primary Learning Action Hero Card */}
      <GlassCard
        hoverable
        onClick={onStartLesson}
        className="relative overflow-hidden bg-gradient-to-r from-white to-[#fff8f0] border border-[#ff8500]/30 shadow-[0_6px_20px_rgba(255,133,0,0.12),0_0_0_1px_rgba(255,133,0,0.2)]"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#58cc02] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#d45900]">
                {isAr ? 'التمرين الحالي النشط' : 'Up Next • Unit 1'}
              </span>
            </div>

            <h2 className="text-lg font-black text-[#2d180b]">
              {isAr ? 'برمج أول زر تفاعلي' : 'Code a 3D Button'}
            </h2>

            <p className="text-xs font-bold text-[#895f3c]">
              {isAr ? 'HTML, CSS & JavaScript • 4 خطوات' : 'HTML & Modern CSS • 4 quick steps'}
            </p>
          </div>

          {/* 3D Tactile Play Action */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onStartLesson();
            }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#ff951a] to-[#ff8500] text-white flex items-center justify-center shadow-[0_4px_0_0_#d45900,0_6px_14px_rgba(212,89,0,0.3)] active:shadow-none active:translate-y-1 transition-all"
            aria-label="Start Lesson"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </motion.button>
        </div>
      </GlassCard>

      {/* 4. Daily Habit Goal Ring */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#ff8500]/15 text-[#ff8500] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#2d180b]">
                {isAr ? 'هدفك اليومي' : 'Daily Goal'}
              </p>
              <p className="text-[10px] font-medium text-[#895f3c]">
                {progress.completedTasksToday}/{progress.dailyGoalTarget} {isAr ? 'مهام منجزة' : 'tasks completed'}
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-[#ff8500] bg-[#ff8500]/10 px-2.5 py-1 rounded-xl">
            {Math.round((progress.completedTasksToday / progress.dailyGoalTarget) * 100)}%
          </span>
        </div>

        {/* Checkpoint Dots */}
        <div className="flex items-center justify-between pt-1">
          {Array.from({ length: progress.dailyGoalTarget }).map((_, idx) => {
            const isDone = idx < progress.completedTasksToday;
            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                  isDone
                    ? 'bg-gradient-to-b from-[#64dc0b] to-[#58cc02] text-white shadow-[0_2px_0_0_#469e00,0_4px_8px_rgba(70,158,0,0.2)]'
                    : 'bg-[#ebe0d2] text-[#895f3c]/50'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
            );
          })}
          <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-[#ffd600]/25 text-[#d48800] border border-[#ffd600]/40">
            <Gift className="w-4 h-4" />
          </div>
        </div>
      </GlassCard>

      {/* 5. Fast Navigation Tiles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Courses Path */}
        <GlassCard
          hoverable
          onClick={() => {
            sound.playClick();
            onNavigateTab('path');
          }}
          className="p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff8500]/15 text-[#ff8500] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-[#ff8500] bg-[#ff8500]/10 px-2 py-0.5 rounded-md">
              {progress.activePathProgressPct}%
            </span>
          </div>

          <div>
            <p className="text-xs font-black text-[#2d180b]">
              {isAr ? 'خريطة المسار' : 'Learning Path'}
            </p>
            <p className="text-[10px] text-[#895f3c] font-medium mt-0.5">
              {isAr ? 'تطوير الويب الشامل' : 'Web Dev Curriculum'}
            </p>
          </div>
        </GlassCard>

        {/* Quests & League */}
        <GlassCard
          hoverable
          onClick={() => {
            sound.playClick();
            onNavigateTab('quests');
          }}
          className="p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffd600]/25 text-[#d48800] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-[#58cc02] bg-[#58cc02]/15 px-2 py-0.5 rounded-md">
              #3
            </span>
          </div>

          <div>
            <p className="text-xs font-black text-[#2d180b]">
              {isAr ? 'دوري البرونز' : 'Bronze League'}
            </p>
            <p className="text-[10px] text-[#58cc02] font-extrabold mt-0.5">
              {isAr ? 'منطقة الترقية ↑' : 'Promotion Zone ↑'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* 6. Big Sticky Primary Action Button */}
      <div className="pt-1">
        <TactileButton
          onClick={onStartLesson}
          variant="primary"
          size="lg"
          fullWidth
          icon={<Play className="w-5 h-5 fill-white translate-x-0.5" />}
        >
          {isAr ? 'ابدأ تمرين اليوم (+50 XP)' : 'Start Daily Task (+50 XP)'}
        </TactileButton>
      </div>
    </div>
  );
};
