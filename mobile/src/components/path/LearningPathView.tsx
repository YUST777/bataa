import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { GlassCard } from '@/components/ui/GlassCard';
import { webDevPathNodes } from '@/data/curriculumData';
import { UserProgress, Language, PathNode } from '@/types';
import { Star, Lock, Check, Gift, Sparkles, BookOpen, NotebookText, Trophy } from 'lucide-react';
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
  const isAr = language === 'ar';

  return (
    <div className="flex flex-col space-y-6 max-w-lg mx-auto p-4 sm:p-5 select-none pb-24">
      {/* 1. Unit 1 Glossy Header Banner (Duolingo Style) */}
      <div className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-[#ff951a] to-[#ff8500] p-5 text-white shadow-[0_6px_0_0_#d45900,0_10px_24px_rgba(212,89,0,0.3)] border-t border-white/30">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-yellow-200">
            {isAr ? 'الوحدة 1 • الأساسيات' : 'Unit 1 • Fundamentals'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            {isAr ? 'أساسيات لغة HTML و CSS' : 'HTML & CSS Basics'}
          </h2>
          <p className="text-xs text-white/90 font-medium">
            {isAr ? 'اصنع أزرارك وبطاقاتك التفاعلية الأولى' : 'Build interactive buttons & cards'}
          </p>
        </div>

        <button
          onClick={() => sound.playClick(480)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs font-black transition-all active:scale-95"
        >
          <NotebookText className="w-4 h-4" />
          <span>{isAr ? 'الدليل' : 'Guide'}</span>
        </button>
      </div>

      {/* 2. Path S-Curve Grid with Duolingo Offsets */}
      <div className="relative py-6 flex flex-col items-center">
        <div className="space-y-14 w-full flex flex-col items-center relative z-10">
          {webDevPathNodes.map((node, index) => {
            // Duolingo exact S-curve indentation formula
            const cycleLength = 8;
            const cycleIndex = index % cycleLength;
            let indentationLevel = 0;

            if (cycleIndex <= 2) indentationLevel = cycleIndex;
            else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
            else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
            else indentationLevel = cycleIndex - 8;

            const xOffset = indentationLevel * (isAr ? -44 : 44);

            const isActive = node.status === 'ACTIVE';
            const isCompleted = node.status === 'COMPLETED';
            const isLocked = node.status === 'LOCKED';
            const isChest = node.type === 'CHEST';

            return (
              <div
                key={node.id}
                style={{ transform: `translateX(${xOffset}px)` }}
                className="flex flex-col items-center relative"
              >
                {/* Active Node: Bouncing START Speech Bubble Tooltip */}
                {isActive && (
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 animate-bounce">
                    <div className="relative rounded-2xl bg-white border-2 border-[#58cc02] px-3.5 py-1.5 font-black uppercase tracking-wider text-[#58cc02] shadow-[0_4px_0_0_#469e00] text-xs flex items-center gap-1">
                      <span>{isAr ? 'ابدأ' : 'START'}</span>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-t-6 border-x-transparent border-t-[#58cc02]" />
                    </div>
                  </div>
                )}

                {/* Floating Mentor Duck Mascot for Active Node */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className={`absolute -top-16 ${isAr ? '-left-20' : '-right-20'} z-20 pointer-events-none`}
                  >
                    <BataaDuckMascot pose="teacher" size={90} />
                  </motion.div>
                )}

                {/* 3D Round Node Button (Duolingo Style) */}
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
                    relative w-[76px] h-[76px] rounded-full flex items-center justify-center
                    transition-all select-none
                    ${
                      isActive
                        ? 'bg-gradient-to-b from-[#ffd600] to-[#ff8500] text-white border-b-[6px] border-[#d45900] shadow-[0_6px_16px_rgba(255,133,0,0.35)] ring-4 ring-[#ffd600]/40'
                        : isCompleted
                        ? 'bg-gradient-to-b from-[#64dc0b] to-[#58cc02] text-white border-b-[6px] border-[#469e00] shadow-[0_6px_16px_rgba(70,158,0,0.3)]'
                        : isChest
                        ? 'bg-white text-[#ff8500] border-2 border-[#f0dfcc] border-b-[6px] border-b-[#d8baa0] shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                        : 'bg-[#e2d5c4] text-[#895f3c]/40 border-b-[6px] border-[#caa585] cursor-not-allowed opacity-80'
                    }
                  `}
                >
                  {isChest ? (
                    <Gift className="w-8 h-8 text-[#ff8500] animate-bounce" />
                  ) : isCompleted ? (
                    <Check className="w-10 h-10 stroke-[3.5]" />
                  ) : isActive ? (
                    <Star className="w-10 h-10 fill-white animate-pulse" />
                  ) : (
                    <Lock className="w-7 h-7" />
                  )}

                  {/* Day Label Tag */}
                  <span className="absolute -bottom-3.5 bg-white text-[#2d180b] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]">
                    {isChest ? (isAr ? 'مكافأة' : 'Reward') : isAr ? `يوم ${Math.floor(node.dayNumber)}` : `Day ${Math.floor(node.dayNumber)}`}
                  </span>
                </motion.button>

                {/* Node Title */}
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

      {/* 3. Milestone Reward Chest Card */}
      <GlassCard className="p-4 bg-gradient-to-r from-white to-[#fff8e8] border border-[#ffd600]/40 shadow-[0_4px_16px_rgba(255,214,0,0.15)] flex items-center justify-between">
        <div className="space-y-1 max-w-[240px]">
          <span className="text-[10px] font-black uppercase text-[#d48800] bg-[#ffd600]/25 px-2 py-0.5 rounded-md">
            {isAr ? 'صندوق الإنجاز' : 'Milestone Chest'}
          </span>
          <p className="text-xs font-black text-[#2d180b]">
            {isAr ? 'أكمل تمرين اليوم وافتح 50 جوهرة + مضاعف XP!' : 'Complete today\'s task to claim 50 Gems + 2x XP!'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#ffd600]/25 flex items-center justify-center text-[#ff8500] border border-[#ffd600]/30 shadow-inner">
          <Gift className="w-7 h-7" />
        </div>
      </GlassCard>
    </div>
  );
};
