import React from 'react';
import { BuildingArt } from '../../assets/BuildingArt';
import { TileRect } from './geometry';

interface BuildingViewProps {
  rect: TileRect;
  houses: number; // 0..5 (5 = Grand Citadel)
  lodShowSlots?: boolean;
}

export const BuildingView: React.FC<BuildingViewProps> = ({
  rect,
  houses,
  lodShowSlots = true,
}) => {
  if (houses <= 0 || !lodShowSlots) return null;

  // 1. Grand Citadel (houses === 5)
  if (houses === 5) {
    return (
      <g transform={`translate(${rect.x + (rect.width - 28) / 2}, ${rect.y + 4})`}>
        <BuildingArt type="citadel" size={26} />
      </g>
    );
  }

  // 2. Eco-Villas (1..4 in neat slots along the top banner)
  const slotWidth = 14;
  const totalW = houses * slotWidth + (houses - 1) * 2;
  const startX = rect.x + (rect.width - totalW) / 2;

  return (
    <g transform={`translate(${startX}, ${rect.y + 6})`}>
      {Array.from({ length: houses }).map((_, i) => (
        <g key={i} transform={`translate(${i * (slotWidth + 2)}, 0)`}>
          <BuildingArt type="villa" size={slotWidth} />
        </g>
      ))}
    </g>
  );
};
