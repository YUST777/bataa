import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BataaDuckMascot } from '@/components/mascot/BataaDuckMascot';
import { TactileButton } from '@/components/ui/TactileButton';
import { SegmentedProgress } from '@/components/ui/SegmentedProgress';
import { PointingSpeechBubble } from '@/components/ui/PointingSpeechBubble';
import { day1LessonSteps } from '@/data/curriculumData';
import { UserProgress, Language } from '@/types';
import { X, Heart, Sparkles, CheckCircle2, AlertCircle, Lightbulb, Play } from 'lucide-react';
import { sound } from '@/lib/sound';

interface InteractiveLessonEngineProps {
  progress: UserProgress;
  language: Language;
  onFinishLesson: (earnedXp: number) => void;
  onExit: () => void;
}

export const InteractiveLessonEngine: React.FC<InteractiveLessonEngineProps> = ({
  progress,
  language,
  onFinishLesson,
  onExit,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [heartsRemaining, setHeartsRemaining] = useState(progress.hearts);
  const [comboStreak, setComboStreak] = useState(0);

  const isAr = language === 'ar';
  const currentStep = day1LessonSteps[stepIndex];
  const totalSteps = day1LessonSteps.length;

  const handleSelectOption = (option: string) => {
    sound.playClick(440);
    setSelectedToken(option);
    setFeedbackStatus('IDLE');
  };

  const handleCheckAnswer = () => {
    if (!selectedToken && currentStep.codeSlot !== 'COMPLETED') return;

    const isCorrect =
      currentStep.codeSlot === 'COMPLETED' || selectedToken === currentStep.correctAnswer;

    if (isCorrect) {
      sound.playAscendingCorrect(comboStreak);
      setComboStreak(prev => prev + 1);
      setFeedbackStatus('CORRECT');
    } else {
      sound.playMistake();
      setHeartsRemaining(prev => Math.max(1, prev - 1));
      setComboStreak(0);
      setFeedbackStatus('WRONG');
    }
  };

  const handleNextStep = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(prev => prev + 1);
      setSelectedToken(null);
      setFeedbackStatus('IDLE');
    } else {
      // Completed all steps!
      onFinishLesson(50);
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen max-w-md mx-auto p-4 sm:p-5 bg-[#f7f2ea] text-[#2d180b] select-none">
      {/* 1. Header with Close (X), Progress Bar & Hearts */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#edcfad] text-[#895f3c] hover:bg-[#fff9f2] active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <SegmentedProgress currentStep={stepIndex} totalSteps={totalSteps} />
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#edcfad] shadow-sm">
          <Heart className="w-4 h-4 text-[#ff4b4b] fill-[#ff4b4b]" />
          <span className="font-black text-xs text-[#2d180b]">{heartsRemaining}</span>
        </div>
      </div>

      {/* 2. Main Question & Code Editor Canvas */}
      <div className="space-y-4 my-auto py-2">
        {/* Mascot Teacher Prompt Bubble */}
        <div className="flex items-start gap-3">
          <BataaDuckMascot pose="teacher" size={78} className="flex-shrink-0" />
          <PointingSpeechBubble arrowPosition={isAr ? 'right' : 'left'} className="flex-1">
            <div className="flex items-center gap-1.5 text-[#ff8500] font-black text-xs mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{isAr ? 'خطوة ' + (stepIndex + 1) + ' من ' + totalSteps : `Step ${stepIndex + 1} of ${totalSteps}`}</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-[#2d180b] leading-snug">
              {isAr ? currentStep.promptSpeechAr : currentStep.promptSpeechEn}
            </p>
          </PointingSpeechBubble>
        </div>

        {/* Dark IDE Code Canvas */}
        <div className="bg-[#282a36] border-2 border-[#44475a] rounded-3xl overflow-hidden shadow-[0_4px_0_0_#1e1f29]">
          {/* Editor Header Bar */}
          <div className="bg-[#1e1f29] px-4 py-2 flex items-center justify-between border-b border-[#44475a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5555]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f1fa8c]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#50fa7b]" />
              <span className="text-[11px] font-mono font-bold text-white/70 ml-2">
                {currentStep.filename}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#ff8500]/20 text-[#ff8500] px-2 py-0.5 rounded">
              HTML
            </span>
          </div>

          {/* Syntax Code Body */}
          <div className="p-4 font-mono text-xs sm:text-sm text-white space-y-1 leading-relaxed">
            <pre className="text-[#8be9fd] whitespace-pre-wrap">
              {currentStep.codePrefix}
              {currentStep.codeSlot === 'COMPLETED' ? (
                <span className="text-[#50fa7b] font-bold"> {'/* Done! */'} </span>
              ) : selectedToken ? (
                <span className="bg-[#ff8500] text-white px-2 py-0.5 rounded font-bold shadow-sm">
                  {selectedToken}
                </span>
              ) : (
                <span className="bg-[#44475a] text-[#f1fa8c] px-2 py-0.5 rounded border border-dashed border-[#f1fa8c] animate-pulse">
                  [ ? ]
                </span>
              )}
              {currentStep.codeSuffix}
            </pre>
          </div>
        </div>

        {/* Real-time Live Browser Preview Box */}
        <div className="bg-white border-2 border-[#edcfad] rounded-2xl p-3.5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#895f3c]">
            <span>{isAr ? 'المعاينة المباشرة' : 'Live Browser Preview'}</span>
            <span className="w-2 h-2 rounded-full bg-[#58cc02] animate-ping" />
          </div>

          <div
            className="flex items-center justify-center p-3 rounded-xl bg-[#fef7ee] border border-[#ebd7c1]"
            dangerouslySetInnerHTML={{
              __html: currentStep.previewTemplate(selectedToken || ''),
            }}
          />
        </div>

        {/* Word Bank / Selectable Token Chips */}
        {currentStep.codeSlot !== 'COMPLETED' && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-black text-[#895f3c]">
              {isAr ? 'اختر الإجابة الصحيحة:' : 'Choose the correct answer:'}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {currentStep.options.map((opt) => {
                const isSelected = selectedToken === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`
                      py-3 px-4 rounded-2xl font-mono text-xs sm:text-sm font-bold text-center
                      border-2 transition-all select-none
                      ${
                        isSelected
                          ? 'bg-[#ff8500] text-white border-[#d45900] shadow-[0_4px_0_0_#d45900] translate-y-0.5'
                          : 'bg-white text-[#2d180b] border-[#edcfad] shadow-[0_4px_0_0_#e0c4a8] hover:bg-[#fff9f2] active:translate-y-1 active:shadow-none'
                      }
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Verification & Feedback Drawer */}
      <div className="pt-2">
        <AnimatePresence>
          {feedbackStatus !== 'IDLE' ? (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`p-4 sm:p-5 rounded-3xl mb-3 border-2 ${
                feedbackStatus === 'CORRECT'
                  ? 'bg-[#d7ffb8] border-[#58cc02] text-[#2d180b]'
                  : 'bg-[#ffdfe0] border-[#ff4b4b] text-[#2d180b]'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {feedbackStatus === 'CORRECT' ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-[#58cc02] fill-[#58cc02]/20 flex-shrink-0" />
                    <div>
                      <h3 className="text-base font-black text-[#58a700]">
                        {isAr ? 'إجابة صحيحة! 🎉' : 'Correct! 🎉'}
                      </h3>
                      <p className="text-xs font-medium text-[#2d180b]">
                        {isAr ? currentStep.explanationAr : currentStep.explanationEn}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-8 h-8 text-[#ff4b4b] fill-[#ff4b4b]/20 flex-shrink-0" />
                    <div>
                      <h3 className="text-base font-black text-[#ff4b4b]">
                        {isAr ? 'حاول مرة أخرى! 💪' : 'Try again! 💪'}
                      </h3>
                      <p className="text-xs font-medium text-[#2d180b]">
                        {isAr
                          ? 'تأكد من اختيار الوسم أو النص المناسب لإكمال الزر.'
                          : 'Review the prompt hint to pick the right token.'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <TactileButton
                onClick={feedbackStatus === 'CORRECT' ? handleNextStep : () => setFeedbackStatus('IDLE')}
                variant={feedbackStatus === 'CORRECT' ? 'success' : 'danger'}
                size="lg"
                fullWidth
              >
                {feedbackStatus === 'CORRECT'
                  ? isAr
                    ? 'متابعة'
                    : 'Continue'
                  : isAr
                  ? 'إعادة المحاولة'
                  : 'Retry'}
              </TactileButton>
            </motion.div>
          ) : (
            <TactileButton
              onClick={handleCheckAnswer}
              disabled={!selectedToken && currentStep.codeSlot !== 'COMPLETED'}
              variant="primary"
              size="lg"
              fullWidth
            >
              {isAr ? 'تحقق من الإجابة' : 'Check'}
            </TactileButton>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
