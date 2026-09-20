import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { TactileButton } from '@/components/ui/TactileButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { UserProgress, Language } from '@/types';
import { Flame, Gem, Trophy, Sparkles, Check, ChevronRight } from 'lucide-react';
import { sound } from '@/lib/sound';

interface LessonCompleteCelebrationProps {
  progress: UserProgress;
  earnedXp: number;
  language: Language;
  onContinue: () => void;
}

export const LessonCompleteCelebration: React.FC<LessonCompleteCelebrationProps> = ({
  progress,
  earnedXp,
  language,
  onContinue,
}) => {
  const isAr = language === 'ar';

  useEffect(() => {
    // Play celebratory fanfare
    sound.playCelebrationFanfare();

    // Trigger dual confetti explosion
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff8500', '#ffd600', '#58cc02'] });
    fire(0.2, { spread: 60, colors: ['#1cb0f6', '#ff4b4b', '#ffffff'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ff8500', '#58cc02'] });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const daysOfWeek = isAr
    ? ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col justify-between min-h-screen max-w-md mx-auto p-4 sm:p-5 bg-gradient-to-b from-[#2d180b] to-[#180c05] text-white select-none">
      {/* 1. Celebration Header & Golden Hexagon XP */}
      <div className="text-center space-y-3 pt-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <h1 className="text-3xl sm:text-4xl font-black text-[#ffd600] tracking-tight drop-shadow-md">
            {isAr ? 'اكتمل الدرس بنجاح! 🎉' : 'Lesson Complete! 🎉'}
          </h1>
          <p className="text-xs font-bold text-white/80 mt-1">
            {isAr ? 'أحسنت! أتقنت أول مهارة في تطوير الويب.' : 'Amazing! You mastered your first web skill.'}
          </p>
        </motion.div>

        {/* Cheering Mascot */}
        <div className="py-3 flex justify-center">
          <BataaDuckMascot pose="celebrating" size={160} />
        </div>

        {/* Golden Hexagon +50 XP Badge */}
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-3xl bg-gradient-to-r from-[#ffd600] to-[#ff8500] text-[#2d180b] shadow-[0_0_24px_rgba(255,214,0,0.5)] border-2 border-white/40"
        >
          <Sparkles className="w-6 h-6 fill-[#2d180b]" />
          <span className="text-2xl font-black">+{earnedXp} XP</span>
        </motion.div>
      </div>

      {/* 2. Stats Grid Cards */}
      <div className="space-y-4 my-auto py-2">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Streak Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center space-y-1">
            <Flame className="w-5 h-5 text-[#ff8500] fill-[#ff8500] mx-auto" />
            <div className="text-base font-black">{progress.streakDays}</div>
            <div className="text-[10px] text-white/70 font-bold uppercase">{isAr ? 'سلسلة الأيام' : 'Day Streak'}</div>
          </div>

          {/* Total XP Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center space-y-1">
            <Gem className="w-5 h-5 text-[#1cb0f6] fill-[#1cb0f6] mx-auto" />
            <div className="text-base font-black">{progress.totalXp}</div>
            <div className="text-[10px] text-white/70 font-bold uppercase">{isAr ? 'مجموع الـ XP' : 'Total XP'}</div>
          </div>

          {/* Lessons Completed */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center space-y-1">
            <Trophy className="w-5 h-5 text-[#ffd600] fill-[#ffd600] mx-auto" />
            <div className="text-base font-black">1</div>
            <div className="text-[10px] text-white/70 font-bold uppercase">{isAr ? 'الدروس' : 'Lessons'}</div>
          </div>
        </div>

        {/* 7-Day Streak Calendar Row */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black">
            <span>{isAr ? 'سلسلة حماسك اليومية' : 'Your Streak Progress'}</span>
            <span className="text-[#ff8500]">3 {isAr ? 'أيام 🔥' : 'days 🔥'}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {daysOfWeek.map((day, idx) => {
              const isDone = idx < 3; // First 3 days active
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-white/60 font-bold">{day}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isDone
                        ? 'bg-[#ff8500] text-white shadow-[0_0_10px_rgba(255,133,0,0.6)]'
                        : 'bg-white/15 text-white/30'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bottom Continue Button */}
      <div className="pt-2">
        <TactileButton
          onClick={onContinue}
          variant="primary"
          size="lg"
          fullWidth
          className="bg-[#ff8500] hover:bg-[#ff981a]"
        >
          {isAr ? 'متابعة التعلم 🚀' : 'Continue Learning 🚀'}
        </TactileButton>
      </div>
    </div>
  );
};
