import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border-4 border-black rounded-3xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4 ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const variants = {
    primary: 'bg-green-400 hover:bg-green-500 text-black',
    danger: 'bg-red-400 hover:bg-red-500 text-black',
    action: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    ghost: 'bg-transparent border-none shadow-none hover:bg-gray-100'
  };
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className={`font-black uppercase tracking-wider border-4 border-black rounded-2xl px-4 py-3 transition-transform active:scale-95 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-[4px_4px_0_0_rgba(0,0,0,1)]'} ${className}`}
    >
      {children}
    </button>
  );
};
