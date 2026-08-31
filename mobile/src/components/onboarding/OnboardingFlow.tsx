import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { TactileButton } from '@/components/ui/TactileButton';
import { SegmentedProgress } from '@/components/ui/SegmentedProgress';
import { PointingSpeechBubble } from '@/components/ui/PointingSpeechBubble';
import { MascotPose, Language } from '@/types';
import { Sparkles, Code2, Globe2, Monitor, Trophy } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  language,
  onToggleLanguage,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const isAr = language === 'ar';

  const onboardingData: Array<{
    titleEn: string;
    titleAr: string;
    subheadEn: string;
    subheadAr: string;
    pose: MascotPose;
    badgeIcon: React.ReactNode;
    interactiveCard?: React.ReactNode;
  }> = [
    {
      titleEn: 'Your AI mentor for real learning',
      titleAr: 'مرشدك الذكي للتعلم العملي الحقيقي',
      subheadEn: 'Bataa sits on your screen, guides you step by step, and makes learning fun and effective.',
      subheadAr: 'بطة ترافقك على شاشتك، ترشدك خطوة بخطوة، وتجعل تجربة البرمجة ممتعة وفعالة.',
      pose: 'waving',
      badgeIcon: <Sparkles className="w-5 h-5 text-[#ff8500]" />,
    },
    {
      titleEn: 'Learn by doing, not just watching',
      titleAr: 'تعلم بالتطبيق المباشر، لا بالمشاهدة فقط',
      subheadEn: 'Small daily tasks. Big skills. Just like a game, but for real life.',
      subheadAr: 'مهام يومية سريعة، تبني مهارات حقيقية في عالم البرمجة والتصميم.',
      pose: 'laptop',
      badgeIcon: <Code2 className="w-5 h-5 text-[#ff8500]" />,
    },
    {
      titleEn: 'Your desktop companion',
      titleAr: 'رفيقك المباشر داخل برامجك',
      subheadEn: 'Bataa lives on your screen, highlights, explains, and helps you code with confidence.',
      subheadAr: 'تحدد بطة العناصر بصناديق صفراء متوهجة داخل أدواتك وتشرح الأخطاء بصوت عربي ودود.',
      pose: 'screen_point',
      badgeIcon: <Monitor className="w-5 h-5 text-[#ff8500]" />,
      interactiveCard: (
        <div className="bg-[#282a36] border-2 border-[#ffd600] rounded-2xl p-4 shadow-[0_0_16px_rgba(255,214,0,0.35)] text-left font-mono text-xs text-white">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-white/50 text-[10px]">Desktop Live Window</span>
          </div>
          <div className="text-yellow-300 font-bold">🟡 &lt;button class="bataa-btn"&gt;</div>
          <div className="text-emerald-400 pl-4">Click to create 3D Object</div>
          <div className="text-yellow-300 font-bold">&lt;/button&gt;</div>
        </div>
      ),
    },
    {
      titleEn: 'Arabic explanations that click',
      titleAr: 'شروحات عربية مبسطة وسلسة',
      subheadEn: 'Bataa explains everything in natural Arabic, so you understand faster and remember longer.',
      subheadAr: 'تفهم المفاهيم البرمجية الصعبة بسرعة بفضل شروحات بطة المبسطة دون تعقيد.',
      pose: 'teacher',
      badgeIcon: <Globe2 className="w-5 h-5 text-[#ff8500]" />,
      interactiveCard: (
        <div className="bg-white border-2 border-[#f0dfcc] rounded-2xl p-4 shadow-sm text-right space-y-2 font-arabic">
          <div className="inline-block bg-[#ff8500]/10 text-[#ff8500] font-bold text-xs px-2.5 py-1 rounded-lg">
            شرح المهمة 💡
          </div>
          <p className="text-xs font-bold text-[#2d180b]">أنشئ زراً تفاعلياً باستخدام HTML و CSS</p>
          <div className="bg-[#fef7ee] p-2.5 rounded-xl text-[11px] text-[#895f3c] leading-relaxed border border-[#ebd7c1]">
            سنستخدم وسم &lt;button&gt; لتصميم الزر، ثم نضيف بعض التنسيق الأنيق.
          </div>
        </div>
      ),
    },
    {
      titleEn: 'Ready to level up every day?',
      titleAr: 'هل أنت جاهز للانطلاق يومياً؟',
      subheadEn: 'One task a day keeps confusion away. Let\'s build your future together.',
      subheadAr: 'تمرين واحد يومياً يصنع فارقاً هائلاً. هيا نبدأ رحلتك البرمجية معاً!',
      pose: 'trophy',
      badgeIcon: <Trophy className="w-5 h-5 text-[#ff8500]" />,
    },
  ];

  const currentData = onboardingData[currentStep];

  return (
    <div className="flex flex-col justify-between min-h-screen max-w-md mx-auto p-6 bg-[#f7f2ea] text-[#2d180b] select-none">
      {/* Top Header Navigation */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#ef6b0a] tracking-tight">bataa</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#ff8500]/15 text-[#d45900]">
              Mobile
            </span>
          </div>

          <button
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full bg-white border border-[#edcfad] shadow-sm hover:bg-[#fff9f2] text-[#895f3c]"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Segmented Progress Tracker */}
        <SegmentedProgress currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Main Animated Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isAr ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isAr ? 20 : -20 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex flex-col items-center text-center my-auto py-4 space-y-5"
        >
          {/* Mascot Illustration */}
          <div className="py-2">
            <BataaDuckMascot pose={currentData.pose} size={180} />
          </div>

          {/* Interactive Micro Card if present */}
          {currentData.interactiveCard && (
            <div className="w-full max-w-xs">
              {currentData.interactiveCard}
            </div>
          )}

          {/* Typography */}
          <div className="space-y-2.5 px-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2d180b] tracking-tight leading-snug">
              {isAr ? currentData.titleAr : currentData.titleEn}
            </h1>
            <p className="text-sm sm:text-base text-[#895f3c] font-medium leading-relaxed max-w-sm mx-auto">
              {isAr ? currentData.subheadAr : currentData.subheadEn}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA Actions */}
      <div className="w-full space-y-3 pt-2">
        <TactileButton
          onClick={handleNext}
          variant="primary"
          size="lg"
          fullWidth
        >
          {currentStep === 0
            ? (isAr ? 'ابدأ الآن مجاناً' : 'Get started')
            : currentStep === totalSteps - 1
            ? (isAr ? 'هيا ننطلق! 🚀' : "Let's go!")
            : (isAr ? 'التالي' : 'Next')}
        </TactileButton>

        {currentStep === 0 ? (
          <button
            onClick={onComplete}
            className="w-full py-2.5 text-sm font-bold text-[#895f3c] hover:text-[#2d180b] transition-colors"
          >
            {isAr ? 'لدي حساب بالفعل' : 'I already have an account'}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="w-full py-2.5 text-sm font-bold text-[#895f3c] hover:text-[#2d180b] transition-colors"
          >
            {isAr ? 'تخطي' : 'Skip'}
          </button>
        )}
      </div>
    </div>
  );
};
