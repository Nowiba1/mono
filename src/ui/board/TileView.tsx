import React from 'react';
import { BoardSpace, PropertyState } from '../../engines/types';
import { LandmarkIcon } from '../../assets/BoardSpaceArt';
import { TileRect } from './geometry';
import { LodSettings } from './lod.config';
import { BoardThemeConfig } from './theme.types';

interface TileViewProps {
  space: BoardSpace;
  rect: TileRect;
  propertyState?: PropertyState;
  ownerColor?: string;
  lod: LodSettings;
  theme: BoardThemeConfig;
  isSelected?: boolean;
  isHighlighted?: boolean;
  freeParkingJackpot?: number;
  textOrientation?: 'board' | 'upright';
  onTap?: (spaceId: number) => void;
}

export const TileView: React.FC<TileViewProps> = ({
  space,
  rect,
  propertyState,
  ownerColor,
  lod,
  theme,
  isSelected = false,
  isHighlighted = false,
  freeParkingJackpot = 0,
  onTap,
}) => {
  const isMortgaged = propertyState?.isMortgaged ?? false;
  const districtToken = space.district ? theme.districts[space.district] : null;

  // Render pattern overlay in district banner
  const renderPattern = (w: number, h: number, patternType: string) => {
    switch (patternType) {
      case 'stripes':
        return <line x1="0" y1="0" x2={w} y2={h} stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeDasharray="6 4" />;
      case 'dots':
        return <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 3} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeDasharray="2 2" />;
      case 'diamonds':
        return <polygon points={`${w / 2},2 ${w - 4},${h / 2} ${w / 2},${h - 2} 4,${h / 2}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />;
      default:
        return <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />;
    }
  };

  const isVerticalSide = rect.side === 'left' || rect.side === 'right';

  return (
    <g
      transform={`translate(${rect.x}, ${rect.y})`}
      className="cursor-pointer select-none transition-all duration-200"
      onClick={() => onTap?.(space.id)}
      role="button"
      tabIndex={0}
      aria-label={`Tile ${space.id}: ${space.name}${space.price ? `, $${space.price}` : ''}`}
    >
      {/* 1. Base Tile Background */}
      <rect
        x={0}
        y={0}
        width={rect.width}
        height={rect.height}
        fill={theme.tileBg}
        stroke={isSelected ? '#f59e0b' : isHighlighted ? '#38bdf8' : theme.tileBorder}
        strokeWidth={isSelected ? 3.5 : isHighlighted ? 2.5 : 1}
        rx={rect.isCorner ? 8 : 4}
      />

      {/* Owner Glow Ring */}
      {ownerColor && (
        <rect
          x={1.5}
          y={1.5}
          width={rect.width - 3}
          height={rect.height - 3}
          fill="none"
          stroke={ownerColor}
          strokeWidth={2}
          opacity={0.8}
          rx={rect.isCorner ? 6 : 3}
        />
      )}

      {/* 2. Standard Property Tile (Bottom or Top Row: 80w x 140h) */}
      {!rect.isCorner && !isVerticalSide && space.type === 'PROPERTY' && (
        <g>
          {/* District Header Banner */}
          {districtToken && (
            <g>
              <rect
                x={1}
                y={rect.side === 'bottom' ? 1 : rect.height - 28}
                width={rect.width - 2}
                height={26}
                fill={districtToken.bg}
                rx={3}
              />
              {renderPattern(rect.width, 26, districtToken.pattern)}
            </g>
          )}

          {/* Middle Landmark Illustration */}
          <g
            transform={`translate(${(rect.width - 44) / 2}, ${rect.side === 'bottom' ? 32 : 12})`}
            className={isMortgaged ? 'filter grayscale opacity-40' : ''}
          >
            <ellipse cx={22} cy={42} rx={18} ry={4} fill="rgba(0,0,0,0.4)" />
            <LandmarkIcon landmarkKey={space.landmarkKey} size={44} />
          </g>

          {/* Upright Property Name */}
          <text
            x={rect.width / 2}
            y={rect.side === 'bottom' ? 95 : 76}
            fill={theme.tileTextPrimary}
            fontSize={8.5}
            fontWeight="bold"
            textAnchor="middle"
            className="tracking-tight"
          >
            {space.name.length > 15 ? space.name.slice(0, 14) + '…' : space.name}
          </text>

          {/* Price Badge */}
          {space.price && (
            <g transform={`translate(${(rect.width - 46) / 2}, ${rect.side === 'bottom' ? 112 : 92})`}>
              <rect x={0} y={0} width={46} height={18} rx={9} fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              <circle cx={9} cy={9} r={5} fill="#f59e0b" />
              <text x={9} y={12} fill="#0f172a" fontSize={7} fontWeight="900" textAnchor="middle">$</text>
              <text x={28} y={12.5} fill="#fef08a" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {space.price}
              </text>
            </g>
          )}
        </g>
      )}

      {/* 3. Standard Property Tile (Left or Right Column: 140w x 80h) */}
      {!rect.isCorner && isVerticalSide && space.type === 'PROPERTY' && (
        <g>
          {/* District Banner along outer edge */}
          {districtToken && (
            <rect
              x={rect.side === 'left' ? 1 : rect.width - 24}
              y={1}
              width={22}
              height={rect.height - 2}
              fill={districtToken.bg}
              rx={3}
            />
          )}

          {/* Landmark Icon in center-left */}
          <g
            transform={`translate(${rect.side === 'left' ? 28 : 12}, 18)`}
            className={isMortgaged ? 'filter grayscale opacity-40' : ''}
          >
            <LandmarkIcon landmarkKey={space.landmarkKey} size={42} />
          </g>

          {/* Name & Price on upright horizontal stack */}
          <g transform={`translate(${rect.side === 'left' ? 76 : 60}, 24)`}>
            <text
              x={0}
              y={12}
              fill={theme.tileTextPrimary}
              fontSize={8.5}
              fontWeight="bold"
            >
              {space.name.length > 12 ? space.name.slice(0, 11) + '…' : space.name}
            </text>
            {space.price && (
              <g transform="translate(0, 20)">
                <rect x={0} y={0} width={44} height={16} rx={8} fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                <circle cx={8} cy={8} r={4.5} fill="#f59e0b" />
                <text x={8} y={11} fill="#0f172a" fontSize={6.5} fontWeight="900" textAnchor="middle">$</text>
                <text x={26} y={11.5} fill="#fef08a" fontSize={8.5} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {space.price}
                </text>
              </g>
            )}
          </g>
        </g>
      )}

      {/* 4. Transit Stations (Bottom, Top, Left, Right) */}
      {!rect.isCorner && space.type === 'TRANSIT' && (
        <g>
          <rect
            x={1}
            y={1}
            width={isVerticalSide ? 20 : rect.width - 2}
            height={isVerticalSide ? rect.height - 2 : 18}
            fill="#0284c7"
            rx={3}
          />
          <g transform={`translate(${(rect.width - 44) / 2}, ${(rect.height - 44) / 2 - 6})`}>
            <LandmarkIcon landmarkKey={space.landmarkKey} size={44} />
          </g>
          <text
            x={rect.width / 2}
            y={rect.height - 18}
            fill={theme.tileTextPrimary}
            fontSize={8}
            fontWeight="bold"
            textAnchor="middle"
          >
            {space.name.split(' ')[0]}
          </text>
          {space.price && (
            <text
              x={rect.width / 2}
              y={rect.height - 6}
              fill="#fde047"
              fontSize={8.5}
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              ${space.price}
            </text>
          )}
        </g>
      )}

      {/* 5. Utility Spaces (Aswan Dam / Noor Solar) */}
      {!rect.isCorner && space.type === 'UTILITY' && (
        <g>
          <rect
            x={1}
            y={1}
            width={isVerticalSide ? 20 : rect.width - 2}
            height={isVerticalSide ? rect.height - 2 : 18}
            fill="#d97706"
            rx={3}
          />
          <g transform={`translate(${(rect.width - 44) / 2}, ${(rect.height - 44) / 2 - 8})`}>
            <LandmarkIcon landmarkKey={space.landmarkKey} size={44} />
          </g>
          <text
            x={rect.width / 2}
            y={rect.height - 18}
            fill={theme.tileTextPrimary}
            fontSize={8}
            fontWeight="bold"
            textAnchor="middle"
          >
            {space.name.split(' ')[0]}
          </text>
          {space.price && (
            <text
              x={rect.width / 2}
              y={rect.height - 6}
              fill="#fde047"
              fontSize={8.5}
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              ${space.price}
            </text>
          )}
        </g>
      )}

      {/* 6. Special Decks (Destiny & Vault) */}
      {!rect.isCorner && (space.type === 'DESTINY' || space.type === 'VAULT') && (
        <g>
          <rect
            x={1}
            y={1}
            width={isVerticalSide ? 20 : rect.width - 2}
            height={isVerticalSide ? rect.height - 2 : 18}
            fill={space.type === 'DESTINY' ? '#7e22ce' : '#854d0e'}
            rx={3}
          />
          <g transform={`translate(${(rect.width - 44) / 2}, ${(rect.height - 44) / 2 - 6})`}>
            <LandmarkIcon landmarkKey={space.landmarkKey} size={44} />
          </g>
          <text
            x={rect.width / 2}
            y={rect.height - 8}
            fill="#ffffff"
            fontSize={7.5}
            fontWeight="bold"
            textAnchor="middle"
          >
            {space.type === 'DESTINY' ? 'DESTINY' : 'VAULT'}
          </text>
        </g>
      )}

      {/* 7. Tax Tiles */}
      {!rect.isCorner && space.type === 'TAX' && (
        <g>
          <rect
            x={1}
            y={1}
            width={isVerticalSide ? 20 : rect.width - 2}
            height={isVerticalSide ? rect.height - 2 : 18}
            fill="#475569"
            rx={3}
          />
          <g transform={`translate(${(rect.width - 40) / 2}, ${(rect.height - 40) / 2 - 8})`}>
            <LandmarkIcon landmarkKey={space.landmarkKey} size={40} />
          </g>
          <g transform={`translate(${(rect.width - 44) / 2}, ${rect.height - 22})`}>
            <rect x={0} y={0} width={44} height={16} rx={8} fill="#ef4444" opacity={0.9} />
            <text x={22} y={11} fill="#ffffff" fontSize={8} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              Pay ${space.taxAmount || 100}
            </text>
          </g>
        </g>
      )}

      {/* 8. Corner 0: African Union Gateway (GO) */}
      {rect.isCorner && space.id === 0 && (
        <g>
          <rect x={1} y={1} width={138} height={138} rx={8} fill="rgba(234,179,8,0.12)" stroke="#eab308" strokeWidth={1} />
          <g transform="translate(46, 18)">
            <LandmarkIcon landmarkKey="african_gateway" size={48} />
          </g>
          <polygon points="108,60 123,70 108,80 108,74 85,74 85,66 108,66" fill="#facc15" stroke="#ca8a04" strokeWidth={1.5} />
          <rect x={14} y={98} width={112} height={26} rx={13} fill="#16a34a" stroke="#4ade80" strokeWidth={1.5} />
          <text x={70} y={115} fill="#ffffff" fontSize={11} fontWeight="900" textAnchor="middle" letterSpacing="0.05em">
            COLLECT $200
          </text>
        </g>
      )}

      {/* 9. Corner 10: Saharan Detention */}
      {rect.isCorner && space.id === 10 && (
        <g>
          <rect x={36} y={12} width={92} height={92} rx={6} fill="#0f172a" stroke="#64748b" strokeWidth={2} />
          <line x1="60" y1="12" x2="60" y2="104" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="84" y1="12" x2="84" y2="104" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="108" y1="12" x2="108" y2="104" stroke="#94a3b8" strokeWidth="2.5" />
          <text x={82} y={32} fill="#ef4444" fontSize={10} fontWeight="900" textAnchor="middle">IN JAIL</text>

          <rect x={6} y={108} width={128} height={24} rx={4} fill="#334155" />
          <text x={70} y={124} fill="#f1f5f9" fontSize={9} fontWeight="bold" textAnchor="middle">JUST VISITING</text>
          <rect x={6} y={12} width={24} height={92} rx={4} fill="#334155" />
          <text x={18} y={64} fill="#f1f5f9" fontSize={8} fontWeight="bold" textAnchor="middle" transform="rotate(-90, 18, 64)">
            VISITING
          </text>
        </g>
      )}

      {/* 10. Corner 20: Serengeti Wildlife Haven (Free Parking) */}
      {rect.isCorner && space.id === 20 && (
        <g>
          <rect x={1} y={1} width={138} height={138} rx={8} fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth={1} />
          <g transform="translate(46, 20)">
            <LandmarkIcon landmarkKey="serengeti_haven" size={48} />
          </g>
          <text x={70} y={88} fill="#34d399" fontSize={10} fontWeight="bold" textAnchor="middle">
            FREE HAVEN
          </text>
          {freeParkingJackpot > 0 && (
            <g transform="translate(24, 98)">
              <rect x={0} y={0} width={92} height={24} rx={12} fill="#065f46" stroke="#34d399" strokeWidth={1.5} />
              <circle cx={14} cy={12} r={6} fill="#facc15" />
              <text x={54} y={16} fill="#fef08a" fontSize={10} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                ${freeParkingJackpot}
              </text>
            </g>
          )}
        </g>
      )}

      {/* 11. Corner 30: Continental Extradition */}
      {rect.isCorner && space.id === 30 && (
        <g>
          <rect x={1} y={1} width={138} height={138} rx={8} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1} />
          <g transform="translate(46, 18)">
            <LandmarkIcon landmarkKey="detain_order" size={48} />
          </g>
          <circle cx={70} cy={18} r={10} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" />
          <text x={70} y={92} fill="#f87171" fontSize={11} fontWeight="900" textAnchor="middle">
            GO TO JAIL
          </text>
          <text x={70} y={112} fill="#cbd5e1" fontSize={8} fontWeight="bold" textAnchor="middle">
            Direct to Detention
          </text>
        </g>
      )}
    </g>
  );
};
