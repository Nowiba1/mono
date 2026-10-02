import React from 'react';
import { Player, PropertyState } from '../../engines/types';
import { CharacterArt } from '../../assets/CharacterArt';
import { TileRect } from './geometry';

interface OwnershipViewProps {
  rect: TileRect;
  propertyState?: PropertyState;
  owner?: Player;
  isMonopoly?: boolean;
  showAvatar?: boolean;
}

export const OwnershipView: React.FC<OwnershipViewProps> = ({
  rect,
  propertyState,
  owner,
  isMonopoly = false,
  showAvatar = true,
}) => {
  if (!propertyState || !owner) return null;

  return (
    <g transform={`translate(${rect.x}, ${rect.y})`}>
      {/* 1. Flag Banner Planted on Inner Edge */}
      <g transform={`translate(${rect.width - 18}, ${rect.height - 24})`}>
        {/* Flag pole */}
        <line x1={4} y1={2} x2={4} y2={22} stroke="#cbd5e1" strokeWidth={1.5} />
        {/* Pennant flag */}
        <polygon points="4,3 16,8 4,13" fill={owner.color} stroke="#ffffff" strokeWidth={0.8} />
      </g>

      {/* 2. Owner Character Avatar Badge in Corner */}
      {showAvatar && (
        <g transform="translate(4, 4)">
          <circle cx={9} cy={9} r={9} fill="#0f172a" stroke={owner.color} strokeWidth={1.5} />
          <g transform="translate(-1, -1)">
            <CharacterArt id={owner.characterId} emote="idle" size={20} />
          </g>
        </g>
      )}

      {/* 3. Monopoly Shimmer Border */}
      {isMonopoly && (
        <rect
          x={1}
          y={1}
          width={rect.width - 2}
          height={rect.height - 2}
          fill="none"
          stroke="#facc15"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.85}
          rx={4}
        />
      )}
    </g>
  );
};
