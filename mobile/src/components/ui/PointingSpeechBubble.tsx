import React from 'react';
import { motion } from 'framer-motion';

interface PointingSpeechBubbleProps {
  children: React.ReactNode;
  arrowPosition?: 'left' | 'right' | 'bottom' | 'top';
  className?: string;
}

export const PointingSpeechBubble: React.FC<PointingSpeechBubbleProps> = ({
  children,
  arrowPosition = 'left',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`
        relative bg-white border-2 border-[#eedcc6] rounded-2xl p-4 sm:p-5
        shadow-[0_4px_0_0_#e2cdb6] text-[#2d180b]
        ${className}
      `}
    >
      {/* Dynamic Arrow Pointer */}
      {arrowPosition === 'left' && (
        <div className="absolute top-6 -left-2.5 w-4 h-4 bg-white border-l-2 border-b-2 border-[#eedcc6] transform rotate-45" />
      )}
      {arrowPosition === 'right' && (
        <div className="absolute top-6 -right-2.5 w-4 h-4 bg-white border-r-2 border-t-2 border-[#eedcc6] transform rotate-45" />
      )}
      {arrowPosition === 'bottom' && (
        <div className="absolute -bottom-2.5 left-8 w-4 h-4 bg-white border-r-2 border-b-2 border-[#eedcc6] transform rotate-45" />
      )}
      {arrowPosition === 'top' && (
        <div className="absolute -top-2.5 left-8 w-4 h-4 bg-white border-l-2 border-t-2 border-[#eedcc6] transform rotate-45" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
