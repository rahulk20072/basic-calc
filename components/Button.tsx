import React from 'react';
import { ButtonVariant } from '../types';

interface ButtonProps {
  label: string | React.ReactNode;
  variant?: ButtonVariant;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, variant = ButtonVariant.DEFAULT, onClick, className = '', disabled = false }) => {
  const baseStyles = "relative overflow-hidden rounded-3xl transition-all duration-100 active:scale-95 flex items-center justify-center shadow-lg select-none h-full w-full active:shadow-inner";
  
  let variantStyles = "";
  // Increased base font sizes
  let textStyles = "text-4xl sm:text-5xl font-normal";

  switch (variant) {
    case ButtonVariant.OPERATOR:
      variantStyles = "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/30";
      textStyles = "text-5xl sm:text-6xl font-light"; 
      break;
    case ButtonVariant.ACTION:
      variantStyles = "bg-slate-800 text-indigo-300 hover:bg-slate-700";
      textStyles = "text-3xl sm:text-4xl font-medium";
      break;
    case ButtonVariant.EQUALS:
      variantStyles = "bg-emerald-500 text-white hover:bg-emerald-400 shadow-glow shadow-emerald-900/40";
      textStyles = "text-6xl sm:text-7xl font-light"; // Massive equals sign
      break;
    case ButtonVariant.SCIENTIFIC:
      variantStyles = "bg-slate-900 text-slate-400 text-sm hover:bg-slate-800";
      textStyles = "text-xl sm:text-2xl font-medium";
      break;
    case ButtonVariant.AI:
      variantStyles = "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-glow shadow-purple-900/30";
      break;
    case ButtonVariant.DEFAULT:
    default:
      variantStyles = "bg-slate-900/40 text-white hover:bg-slate-800/80 border border-slate-800/50";
      break;
  }

  // Extra large + button
  if (label === '+') textStyles = "text-6xl sm:text-7xl font-light pb-2";
  if (label === '-') textStyles = "text-6xl sm:text-7xl font-light pb-2";
  if (label === '×') textStyles = "text-5xl sm:text-6xl font-light pb-1";
  if (label === '=') textStyles = "text-6xl sm:text-8xl font-thin pb-2";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={textStyles}>{label}</span>
    </button>
  );
};

export default Button;