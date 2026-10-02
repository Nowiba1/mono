import React from 'react';
import { CharacterArt } from '../../assets/CharacterArt';
import { CharacterEmote, CharacterId } from '../../engines/types';

interface PawnViewProps {
  id: string;
  name: string;
  characterId: CharacterId;
  color: string;
  x: number;
  y: number;
  scale?: number;
  isCurrentTurn?: boolean;
  isMoving?: boolean;
  hopArcY?: number; // 0..22 units offset
  emote?: CharacterEmote;
  billboardTilt?: number; // Counter-rotation in 3D perspective
  jailTurnCount?: number;
}

export const PawnView: React.FC<PawnViewProps> = ({
  id,
  name,
  characterId,
  color,
  x,
  y,
  scale = 1.0,
  isCurrentTurn = false,
  isMoving = false,
  hopArcY = 0,
  emote = 'idle',
  billboardTilt = 0,
  jailTurnCount,
}) => {
  const safeId = color.replace(/[^a-zA-Z0-9]/g, '_');
  const shadowScale = Math.max(0.4, 1 - hopArcY / 30);

  return (
    <g
      transform={`translate(${x}, ${y - hopArcY}) scale(${scale})`}
      className="select-none pointer-events-none transition-transform duration-150"
      id={`pawn-${id}`}
    >
      {/* 1. Ground Drop Shadow (shrinks when pawn hops) */}
      <ellipse
        cx={0}
        cy={18 + hopArcY}
        rx={16 * shadowScale}
        ry={5 * shadowScale}
        fill="rgba(0,0,0,0.55)"
      />

      {/* 2. Active Player Glow Ring */}
      {isCurrentTurn && (
        <g>
          <ellipse
            cx={0}
            cy={18}
            rx={20}
            ry={7}
            fill="none"
            stroke="#facc15"
            strokeWidth={2.5}
            strokeDasharray="5 3"
          />
          {/* Bouncing turn marker arrow */}
          <polygon
            points="0,-36 -6,-46 6,-46"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth={1.5}
          />
        </g>
      )}

      {/* 3. Player Base Ring (colored pedestal) */}
      <ellipse cx={0} cy={16} rx={14} ry={5} fill="#0f172a" stroke={color} strokeWidth={2.5} />

      {/* 4. Full-body Character Bust / Miniature */}
      <g transform={`translate(-20, -32) ${billboardTilt ? `rotate(${-billboardTilt})` : ''}`}>
        <defs>
          <radialGradient id={`pawnRing_${safeId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        <CharacterArt id={characterId} emote={emote} size={40} />
      </g>

      {/* 5. Emote Speech Bubble */}
      {emote && emote !== 'idle' && (
        <g transform="translate(14, -42)">
          <rect x={0} y={0} width={26} height={20} rx={5} fill="#ffffff" stroke="#0f172a" strokeWidth={1.5} />
          <polygon points="4,20 8,20 2,26" fill="#ffffff" />
          <text x={13} y={14} fontSize={11} textAnchor="middle">
            {emote === 'happy' ? '🎉' : emote === 'sad' ? '😢' : emote === 'angry' ? '😡' : emote === 'thinking' ? '💭' : '👑'}
          </text>
        </g>
      )}

      {/* 6. Jail Turns Badge */}
      {jailTurnCount !== undefined && jailTurnCount > 0 && (
        <g transform="translate(-14, -36)">
          <rect x={0} y={0} width={28} height={14} rx={7} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
          <text x={14} y={10} fill="#ffffff" fontSize={8} fontWeight="bold" textAnchor="middle">
            {jailTurnCount}/3
          </text>
        </g>
      )}
    </g>
  );
};
