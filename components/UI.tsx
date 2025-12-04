import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "relative overflow-hidden px-8 py-4 rounded-full font-display font-bold text-sm tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    glass: "bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md",
    neon: "border border-neon-cyan text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 shadow-[0_0_15px_rgba(0,243,255,0.3)]",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface CardProps { children: React.ReactNode; className?: string }
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`
    bg-glass backdrop-blur-xl border border-glass-border 
    rounded-[2rem] shadow-2xl p-6 md:p-10 
    w-full max-w-2xl mx-auto
    ${className}
  `}>
    {children}
  </div>
);

interface BadgeProps { children: React.ReactNode, color?: 'cyan' | 'pink' | 'gold' | 'gray' }
export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray' }) => {
  const colors = {
    cyan: "border-neon-cyan text-neon-cyan bg-neon-cyan/10",
    pink: "border-neon-pink text-neon-pink bg-neon-pink/10",
    gold: "border-neon-gold text-neon-gold bg-neon-gold/10",
    gray: "border-white/20 text-white/60 bg-white/5",
  };
  return (
    <span className={`px-3 py-1 rounded-full border text-[0.65rem] font-mono uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};