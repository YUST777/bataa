import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, transition: { duration: 0.15 } } : undefined}
      whileTap={hoverable && onClick ? { y: 2, transition: { duration: 0.08 } } : undefined}
      onClick={onClick}
      className={`
        bg-white/90 backdrop-blur-md rounded-3xl p-5
        shadow-[0_2px_8px_rgba(45,24,11,0.04),0_1px_2px_rgba(45,24,11,0.06),0_0_0_1px_rgba(45,24,11,0.06)]
        transition-shadow duration-200
        ${hoverable ? 'hover:shadow-[0_8px_20px_rgba(255,133,0,0.12),0_2px_4px_rgba(45,24,11,0.06),0_0_0_1.5px_rgba(255,133,0,0.3)] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
