import React from 'react';
import { CharacterEmote, CharacterId } from '../engines/types';

interface CharacterArtProps {
  id: CharacterId;
  emote?: CharacterEmote;
  size?: number;
  className?: string;
}

export const CharacterArt: React.FC<CharacterArtProps> = ({
  id,
  emote = 'idle',
  size = 64,
  className = '',
}) => {
  // Eye, eyebrow, and mouth expression offsets per emote
  const getEmoteFeatures = () => {
    switch (emote) {
      case 'happy':
        return {
          eyeY: 42,
          mouth: 'M38,62 Q50,74 62,62',
          browLeft: 'M32,34 Q40,32 46,36',
          browRight: 'M68,34 Q60,32 54,36',
          colorTinge: '#10b981',
        };
      case 'sad':
        return {
          eyeY: 45,
          mouth: 'M40,66 Q50,56 60,66',
          browLeft: 'M32,36 Q40,38 46,34',
          browRight: 'M68,36 Q60,38 54,34',
          colorTinge: '#60a5fa',
        };
      case 'angry':
        return {
          eyeY: 44,
          mouth: 'M40,64 L60,64',
          browLeft: 'M32,32 L46,40',
          browRight: 'M68,32 L54,40',
          colorTinge: '#ef4444',
        };
      case 'thinking':
        return {
          eyeY: 41,
          mouth: 'M42,63 Q50,65 58,61',
          browLeft: 'M32,33 Q40,30 46,34',
          browRight: 'M68,36 Q60,38 54,35',
          colorTinge: '#a855f7',
        };
      case 'jailed':
        return {
          eyeY: 46,
          mouth: 'M42,66 Q50,58 58,66',
          browLeft: 'M32,38 L46,36',
          browRight: 'M68,38 L54,36',
          colorTinge: '#64748b',
        };
      case 'bankrupt':
        return {
          eyeY: 46,
          mouth: 'M38,68 Q50,56 62,68',
          browLeft: 'M32,38 L46,35',
          browRight: 'M68,38 L54,35',
          colorTinge: '#475569',
        };
      case 'winner':
        return {
          eyeY: 41,
          mouth: 'M36,60 Q50,78 64,60',
          browLeft: 'M30,32 Q40,28 46,33',
          browRight: 'M70,32 Q60,28 54,33',
          colorTinge: '#f59e0b',
        };
      case 'idle':
      default:
        return {
          eyeY: 43,
          mouth: 'M40,63 Q50,68 60,63',
          browLeft: 'M34,35 Q40,33 46,36',
          browRight: 'M66,35 Q60,33 54,36',
          colorTinge: '#94a3b8',
        };
    }
  };

  const { mouth, browLeft, browRight } = getEmoteFeatures();

  // Character-specific outfits and silhouettes
  const renderCharacterSpecifics = () => {
    switch (id) {
      case 'thorne': // Explorer: Captain cap, epaulettes, nautical compass
        return (
          <>
            <path d="M26,30 Q50,14 74,30 L78,36 L22,36 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            <polygon points="50,18 54,26 46,26" fill="#fde047" />
            <path d="M22,76 Q50,68 78,76 L84,98 L16,98 Z" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            <circle cx="50" cy="85" r="4" fill="#fde047" />
          </>
        );
      case 'marcel': // Chef: Toque Blanche, red ascot
        return (
          <>
            <path d="M30,34 Q20,10 40,8 Q50,4 60,8 Q80,10 70,34 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M42,70 L50,82 L58,70 Z" fill="#ea580c" />
            <path d="M20,76 Q50,70 80,76 L86,98 L14,98 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          </>
        );
      case 'cloud': // Aviatrix: Leather flight cap, aviator goggles
        return (
          <>
            <path d="M26,34 Q50,18 74,34 L76,52 L24,52 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <rect x="30" y="32" width="16" height="12" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="54" y="32" width="16" height="12" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="46" y1="38" x2="54" y2="38" stroke="#ffffff" strokeWidth="2" />
            <path d="M20,78 Q50,72 80,78 L86,98 L14,98 Z" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
          </>
        );
      case 'fox': // Detective: Fedora hat, trench collar, monocle
        return (
          <>
            <ellipse cx="50" cy="30" rx="36" ry="6" fill="#4c1d95" />
            <path d="M30,30 Q50,14 70,30 Z" fill="#5b21b6" stroke="#4c1d95" strokeWidth="2" />
            <circle cx="62" cy="45" r="7" fill="none" stroke="#fde047" strokeWidth="2" />
            <path d="M20,76 L36,70 L50,84 L64,70 L80,76 L84,98 L16,98 Z" fill="#3b0764" />
          </>
        );
      case 'starling': // Cosmic Navigator: Holographic visor, sleek suit
        return (
          <>
            <path d="M24,42 Q50,30 76,42 Q78,54 50,56 Q22,54 24,42 Z" fill="#f43f5e" opacity="0.85" />
            <path d="M20,76 Q50,68 80,76 L86,98 L14,98 Z" fill="#1e1b4b" stroke="#ec4899" strokeWidth="2" />
            <circle cx="50" cy="84" r="5" fill="#ec4899" />
          </>
        );
      case 'monet': // Artisan: Bohemian beret, paintbrush accent
        return (
          <>
            <ellipse cx="46" cy="26" rx="26" ry="12" fill="#c026d3" />
            <line x1="68" y1="18" x2="82" y2="12" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            <path d="M20,76 Q50,72 80,76 L86,98 L14,98 Z" fill="#fae8ff" stroke="#d946ef" strokeWidth="2" />
          </>
        );
      case 'salt': // Salted Veteran: Knit sailor beanie, dense beard
        return (
          <>
            <ellipse cx="50" cy="26" rx="24" ry="10" fill="#92400e" />
            <path d="M32,60 Q50,84 68,60 Q70,78 50,88 Q30,78 32,60 Z" fill="#e2e8f0" />
            <path d="M20,78 Q50,72 80,78 L86,98 L14,98 Z" fill="#78350f" stroke="#b45309" strokeWidth="2" />
          </>
        );
      case 'nitro': // Racer: Aerodynamic racing helmet, visor
        return (
          <>
            <path d="M26,44 Q22,14 50,14 Q78,14 74,44 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
            <rect x="30" y="32" width="40" height="14" rx="4" fill="#0f172a" stroke="#facc15" strokeWidth="2" />
            <path d="M20,76 Q50,68 80,76 L86,98 L14,98 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          </>
        );
      case 'spark': // Steampunk Polymath: Brass top hat, magnifying loupe
        return (
          <>
            <rect x="32" y="12" width="36" height="20" rx="3" fill="#065f46" stroke="#047857" strokeWidth="2" />
            <ellipse cx="50" cy="32" rx="26" ry="5" fill="#047857" />
            <circle cx="38" cy="44" r="6" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M20,76 Q50,70 80,76 L86,98 L14,98 Z" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
          </>
        );
      case 'valoria': // Knight: Gilded coronet, armored collar
        return (
          <>
            <polygon points="30,28 38,18 50,26 62,18 70,28" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
            <path d="M20,76 L50,86 L80,76 L86,98 L14,98 Z" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          </>
        );
      case 'blackfin': // Sky Corsair: Tricorne pirate hat, skull crest
        return (
          <>
            <path d="M18,34 Q50,12 82,34 L50,26 Z" fill="#090d16" stroke="#334155" strokeWidth="2" />
            <circle cx="50" cy="24" r="3" fill="#f8fafc" />
            <path d="M20,76 Q50,70 80,76 L86,98 L14,98 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          </>
        );
      case 'vane': // Illusionist: Starred wizard cowl, mystic crest
        return (
          <>
            <polygon points="50,6 28,34 72,34" fill="#311042" stroke="#7e22ce" strokeWidth="2" />
            <circle cx="50" cy="22" r="2.5" fill="#facc15" />
            <path d="M20,76 Q50,68 80,76 L86,98 L14,98 Z" fill="#4c1d95" stroke="#a855f7" strokeWidth="2" />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block drop-shadow-md ${className}`}
      aria-label={`${id} character, emotion: ${emote}`}
      role="img"
    >
      <defs>
        <radialGradient id={`faceGrad_${id}`} cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="70%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fdba74" />
        </radialGradient>
        <filter id={`softGlow_${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Head & Neck Base */}
      <rect x="42" y="60" width="16" height="18" fill="#fed7aa" rx="4" />
      <ellipse cx="50" cy="48" rx="22" ry="24" fill={`url(#faceGrad_${id})`} filter={`url(#softGlow_${id})`} />

      {/* Character Specific Hat/Headwear & Torso */}
      {renderCharacterSpecifics()}

      {/* Eyebrows */}
      <path d={browLeft} stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d={browRight} stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <circle cx="40" cy="45" r="3" fill="#1e293b" />
      <circle cx="60" cy="45" r="3" fill="#1e293b" />
      <circle cx="39" cy="44" r="1" fill="#ffffff" />
      <circle cx="59" cy="44" r="1" fill="#ffffff" />

      {/* Mouth based on Emote */}
      <path d={mouth} stroke="#991b1b" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Jailed Bar Overlay if detained */}
      {emote === 'jailed' && (
        <g opacity="0.75">
          <line x1="30" y1="20" x2="30" y2="90" stroke="#000000" strokeWidth="4" />
          <line x1="44" y1="20" x2="44" y2="90" stroke="#000000" strokeWidth="4" />
          <line x1="58" y1="20" x2="58" y2="90" stroke="#000000" strokeWidth="4" />
          <line x1="72" y1="20" x2="72" y2="90" stroke="#000000" strokeWidth="4" />
        </g>
      )}

      {/* Winner Laurels / Crown if winner */}
      {emote === 'winner' && (
        <g transform="translate(30, 2)" filter="url(#softGlow_${id})">
          <polygon points="0,16 8,0 20,10 32,0 40,16" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="8" cy="4" r="1.5" fill="#ef4444" />
          <circle cx="20" cy="8" r="1.5" fill="#3b82f6" />
          <circle cx="32" cy="4" r="1.5" fill="#10b981" />
        </g>
      )}
    </svg>
  );
};
