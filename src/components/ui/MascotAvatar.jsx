import React, { useState } from 'react';
import { MASCOTS } from '../../utils/constants';

export const MascotAvatar = ({ mascotId, size = 'md' }) => {
  const mascot = MASCOTS.find(m => m.id === mascotId) || MASCOTS[0];
  const sizeClasses = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' };
  const px = { sm: 40, md: 64, lg: 96 };
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`flex items-center justify-center rounded-full border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] overflow-hidden ${mascot.palette[0]} ${sizeClasses[size]}`}>
      {mascot.icon && !imgFailed ? (
        <img
          src={mascot.icon}
          alt={mascot.mascotName}
          width={px[size]}
          height={px[size]}
          decoding="async"
          loading={size === 'sm' ? 'lazy' : 'eager'}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain transform scale-110"
        />
      ) : (
        <span className={size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-6xl'}>{mascot.emoji}</span>
      )}
    </div>
  );
};
