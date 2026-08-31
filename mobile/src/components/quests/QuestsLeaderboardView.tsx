import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { leaderboardCohorts } from '@/data/curriculumData';
import { UserProgress, Language } from '@/types';
import { Trophy, Gift, Flame, Users, Clock, Sparkles, Target, Zap, CheckCircle2 } from 'lucide-react';
import { sound } from '@/lib/sound';

interface QuestsLeaderboardViewProps {
  progress: UserProgress;
  language: Language;
}

export const QuestsLeaderboardView: React.FC<QuestsLeaderboardViewProps> = ({
  progress,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'quests'>('leaderboard');
  const isAr = language === 'ar';

  const dailyQuests = [
    {
      id: 'quest_1',
      titleEn: 'Earn 50 XP today',
      titleAr: 'اكسب 50 XP اليوم',
      current: progress.completedTasksToday * 10,
      max: 50,
      rewardGems: 10,
      icon: <Zap className="w-4 h-4 text-[#ff8500]" />,
    },
    {
      id: 'quest_2',
      titleEn: 'Complete 1 coding challenge',
      titleAr: 'أكمل تحدياً برمجياً واحداً',
      current: progress.completedTasksToday >= 1 ? 1 : 0,
      max: 1,
      rewardGems: 15,
      icon: <Target className="w-4 h-4 text-[#58cc02]" />,
    },
    {
      id: 'quest_3',
      titleEn: 'Score 100% in a lesson',
      titleAr: 'احصل على 100% في درس واحد',
      current: progress.completedTasksToday >= 1 ? 1 : 0,
      max: 1,
      rewardGems: 20,
      icon: <Sparkles className="w-4 h-4 text-[#1cb0f6]" />,
    },
  ];

  return (
    <div className="flex flex-col space-y-5 max-w-lg mx-auto p-4 sm:p-5 select-none pb-24">
      {/* 1. Header Banner & Filter Switcher */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d45900]">
              {isAr ? 'المنافسة والتحديات' : 'Rankings & Quests'}
            </span>
            <h1 className="text-2xl font-black text-[#2d180b]">
              {isAr ? 'دوري البرونز 🥉' : 'Bronze League 🥉'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-[#895f3c] bg-white px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(45,24,11,0.05),0_0_0_1px_rgba(45,24,11,0.06)]">
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? '3 أيام متبقية' : '3d left'}</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-[#ebe0d2] shadow-inner">
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
            {isAr ? 'المتصدرون' : 'Leaderboard'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('quests');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'quests'
                ? 'bg-white text-[#2d180b] shadow-[0_2px_4px_rgba(0,0,0,0.08)]'
                : 'text-[#895f3c]'
            }`}
          >
            {isAr ? 'المهام اليومية' : 'Daily Quests'}
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <>
          {/* 2. Diurnal Chests (Early Bird & Night Owl) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Early Bird Chest */}
            <GlassCard
              hoverable
              onClick={() => sound.playChestOpen()}
              className="p-3.5 bg-gradient-to-br from-white to-[#fff8e8] border border-[#f0dfcc]"
            >
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-6 h-6 text-[#ff8500]" />
                <span className="text-[10px] font-black uppercase text-[#58cc02] bg-[#58cc02]/15 px-2 py-0.5 rounded-md">
                  {isAr ? 'جاهز' : 'Claim'}
                </span>
              </div>
              <p className="text-xs font-black text-[#2d180b]">
                {isAr ? 'طائر الصباح' : 'Early Bird'}
              </p>
              <p className="text-[10px] text-[#895f3c]">
                {isAr ? '2x XP مضاعف الليلة' : '2x XP Boost Tonight'}
              </p>
            </GlassCard>

            {/* Night Owl Chest */}
            <GlassCard
              hoverable
              onClick={() => sound.playClick()}
              className="p-3.5 bg-gradient-to-br from-white to-[#f6f7fb] border border-[#f0dfcc]"
            >
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-6 h-6 text-[#7e4bde]" />
                <span className="text-[10px] font-black uppercase text-[#895f3c] bg-black/5 px-2 py-0.5 rounded-md">
                  18:00
                </span>
              </div>
              <p className="text-xs font-black text-[#2d180b]">
                {isAr ? 'بومة الليل' : 'Night Owl'}
              </p>
              <p className="text-[10px] text-[#895f3c]">
                {isAr ? 'افتحه في المساء' : 'Opens 18:00 - 24:00'}
              </p>
            </GlassCard>
          </div>

          {/* 3. Friend Streaks Co-Op Widget */}
          <GlassCard className="p-4 bg-gradient-to-r from-white to-[#fff5ea] border border-[#ff8500]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ff8500]/15 text-[#ff8500] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#2d180b]">
                    {isAr ? 'سلسلة الأصدقاء المشتركة' : 'Friend Streaks (Co-Op)'}
                  </p>
                  <p className="text-[10px] text-[#895f3c]">
                    {isAr ? 'تعلم مع شريك للحصول على جواهر إضافية!' : 'Study with a friend for bonus gems!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => sound.playClick()}
                className="text-xs font-black text-white bg-[#ff8500] hover:bg-[#ff951a] px-3.5 py-2 rounded-xl shadow-[0_3px_0_0_#d45900] active:translate-y-0.5 active:shadow-none transition-all"
              >
                {isAr ? 'دعوة' : 'Invite'}
              </button>
            </div>
          </GlassCard>

          {/* 4. 30-User Cohort Leaderboard */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-black text-[#895f3c]">
              <span>{isAr ? 'ترتيب المجموعة الأسبوعي' : 'Weekly Cohort Ranking'}</span>
              <span className="text-[#58cc02]">{isAr ? 'أول 7 يترقون ↑' : 'Top 7 Promote ↑'}</span>
            </div>

            <div className="space-y-2">
              {leaderboardCohorts.map((item) => {
                const isTop3 = item.rank <= 3;
                const isPromotion = item.rank <= 7;

                return (
                  <div
                    key={item.rank}
                    className={`
                      flex items-center justify-between p-3.5 rounded-2xl transition-all
                      ${
                        item.isUser
                          ? 'bg-gradient-to-r from-[#ffd600]/20 to-[#ff8500]/20 border-2 border-[#ff8500] shadow-[0_4px_12px_rgba(255,133,0,0.15)]'
                          : 'bg-white shadow-[0_2px_4px_rgba(45,24,11,0.04),0_0_0_1px_rgba(45,24,11,0.06)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 text-center text-xs font-black ${
                          item.rank === 1
                            ? 'text-[#ffb800] text-sm'
                            : item.rank === 2
                            ? 'text-[#a0a0a0]'
                            : item.rank === 3
                            ? 'text-[#cd7f32]'
                            : 'text-[#895f3c]'
                        }`}
                      >
                        {item.rank}
                      </span>

                      <span className="text-xl">{item.avatar}</span>

                      <div>
                        <p className={`text-xs font-black ${item.isUser ? 'text-[#ff8500]' : 'text-[#2d180b]'}`}>
                          {item.name}
                        </p>
                        {isPromotion && (
                          <span className="text-[10px] text-[#58cc02] font-bold">
                            {isAr ? 'منطقة الترقية ↑' : 'Promotion Zone ↑'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs font-black text-[#2d180b]">
                      <span>{item.xp}</span>
                      <span className="text-[#ff8500] text-[10px]">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Quests View */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-black text-[#895f3c]">
            <span>{isAr ? 'مهام اليوم اليومية' : 'Daily Quests'}</span>
            <span className="text-[#ff8500]">3 {isAr ? 'مهام' : 'available'}</span>
          </div>

          <div className="space-y-3">
            {dailyQuests.map((quest) => {
              const isCompleted = quest.current >= quest.max;
              const pct = Math.min(100, Math.round((quest.current / quest.max) * 100));

              return (
                <GlassCard key={quest.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#fef7ee] border border-[#ebd7c1] flex items-center justify-center">
                        {quest.icon}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#2d180b]">
                          {isAr ? quest.titleAr : quest.titleEn}
                        </p>
                        <p className="text-[10px] text-[#895f3c]">
                          {quest.current}/{quest.max}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-[#ff8500] bg-[#ff8500]/10 px-2.5 py-1 rounded-xl">
                      <Gift className="w-3.5 h-3.5" />
                      <span>+{quest.rewardGems}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-[#ebdcc8] overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-[#58cc02]' : 'bg-[#ff8500]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
