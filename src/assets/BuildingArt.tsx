import React from 'react';

interface BuildingArtProps {
  type: 'villa' | 'citadel' | 'mortgage' | 'flag';
  color?: string;
  size?: number;
  className?: string;
}

export const BuildingArt: React.FC<BuildingArtProps> = ({
  type,
  color = '#10b981',
  size = 24,
  className = '',
}) => {
  if (type === 'villa') {
    // 3D Isometric Eco-Villa (House) - Emerald green with sloped roof & white trim
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={`filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform ${className}`}
        aria-label="Eco-Villa Building"
        role="img"
      >
        <polygon points="16,4 28,12 16,18 4,12" fill="#34d399" />
        <polygon points="4,12 16,18 16,28 4,22" fill="#059669" />
        <polygon points="16,18 28,12 28,22 16,28" fill="#047857" />
        <rect x="8" y="18" width="4" height="6" fill="#f8fafc" opacity="0.8" />
        <rect x="20" y="18" width="4" height="6" fill="#f8fafc" opacity="0.8" />
      </svg>
    );
  }

  if (type === 'citadel') {
    // 3D Isometric Grand Citadel (Hotel) - Crimson & Gold Sovereign Spire
    return (
      <svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        className={`filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] transform hover:scale-110 transition-transform ${className}`}
        aria-label="Grand Citadel Building"
        role="img"
      >
        <polygon points="18,2 32,10 18,17 4,10" fill="#f87171" />
        <polygon points="4,10 18,17 18,32 4,25" fill="#dc2626" />
        <polygon points="18,17 32,10 32,25 18,32" fill="#991b1b" />
        {/* Crown Pinnacle */}
        <polygon points="18,2 21,7 15,7" fill="#facc15" />
        <circle cx="18" cy="2" r="1.5" fill="#fef08a" />
        {/* Arched Portals */}
        <rect x="8" y="19" width="5" height="8" rx="2" fill="#fef08a" opacity="0.9" />
        <rect x="23" y="19" width="5" height="8" rx="2" fill="#fef08a" opacity="0.9" />
      </svg>
    );
  }

  if (type === 'mortgage') {
    return (
      <div
        className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-500/80 text-[10px] font-bold text-rose-300 uppercase tracking-wider shadow-md ${className}`}
        title="Mortgaged Property"
      >
        MORTGAGED
      </div>
    );
  }

  // Owner flag/banner
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${className}`}
      aria-label="Owner Flag"
      role="img"
    >
      <line x1="4" y1="2" x2="4" y2="22" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <polygon points="4,3 18,8 4,13" fill={color} stroke="#ffffff" strokeWidth="1" />
      <circle cx="4" cy="2" r="2" fill="#facc15" />
    </svg>
  );
};
