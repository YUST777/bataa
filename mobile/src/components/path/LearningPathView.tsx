import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { GlassCard } from '@/components/ui/GlassCard';
import { webDevPathNodes } from '@/data/curriculumData';
import { UserProgress, Language, PathNode } from '@/types';
import { Star, Lock, Check, Gift, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
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
    <div className="flex flex-col space-y-6 max-w-lg mx-auto p-4 sm:p-5 select-none">
      {/* 1. Header Banner */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d45900]">
              {isAr ? 'المسار التعليمي الشامل' : 'Unit 1 • Fundamentals'}
            </span>
            <h1 className="text-2xl font-black text-[#2d180b]">
              {isAr ? 'مسار تطوير الويب' : 'Web Development Path'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-[0_2px_4px_rgba(45,24,11,0.05),0_0_0_1px_rgba(45,24,11,0.06)]">
            <Sparkles className="w-4 h-4 text-[#ff8500]" />
            <span className="text-xs font-black text-[#2d180b]">{progress.totalXp} XP</span>
          </div>
        </div>

        {/* Progress Bar Card */}
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_6px_rgba(45,24,11,0.04),0_0_0_1px_rgba(45,24,11,0.06)] space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-[#895f3c]">
              {isAr ? 'إنجاز المسار الكلي' : 'Curriculum Progress'}
            </span>
            <span className="text-[#ff8500]">{progress.activePathProgressPct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#ebdcc8] overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff951a] to-[#ff8500] shadow-[0_0_8px_rgba(255,133,0,0.5)] transition-all duration-500"
              style={{ width: `${progress.activePathProgressPct}%` }}
            />
          </div>
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-[#ebe0d2] shadow-inner">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('path');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'path'
                ? 'bg-white text-[#2d180b] shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                : 'text-[#895f3c]'
            }`}
          >
            {isAr ? 'الخريطة' : 'Path'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('levels');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'levels'
                ? 'bg-white text-[#2d180b] shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                : 'text-[#895f3c]'
            }`}
          >
            {isAr ? 'الوحدات' : 'Units'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('leaderboard');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-[#2d180b] shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                : 'text-[#895f3c]'
            }`}
          >
            {isAr ? 'المتصدرون' : 'Leagues'}
          </button>
        </div>
      </div>

      {/* 2. Duolingo Winding S-Curve Learning Road */}
      <div className="relative py-8 flex flex-col items-center">
        {/* Subtle S-Curve Dotted Line */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none stroke-[#e0cdb8]"
          strokeWidth="6"
          strokeDasharray="10 10"
          fill="none"
        >
          <path d="M 200 40 Q 280 120 180 200 T 110 360 T 200 520" />
        </svg>

        {/* Nodes Flow */}
        <div className="space-y-12 w-full flex flex-col items-center relative z-10">
          {webDevPathNodes.map((node, index) => {
            const offsets = [0, 48, -44, 38, -32, 0];
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
                {/* Floating Mentor Duck Mascot next to active node */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="absolute -top-16 -right-16 z-20 pointer-events-none"
                  >
                    <BataaDuckMascot pose="teacher" size={88} />
                  </motion.div>
                )}

                {/* 3D Round Node Button */}
                <motion.button
                  whileHover={{ scale: isLocked ? 1 : 1.08 }}
                  whileTap={{ scale: isLocked ? 1 : 0.94 }}
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
                        ? 'bg-gradient-to-b from-[#ffd600] to-[#ff8500] text-white shadow-[0_6px_0_0_#d45900,0_10px_20px_rgba(255,133,0,0.35)] ring-4 ring-[#ffd600]/40'
                        : isCompleted
                        ? 'bg-gradient-to-b from-[#64dc0b] to-[#58cc02] text-white shadow-[0_6px_0_0_#469e00,0_10px_20px_rgba(70,158,0,0.3)]'
                        : isChest
                        ? 'bg-white text-[#ff8500] shadow-[0_5px_0_0_#d8baa0,0_8px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]'
                        : 'bg-[#e2d5c4] text-[#895f3c]/40 shadow-[0_4px_0_0_#caa585] cursor-not-allowed opacity-80'
                    }
                  `}
                >
                  {isChest ? (
                    <Gift className="w-8 h-8 text-[#ff8500] animate-bounce" />
                  ) : isCompleted ? (
                    <Check className="w-10 h-10 stroke-[3]" />
                  ) : isActive ? (
                    <Star className="w-10 h-10 fill-white animate-pulse" />
                  ) : (
                    <Lock className="w-7 h-7" />
                  )}

                  {/* Day Label Pill */}
                  <span className="absolute -bottom-3 bg-white text-[#2d180b] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]">
                    {isChest ? (isAr ? 'مكافأة' : 'Reward') : isAr ? `يوم ${Math.floor(node.dayNumber)}` : `Day ${Math.floor(node.dayNumber)}`}
                  </span>
                </motion.button>

                {/* Node Title & Subhead */}
                <div className="mt-4 text-center max-w-[190px]">
                  <p className={`text-xs font-black ${isActive ? 'text-[#ff8500]' : 'text-[#2d180b]'}`}>
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

      {/* 3. Milestone Chest Promo */}
      <GlassCard className="p-4 bg-gradient-to-r from-white to-[#fff8e8] border border-[#ffd600]/40 shadow-[0_4px_16px_rgba(255,214,0,0.15)] flex items-center justify-between">
        <div className="space-y-1 max-w-[240px]">
          <span className="text-[10px] font-black uppercase text-[#d48800] bg-[#ffd600]/25 px-2 py-0.5 rounded-md">
            {isAr ? 'مكافأة الإنجاز' : 'Milestone Bonus'}
          </span>
          <p className="text-xs font-black text-[#2d180b]">
            {isAr ? 'أكمل تمرين اليوم وافتح 50 جوهرة + مضاعف XP!' : 'Complete today\'s task to unlock 50 Gems + 2x XP!'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#ffd600]/25 flex items-center justify-center text-[#ff8500]">
          <Gift className="w-7 h-7" />
        </div>
      </GlassCard>
    </div>
  );
};
