import React from 'react';

export const LoadingOverlay = ({
  label = 'Carregando…',
  loaded = 0,
  total = 0,
  className = '',
  compact = false,
}) => {
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  const labelClass = compact
    ? 'font-black uppercase text-sm tracking-wide text-center text-black'
    : 'font-black uppercase text-sm tracking-wide text-center text-white drop-shadow';
  const metaClass = compact
    ? 'font-bold text-xs uppercase text-gray-600'
    : 'font-bold text-xs uppercase text-white/90';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        compact ? 'py-6' : 'absolute inset-0 z-50 bg-[#0d1322]/85 backdrop-blur-sm'
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={`w-full ${compact ? 'max-w-full' : 'max-w-xs px-6'} flex flex-col items-center gap-3`}
      >
        {!compact && (
          <p className="text-2xl font-black italic transform -skew-x-6 text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            ANIMAL PENALTY
          </p>
        )}
        <p className={labelClass}>{label}</p>
        <div className="w-full h-4 border-4 border-black rounded-full bg-white overflow-hidden shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <div
            className="h-full bg-yellow-400 transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={metaClass}>
          {total > 0 ? `${pct}% · ${loaded}/${total}` : 'Preparando…'}
        </p>
      </div>
    </div>
  );
};
