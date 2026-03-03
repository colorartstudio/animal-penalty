import React, { useState } from 'react';
import { ZONES, MASCOTS } from '../../utils/constants';
import ballImg from '../../assets/images/ball.svg';

export const ScoreDots = ({ kicks, maxKicks = 5 }) => {
  const displayKicks = Math.max(kicks.length, maxKicks); 
  const dots = [];
  for (let i = 0; i < displayKicks; i++) {
    const kick = kicks[i];
    if (!kick) {
      dots.push(<div key={i} className="w-3 h-3 rounded-full bg-gray-800/80 border border-gray-600 shadow-inner" />);
    } else {
      dots.push(
        <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${kick.isGoal ? 'bg-green-500 shadow-[0_0_8px_#22c55e] scale-110' : 'bg-red-500 shadow-[0_0_8px_#ef4444] scale-90 opacity-80'}`} />
      );
    }
  }
  return <div className="flex flex-wrap justify-center gap-1.5 mt-2 p-1 bg-black/20 rounded-lg backdrop-blur-sm border border-white/5 w-full max-w-[120px]">{dots}</div>;
};

export const Goalkeeper = ({ diveZone, mascotId, isAway = false }) => {
  const mascot = MASCOTS.find(m => m.id === mascotId);
  // Times que possuem assets implementados
  const hasAssets = ['br', 'cn', 'us', 'au', 'in', 'za', 'ca', 'jp', 'ar', 'fr', 'mx', 'de'].includes(mascotId);
  
  // Estado para fallback de erro de imagem
  const [imgError, setImgError] = useState(false);

  let top = '85%';
  let left = '50%';
  let transform = 'translate(-50%, -50%) rotate(0deg)'; 
  
  if (diveZone) {
    const zone = ZONES.find(z => z.id === diveZone);
    if (zone) {
      top = zone.top;
      left = zone.left;
      
      // Transformações apenas para o modo CSS (sem assets)
      if (!hasAssets || imgError) {
        if (diveZone === 'TL') transform = 'translate(-50%, -50%) rotate(-55deg) scale(0.9)';
        if (diveZone === 'TR') transform = 'translate(-50%, -50%) rotate(55deg) scale(0.9)';
        if (diveZone === 'C')  transform = 'translate(-50%, -50%) scale(1.1)';
        if (diveZone === 'BL') transform = 'translate(-50%, -50%) rotate(-75deg)';
        if (diveZone === 'BR') transform = 'translate(-50%, -50%) rotate(75deg)';
      } else {
        // Para assets de imagem, mantemos a posição mas removemos rotação pois a imagem já deve ter a pose
        // Ajuste fino: Se for defesa, escala normal
        transform = 'translate(-50%, -50%) scale(1.1)';
      }
    }
  } else if (hasAssets && !imgError) {
      // Posição de descanso para imagens (ajuste para ficar na linha do gol)
      // Ajuste para 85% para alinhar com a grama (igual ao boneco CSS)
      top = '85%';
      transform = 'translate(-50%, -50%) scale(1)';
  }

  // Renderização com Imagem SVG (Brasil/China)
  if (hasAssets && !imgError && mascot?.assetFolder && mascot?.assetPrefix) {
      let suffix = 'p1'; // Posição de descanso (loop)
      
      if (diveZone) {
          switch(diveZone) {
              case 'C': suffix = 'p2'; break;
              case 'TR': suffix = 'd1'; break;
              case 'BR': suffix = 'd2'; break;
              case 'TL': suffix = 'e1'; break;
              case 'BL': suffix = 'e2'; break;
              default: suffix = 'p2';
          }
      }

      const imgSrc = `/assets/goalkeeper/${mascot.assetFolder}/${mascot.assetPrefix}_${suffix}.svg`;
      const isIdle = !diveZone;
      console.log(`GK Render: ${mascot.id} -> ${imgSrc} (Zone: ${diveZone || 'REST'})`);

      // Filter for Away Kit: Hue Rotate + Contrast to create distinct look (e.g., Brazil Yellow -> Blue/Green shift)
      const awayFilter = isAway ? 'hue-rotate(180deg) saturate(1.2)' : 'none';

      return (
        <div 
          className="absolute w-[140px] h-[140px] z-40 transition-all duration-300 ease-out flex items-center justify-center filter drop-shadow-2xl"
          style={{ top, left, transform, filter: isAway ? `drop-shadow(0 10px 8px rgb(0 0 0 / 0.5)) ${awayFilter}` : 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.5))' }}
        >
           <img 
             src={imgSrc} 
             alt={`Goleiro ${mascot.countryName}`} 
             className={`w-full h-full object-contain ${isIdle ? 'animate-breathing' : ''}`}
             onError={(e) => {
                 console.error(`GK Image Error: ${imgSrc}`);
                 setImgError(true);
             }}
           />
        </div>
      );
  }

  // Renderização Fallback (Boneco CSS)
  return (
    <div 
      className="absolute w-[90px] h-[110px] z-40 transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) flex flex-col items-center drop-shadow-2xl"
      style={{ top, left, transform }}
    >
      <style>{`
        @keyframes gk-breath {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
      `}</style>

      {/* Breathing Animation Wrapper */}
      <div className="w-full h-full relative flex flex-col items-center" style={{ animation: !diveZone ? 'gk-breath 2s infinite ease-in-out' : 'none' }}>
        
        {/* Gloves / Hands - Behind slightly */}
        <div className={`absolute top-[40px] -left-[10px] w-8 h-8 bg-white border-2 border-black rounded-full transition-all duration-300 ${diveZone ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute top-[40px] -right-[10px] w-8 h-8 bg-white border-2 border-black rounded-full transition-all duration-300 ${diveZone ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="w-[36px] h-[36px] bg-[#fcd34d] rounded-full border-[2.5px] border-black relative z-20 overflow-hidden shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.3)]">
          <div className="w-full h-[14px] bg-[#111] absolute top-0"></div>
          <div className="w-[4px] h-[4px] bg-black rounded-full absolute left-[8px] top-[18px]"></div>
          <div className="w-[4px] h-[4px] bg-black rounded-full absolute right-[8px] top-[18px]"></div>
        </div>
        <div className="relative mt-[-4px] z-10 flex flex-col items-center">
          <div className="w-[48px] h-[48px] bg-[#dc2626] border-[2.5px] border-black rounded-t-lg relative z-10 shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.2)]"></div>
          <div className="absolute top-[6px] left-[-26px] w-[22px] h-[48px] bg-[#dc2626] border-[2.5px] border-black rounded-full origin-top-right rotate-[35deg] flex flex-col justify-end items-center shadow-[2px_2px_5px_rgba(0,0,0,0.3)]">
            <div className="w-[24px] h-[22px] bg-[#3b82f6] rounded-full border-[2.5px] border-black absolute bottom-[-10px] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3)]"></div>
          </div>
          <div className="absolute top-[6px] right-[-26px] w-[22px] h-[48px] bg-[#dc2626] border-[2.5px] border-black rounded-full origin-top-left -rotate-[35deg] flex flex-col justify-end items-center shadow-[-2px_2px_5px_rgba(0,0,0,0.3)]">
            <div className="w-[24px] h-[22px] bg-[#3b82f6] rounded-full border-[2.5px] border-black absolute bottom-[-10px] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3)]"></div>
          </div>
          <div className="flex gap-[4px] mt-[-2px] z-0 relative">
            <div className="w-[18px] h-[28px] bg-[#1d4ed8] border-[2.5px] border-black relative shadow-[inset_-3px_0_5px_rgba(0,0,0,0.3)]">
              <div className="w-[22px] h-[14px] bg-[#facc15] rounded-t-full border-[2.5px] border-black absolute bottom-[-12px] left-[-4px]"></div>
            </div>
            <div className="w-[18px] h-[28px] bg-[#1d4ed8] border-[2.5px] border-black relative shadow-[inset_-3px_0_5px_rgba(0,0,0,0.3)]">
              <div className="w-[22px] h-[14px] bg-[#facc15] rounded-t-full border-[2.5px] border-black absolute bottom-[-12px] right-[-4px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnimatedBall = ({ targetZoneId }) => {
  const target = ZONES.find(z => z.id === targetZoneId);
  const isOut = targetZoneId === 'OUT';
  const isKicked = !!target || isOut;

  // Define visual target for OUT (Miss) - Top Right Corner far outside
  const outTarget = { top: '-20%', left: '140%' }; 
  const finalTarget = target || (isOut ? outTarget : null);

  // Ball visual state
  const ballStyle = {
    top: isKicked ? finalTarget.top : '160%', 
    left: isKicked ? finalTarget.left : '50%',
    transform: isKicked 
      ? `translate(-50%, -50%) scale(0.55) rotate(${!finalTarget || finalTarget.left === '50%' ? '720deg' : (parseFloat(finalTarget.left) > 50 ? '720deg' : '-720deg')})` 
      : 'translate(-50%, -50%) scale(1.4) rotate(0deg)',
    transition: isKicked 
      ? 'top 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
      : 'none', 
  };

  // Add Curve Effect via offset-path if supported or just enhanced transition above
  // "Banana Shot" logic: different curves based on target
  // If target is Left, curve should bow out to Right then come back Left (or vice versa for specific effect)
  // Simple CSS implementation: split X and Y easing
  
  // Y-axis: Fast start (explosive kick), slows down at end (gravity/drag) -> cubic-bezier(0.1, 0.9, 0.2, 1)
  // X-axis: Linear or slightly delayed to create curve visual
  
  if (isKicked) {
      // Curve Logic:
      // If going Left (left < 50%), delay the X movement slightly so it looks like it starts straight then curves left.
      // If going Right (left > 50%), delay X movement similarly.
      // Center: straight line.
      
      const isCenter = finalTarget.left === '50%';
      const curveBezier = isCenter 
          ? 'cubic-bezier(0.1, 0.8, 0.2, 1)' // Straight shot
          : 'cubic-bezier(0.25, 1.5, 0.5, 1)'; // Overshoot then settle? No, that's wobble.
          
      // Better curve simulation:
      // X Axis: Start slow, accelerate (cubic-bezier(0.55, 0.055, 0.675, 0.19))
      // Y Axis: Start fast, decelerate (cubic-bezier(0.215, 0.61, 0.355, 1))
      
      // Let's try a proven "Banana" combo:
      const yTransition = 'top 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'; // Explosive vertical
      const xTransition = 'left 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'; // S-Curve approximation
      
      ballStyle.transition = `${yTransition}, ${xTransition}, transform 0.6s ease-out`;
  }

  const shadowStyle = {
    top: isKicked ? '90%' : '175%', 
    left: isKicked ? finalTarget.left : '50%',
    transform: isKicked 
      ? 'translate(-50%, -50%) scale(0.4)' 
      : 'translate(-50%, -50%) scale(1.2)',
    opacity: isKicked ? (isOut ? 0 : 0.2) : 0.5, 
    transition: isKicked 
      ? 'top 0.5s cubic-bezier(0.1, 0.8, 0.2, 1), left 0.5s cubic-bezier(0.1, 0.8, 0.2, 1), transform 0.5s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.5s'
      : 'none'
  };

  return (
    <>
      {/* Shadow */}
      <div className="absolute h-4 w-12 bg-black rounded-[100%] blur-sm z-30 pointer-events-none" style={shadowStyle}></div>
      
      {/* Ball */}
      <div 
        className="absolute z-50 w-24 h-24 rounded-full pointer-events-none flex items-center justify-center"
        style={ballStyle}
      >
        <img 
            src={ballImg} 
            alt="Ball" 
            className="w-full h-full object-contain drop-shadow-md"
        />
        {/* Motion Blur Trail Hint */}
        {isKicked && <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse blur-sm transform scale-110"></div>}
      </div>
    </>
  );
};
