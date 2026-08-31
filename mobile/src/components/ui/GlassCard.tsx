import React from 'react';

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
    <div
      onClick={onClick}
      className={`
        bg-white/95 backdrop-blur-sm border-2 border-[#f0dfcc]
        rounded-3xl p-5 shadow-[0_4px_0_0_#ebd7c1]
        transition-all duration-150
        ${hoverable ? 'hover:border-[#ff8500]/50 hover:shadow-[0_6px_0_0_#ebd7c1] hover:-translate-y-0.5 cursor-pointer active:translate-y-1 active:shadow-none' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
