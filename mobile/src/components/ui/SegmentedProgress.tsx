import React from 'react';

interface SegmentedProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  currentStep,
  totalSteps,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 w-full ${className}`}>
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div
            key={idx}
            className="flex-1 h-3 rounded-full bg-[#ebdcc8] overflow-hidden relative shadow-inner"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isCompleted || isCurrent
                  ? 'w-full bg-[#ff8500] shadow-[0_0_8px_rgba(255,133,0,0.5)]'
                  : 'w-0'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
