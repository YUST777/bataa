import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { TactileButton } from '@/components/ui/TactileButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { webDevPathNodes } from '@/data/curriculumData';
import { UserProgress, Language, PathNode } from '@/types';
import { Star, Lock, Check, Gift, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { sound } from '@/lib/sound';

interface LearningPathViewProps {
  progress: UserProgress;
  language: Language;
  onSelectNode: (node: PathNode) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  progress,
  language,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState<'path' | 'levels' | 'leaderboard'>('path');
  const isAr = language === 'ar';

  return (
    <div className="flex flex-col space-y-6 pb-28 max-w-md mx-auto p-4 sm:p-5">
      {/* 1. Header with Course Banner */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d45900]">
              {isAr ? 'المسار التعليمي' : 'Active Curriculum'}
            </span>
            <h1 className="text-2xl font-black text-[#2d180b]">
              {isAr ? 'مسار تطوير الويب' : 'Web Development Path'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#ebd7c1] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#ff8500]" />
            <span className="text-xs font-black text-[#2d180b]">{progress.totalXp} XP</span>
          </div>
        </div>

        {/* Course Progress Card */}
        <GlassCard className="p-4 bg-gradient-to-r from-white to-[#fff8f0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#895f3c]">
              {isAr ? 'نسبة الإنجاز في المسار' : 'Overall Path Progress'}
            </span>
            <span className="text-xs font-black text-[#ff8500]">
              {progress.activePathProgressPct}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#ebdcc8] overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-[#ff8500] shadow-[0_0_8px_rgba(255,133,0,0.5)] transition-all duration-500"
              style={{ width: `${progress.activePathProgressPct}%` }}
            />
          </div>
        </GlassCard>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-[#ebe0d2] border border-[#dfceba]">
          <button
            onClick={() => setActiveTab('path')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'path'
                ? 'bg-white text-[#2d180b] shadow-sm'
                : 'text-[#895f3c] hover:text-[#2d180b]'
            }`}
          >
            {isAr ? 'خريطة المسار' : 'Path'}
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'levels'
                ? 'bg-white text-[#2d180b] shadow-sm'
                : 'text-[#895f3c] hover:text-[#2d180b]'
            }`}
          >
            {isAr ? 'المستويات' : 'Levels'}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-[#2d180b] shadow-sm'
                : 'text-[#895f3c] hover:text-[#2d180b]'
            }`}
          >
            {isAr ? 'المتصدرون' : 'Leaderboard'}
          </button>
        </div>
      </div>

      {/* 2. Winding S-Curve Learning Road (Duolingo Style) */}
      <div className="relative py-6 flex flex-col items-center">
        {/* Curved Path S-Line SVG Background */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none stroke-[#e2cdb6]"
          strokeWidth="6"
          strokeDasharray="8 8"
          fill="none"
        >
          <path d="M 210 50 Q 280 130 190 210 T 110 370 T 210 530" />
        </svg>

        {/* Path Nodes */}
        <div className="space-y-12 w-full flex flex-col items-center relative z-10">
          {webDevPathNodes.map((node, index) => {
            // Horizontal S-curve displacement: alternate left, center, right
            const offsets = [0, 45, -40, 35, -30, 0];
            const xOffset = offsets[index % offsets.length];

            const isActive = node.status === 'ACTIVE';
            const isCompleted = node.status === 'COMPLETED';
            const isLocked = node.status === 'LOCKED';
            const isChest = node.type === 'CHEST';

            return (
              <div
                key={node.id}
                style={{ transform: `translateX(${xOffset}px)` }}
                className="flex flex-col items-center"
              >
                {/* Active Duck Mascot standing next to active node */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-14 -right-16 z-20 pointer-events-none"
                  >
                    <BataaDuckMascot pose="teacher" size={90} />
                  </motion.div>
                )}

                {/* Node Button */}
                <motion.button
                  whileHover={{ scale: isLocked ? 1 : 1.08 }}
                  whileTap={{ scale: isLocked ? 1 : 0.95 }}
                  onClick={() => {
                    if (!isLocked) {
                      sound.playClick(isChest ? 520 : 440);
                      onSelectNode(node);
                    }
                  }}
                  disabled={isLocked}
                  className={`
                    relative w-20 h-20 rounded-full flex items-center justify-center
                    transition-all select-none
                    ${
                      isActive
                        ? 'bg-gradient-to-b from-[#ffd600] to-[#ff8500] text-white shadow-[0_6px_0_0_#d45900] ring-4 ring-[#ffd600]/40'
                        : isCompleted
                        ? 'bg-[#58cc02] text-white shadow-[0_6px_0_0_#58a700]'
                        : isChest
                        ? 'bg-[#f4e4d0] text-[#ff8500] border-2 border-[#edcfad] shadow-[0_4px_0_0_#d8baa0]'
                        : 'bg-[#e2d5c4] text-[#895f3c]/50 shadow-[0_4px_0_0_#caa585] cursor-not-allowed'
                    }
                  `}
                >
                  {isChest ? (
                    <Gift className="w-9 h-9 animate-bounce" />
                  ) : isCompleted ? (
                    <Check className="w-10 h-10 stroke-[3]" />
                  ) : isActive ? (
                    <Star className="w-10 h-10 fill-white animate-pulse" />
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}

                  {/* Step Day Badge */}
                  <span className="absolute -bottom-3 bg-white border border-[#edcfad] text-[#2d180b] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    {isChest ? (isAr ? 'مكافأة' : 'Reward') : isAr ? `يوم ${Math.floor(node.dayNumber)}` : `Day ${Math.floor(node.dayNumber)}`}
                  </span>
                </motion.button>

                {/* Node Title Label */}
                <div className="mt-4 text-center max-w-[180px]">
                  <p className={`text-xs font-extrabold ${isActive ? 'text-[#ff8500]' : 'text-[#2d180b]'}`}>
                    {isAr ? node.titleAr : node.titleEn}
                  </p>
                  <p className="text-[10px] font-medium text-[#895f3c] line-clamp-1">
                    {isAr ? node.subtitleAr : node.subtitleEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Reward Promo Banner */}
      <GlassCard className="p-4 flex items-center justify-between border-2 border-[#ffd600]/40 bg-gradient-to-r from-white to-[#fff8e8]">
        <div className="space-y-1">
          <div className="inline-block bg-[#ff8500]/15 text-[#d45900] text-[10px] font-black px-2 py-0.5 rounded-md">
            {isAr ? 'مكافأة اليوم' : "Today's Bonus"}
          </div>
          <p className="text-xs font-black text-[#2d180b]">
            {isAr ? 'أكمل تمرين اليوم واكسب 50 XP!' : 'Complete today\'s task and earn 50 XP!'}
          </p>
        </div>
        <Gift className="w-8 h-8 text-[#ff8500]" />
      </GlassCard>
    </div>
  );
};
