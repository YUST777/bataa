import React from 'react';
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
        return 'bg-[#ff8500] hover:bg-[#ff951a] text-white shadow-[0_4px_0_0_#d45900] active:shadow-[0_0_0_0_#d45900]';
      case 'success':
        return 'bg-[#58cc02] hover:bg-[#64dc0b] text-white shadow-[0_4px_0_0_#58a700] active:shadow-[0_0_0_0_#58a700]';
      case 'danger':
        return 'bg-[#ff4b4b] hover:bg-[#ff5e5e] text-white shadow-[0_4px_0_0_#ea2b2b] active:shadow-[0_0_0_0_#ea2b2b]';
      case 'secondary':
        return 'bg-white hover:bg-[#fff9f2] text-[#2d180b] border-2 border-[#edcfad] shadow-[0_4px_0_0_#d8baa0] active:shadow-[0_0_0_0_#d8baa0]';
      case 'outline':
        return 'bg-transparent text-[#ff8500] border-2 border-[#ff8500] hover:bg-[#ff8500]/10 shadow-[0_4px_0_0_#ff8500]/30 active:shadow-[0_0_0_0_#ff8500]';
      case 'ghost':
        return 'bg-transparent text-[#895f3c] hover:bg-[#2d180b]/5 shadow-none active:translate-y-0';
      default:
        return 'bg-[#ff8500] text-white shadow-[0_4px_0_0_#d45900]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-3.5 text-sm rounded-xl font-bold';
      case 'md':
        return 'py-3.5 px-6 text-base rounded-2xl font-bold tracking-wide';
      case 'lg':
        return 'py-4 px-8 text-lg rounded-2xl font-extrabold tracking-wide';
      case 'xl':
        return 'py-4.5 px-8 text-xl rounded-3xl font-black tracking-wider';
      default:
        return 'py-3.5 px-6 text-base rounded-2xl font-bold';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2.5 select-none
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
      <span>{children}</span>
    </button>
  );
};
