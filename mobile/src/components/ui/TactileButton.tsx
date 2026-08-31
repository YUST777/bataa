import React from 'react';
import { motion } from 'framer-motion';
import { sound } from '@/lib/sound';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  icon,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    sound.playClick(variant === 'primary' ? 440 : 380);
    if (onClick) onClick(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-b from-[#ff951a] to-[#ff8500] text-white shadow-[0_4px_0_0_#d45900,0_6px_12px_rgba(212,89,0,0.25)] active:shadow-[0_0_0_0_#d45900] border-t border-white/25';
      case 'success':
        return 'bg-gradient-to-b from-[#64dc0b] to-[#58cc02] text-white shadow-[0_4px_0_0_#469e00,0_6px_12px_rgba(70,158,0,0.25)] active:shadow-[0_0_0_0_#469e00] border-t border-white/25';
      case 'danger':
        return 'bg-gradient-to-b from-[#ff5e5e] to-[#ff4b4b] text-white shadow-[0_4px_0_0_#d92020,0_6px_12px_rgba(217,32,32,0.25)] active:shadow-[0_0_0_0_#d92020] border-t border-white/25';
      case 'secondary':
        return 'bg-white text-[#2d180b] shadow-[0_3px_0_0_#e0cbba,0_4px_8px_rgba(45,24,11,0.05),0_0_0_1px_rgba(45,24,11,0.08)] active:shadow-[0_0_0_0_#e0cbba] hover:bg-[#fff9f2]';
      case 'outline':
        return 'bg-transparent text-[#ff8500] border-2 border-[#ff8500] hover:bg-[#ff8500]/10 shadow-[0_3px_0_0_#ff8500]/20 active:shadow-none';
      case 'ghost':
        return 'bg-transparent text-[#895f3c] hover:bg-[#2d180b]/5 shadow-none active:translate-y-0';
      default:
        return 'bg-[#ff8500] text-white shadow-[0_4px_0_0_#d45900]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-3.5 text-xs rounded-xl font-extrabold';
      case 'md':
        return 'py-3 px-5 text-sm rounded-2xl font-black tracking-wide';
      case 'lg':
        return 'py-4 px-6 text-base rounded-2xl font-black tracking-wide min-h-[52px]';
      case 'xl':
        return 'py-4.5 px-8 text-lg rounded-3xl font-black tracking-wider min-h-[58px]';
      default:
        return 'py-3.5 px-6 text-sm rounded-2xl font-black';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2 select-none
        transition-all duration-75 ease-out
        active:translate-y-1 focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:shadow-none
        ${fullWidth ? 'w-full' : ''}
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
