import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { leaderboardCohorts } from '@/data/curriculumData';
import { UserProgress, Language } from '@/types';
import { Trophy, Gift, Flame, Users, Clock, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound';

interface QuestsLeaderboardViewProps {
  progress: UserProgress;
  language: Language;
}

export const QuestsLeaderboardView: React.FC<QuestsLeaderboardViewProps> = ({
  progress,
  language,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="flex flex-col space-y-5 pb-28 max-w-md mx-auto p-4 sm:p-5">
      {/* 1. League Header Card */}
      <div className="space-y-1 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#d45900]">
              {isAr ? 'الدوري الأسبوعي' : 'Weekly League'}
            </span>
            <h1 className="text-2xl font-black text-[#2d180b]">
              {isAr ? 'دوري البرونز 🥉' : 'Bronze League 🥉'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#895f3c] bg-white px-3 py-1.5 rounded-full border border-[#ebd7c1]">
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'ينتهي خلال 3 أيام' : '3d left'}</span>
          </div>
        </div>
      </div>

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
            <span className="text-[10px] font-black uppercase text-[#58cc02] bg-[#58cc02]/15 px-2 py-0.5 rounded">
              {isAr ? 'جاهز' : 'Ready'}
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
            <span className="text-[10px] font-black uppercase text-[#895f3c] bg-black/5 px-2 py-0.5 rounded">
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
      <GlassCard className="p-4 bg-gradient-to-r from-white to-[#fff5ea] border-2 border-[#ff8500]/30">
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
                {isAr ? 'شارك حماسك مع صديق وتعلما معاً' : 'Study with a partner for bonus gems!'}
              </p>
            </div>
          </div>
          <button
            onClick={() => sound.playClick()}
            className="text-xs font-black text-white bg-[#ff8500] px-3 py-1.5 rounded-xl shadow-[0_2px_0_0_#d45900]"
          >
            {isAr ? 'دعوة' : 'Invite'}
          </button>
        </div>
      </GlassCard>

      {/* 4. 30-User Cohort Leaderboard Rankings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 text-xs font-black text-[#895f3c]">
          <span>{isAr ? 'الترتيب الأسبوعي' : 'Cohort Leaderboard'}</span>
          <span className="text-[#58cc02]">{isAr ? 'أول 7 يترقون' : 'Top 7 Promote'}</span>
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
                      ? 'bg-gradient-to-r from-[#ffd600]/20 to-[#ff8500]/20 border-2 border-[#ff8500] shadow-sm'
                      : 'bg-white border border-[#edcfad]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center text-xs font-black ${
                      item.rank === 1
                        ? 'text-[#ffb800]'
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
                    <p className={`text-xs font-extrabold ${item.isUser ? 'text-[#ff8500]' : 'text-[#2d180b]'}`}>
                      {item.name}
                    </p>
                    {isPromotion && (
                      <span className="text-[10px] text-[#58cc02] font-bold">
                        {isAr ? 'منطقة الترقية ↑' : 'Promotion Zone ↑'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs font-black text-[#2d180b]">
                  <span>{item.xp}</span>
                  <span className="text-[#ff8500] text-[10px]">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
