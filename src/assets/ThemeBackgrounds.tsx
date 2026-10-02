import React from 'react';

export type BoardThemeType = 'classic' | 'neon' | 'ancient';

interface ThemeBackgroundProps {
  theme: BoardThemeType;
}

export const BoardCenterArt: React.FC<ThemeBackgroundProps> = ({ theme }) => {
  if (theme === 'neon') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
        {/* Holographic grid and radiating beams */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <svg viewBox="0 0 200 200" className="w-36 h-36 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#ec4899" strokeWidth="1.5" />
          {/* Cyberpunk City Skyline */}
          <polygon points="100,30 115,70 108,70 114,105 125,145 75,145 86,105 92,70 85,70" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
          <rect x="58" y="95" width="18" height="50" fill="#1e1b4b" stroke="#f43f5e" strokeWidth="1.5" />
          <rect x="124" y="95" width="18" height="50" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="14" fill="#f43f5e" opacity="0.8" />
        </svg>
        <span className="font-display font-extrabold text-lg tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] mt-2">
          EMPIRE CITY
        </span>
        <span className="text-[10px] tracking-widest text-cyan-300/80 uppercase font-semibold">
          Neon Metropolis
        </span>
      </div>
    );
  }

  if (theme === 'ancient') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
        {/* Roman celestial marble and gold filigree */}
        <svg viewBox="0 0 200 200" className="w-36 h-36 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <circle cx="100" cy="100" r="84" fill="none" stroke="#eab308" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="76" fill="none" stroke="#ca8a04" strokeWidth="1" strokeDasharray="3 3" />
          {/* Imperial Laurel Wreath */}
          <path d="M40,100 Q40,40 100,40 Q80,70 100,90 Q60,90 40,100 Z" fill="#ca8a04" opacity="0.6" />
          <path d="M160,100 Q160,40 100,40 Q120,70 100,90 Q140,90 160,100 Z" fill="#ca8a04" opacity="0.6" />
          {/* Imperial Eagle / Citadel */}
          <polygon points="100,50 114,80 144,80 120,98 128,126 100,110 72,126 80,98 56,80 86,80" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="16" fill="#1e3a8a" stroke="#facc15" strokeWidth="2" />
        </svg>
        <span className="font-display font-extrabold text-lg tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow mt-2">
          EMPIRE CITY
        </span>
        <span className="text-[10px] tracking-widest text-amber-300/80 uppercase font-semibold">
          Imperial Sovereignty
        </span>
      </div>
    );
  }

  // Classic City (Default): Walnut & Polished Brass with Emerald Emblem
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
      <svg viewBox="0 0 200 200" className="w-36 h-36 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        <circle cx="100" cy="100" r="82" fill="#064e3b" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Classical Grand Metropolis Silhouette */}
        <polygon points="100,34 116,74 108,74 116,112 128,148 72,148 84,112 92,74 84,74" fill="#022c22" stroke="#34d399" strokeWidth="2" />
        <circle cx="100" cy="100" r="18" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
        <text x="100" y="107" fill="#451a03" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="serif">
          E
        </text>
      </svg>
      <span className="font-display font-black text-xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-emerald-400 drop-shadow mt-2">
        EMPIRE CITY
      </span>
      <span className="text-[10px] tracking-widest text-emerald-400/90 uppercase font-semibold">
        Municipal Edition
      </span>
    </div>
  );
};

export const getThemeBoardStyles = (theme: BoardThemeType): { boardBg: string; tileBg: string; borderColor: string } => {
  switch (theme) {
    case 'neon':
      return {
        boardBg: 'bg-slate-950/95',
        tileBg: 'bg-slate-900/95',
        borderColor: 'border-cyan-500/30',
      };
    case 'ancient':
      return {
        boardBg: 'bg-stone-950/95',
        tileBg: 'bg-stone-900/95',
        borderColor: 'border-amber-500/30',
      };
    case 'classic':
    default:
      return {
        boardBg: 'bg-[#062c20]/95',
        tileBg: 'bg-[#0b3829]/95',
        borderColor: 'border-emerald-600/30',
      };
  }
};
