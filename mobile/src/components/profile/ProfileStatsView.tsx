import React, { useState } from 'react';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { GlassCard } from '@/components/ui/GlassCard';
import { badgesList } from '@/data/curriculumData';
import { UserProgress, Language } from '@/types';
import { Settings, Flame, Gem, Trophy, Award, ChevronRight, Check, Shield, Globe2 } from 'lucide-react';
import { sound } from '@/lib/sound';

interface ProfileStatsViewProps {
  progress: UserProgress;
  language: Language;
  onToggleLanguage: () => void;
}

export const ProfileStatsView: React.FC<ProfileStatsViewProps> = ({
  progress,
  language,
  onToggleLanguage,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isAr = language === 'ar';

  const daysOfWeek = isAr
    ? ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col space-y-5 pb-28 max-w-md mx-auto p-4 sm:p-5">
      {/* 1. Header with Settings Cog */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-black text-[#2d180b]">
          {isAr ? 'الملف الشخصي' : 'Profile & Stats'}
        </h1>
        <button
          onClick={() => {
            sound.playClick();
            setShowSettingsModal(!showSettingsModal);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#ebd7c1] text-[#895f3c] hover:bg-[#fff9f2] active:scale-95 transition-all shadow-sm"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. User Avatar & Identity Card */}
      <GlassCard className="p-5 flex items-center gap-4 bg-gradient-to-r from-white to-[#fff8f0]">
        <div className="w-20 h-20 rounded-full bg-[#fef7ee] border-2 border-[#edcfad] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
          <BataaDuckMascot pose="waving" size={80} />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#2d180b]">
            Bataa Developer
          </h2>
          <p className="text-xs font-medium text-[#895f3c]">
            {isAr ? 'واصل البرمجة والنمو يومياً' : 'Keep coding, keep growing.'}
          </p>
          <div className="inline-flex items-center gap-1 bg-[#58cc02]/15 text-[#58a700] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <Shield className="w-3 h-3" />
            <span>{isAr ? 'مبتدئ (المستوى 1)' : 'Beginner (Level 1)'}</span>
          </div>
        </div>
      </GlassCard>

      {/* 3. Core Statistics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-[#edcfad] rounded-2xl p-3.5 text-center shadow-sm space-y-1">
          <Flame className="w-5 h-5 text-[#ff8500] fill-[#ff8500] mx-auto" />
          <div className="text-base font-black text-[#2d180b]">{progress.streakDays}</div>
          <div className="text-[10px] text-[#895f3c] font-bold uppercase">{isAr ? 'سلسلة الأيام' : 'Day streak'}</div>
        </div>

        <div className="bg-white border border-[#edcfad] rounded-2xl p-3.5 text-center shadow-sm space-y-1">
          <Gem className="w-5 h-5 text-[#1cb0f6] fill-[#1cb0f6] mx-auto" />
          <div className="text-base font-black text-[#2d180b]">{progress.totalXp}</div>
          <div className="text-[10px] text-[#895f3c] font-bold uppercase">{isAr ? 'مجموع الـ XP' : 'Total XP'}</div>
        </div>

        <div className="bg-white border border-[#edcfad] rounded-2xl p-3.5 text-center shadow-sm space-y-1">
          <Trophy className="w-5 h-5 text-[#ffd600] fill-[#ffd600] mx-auto" />
          <div className="text-base font-black text-[#2d180b]">2</div>
          <div className="text-[10px] text-[#895f3c] font-bold uppercase">{isAr ? 'الأوسمة' : 'Badges'}</div>
        </div>
      </div>

      {/* 4. Weekly Progress Heat Map */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-black text-[#2d180b]">
          <span>{isAr ? 'النشاط الأسبوعي' : 'Weekly Progress'}</span>
          <span className="text-[#ff8500]">{isAr ? '3 من 7 أيام' : '3 of 7 days'}</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {daysOfWeek.map((day, idx) => {
            const isDone = idx < 3;
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#895f3c] font-bold">{day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isDone
                      ? 'bg-[#ff8500] text-white shadow-[0_2px_0_0_#d45900]'
                      : 'bg-[#ebdcc8] text-[#895f3c]/40'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : ''}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* 5. Badges Collection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-[#2d180b]">
            {isAr ? 'الأوسمة والإنجازات' : 'Badges'}
          </h3>
          <span className="text-xs font-bold text-[#895f3c]">{isAr ? 'عرض الكل' : 'View all'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {badgesList.map((badge) => (
            <div
              key={badge.id}
              onClick={() => sound.playClick()}
              className={`
                flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none
                ${
                  badge.unlocked
                    ? 'bg-white border-[#ff8500] shadow-[0_4px_0_0_#e8cbb1]'
                    : 'bg-[#f6efe6] border-[#e2d5c4] opacity-60'
                }
              `}
            >
              <span className="text-2xl mb-1.5">{badge.icon}</span>
              <span className="text-[11px] font-black text-[#2d180b] line-clamp-1">
                {isAr ? badge.titleAr : badge.titleEn}
              </span>
              <span className="text-[9px] font-medium text-[#895f3c] mt-0.5 line-clamp-1">
                {badge.unlocked ? (isAr ? 'مكتمل' : 'Unlocked') : isAr ? 'مغلق' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Settings / Language Quick Action */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onToggleLanguage}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-[#edcfad] shadow-sm hover:bg-[#fff9f2] text-xs font-black text-[#2d180b]"
        >
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-4 h-4 text-[#ff8500]" />
            <span>{isAr ? 'تغيير اللغة (English)' : 'Change Language (العربية)'}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#895f3c]" />
        </button>
      </div>
    </div>
  );
};
