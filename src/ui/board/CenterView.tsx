import React from 'react';
import { Player } from '../../engines/types';
import { CharacterArt } from '../../assets/CharacterArt';
import { BoardThemeConfig } from './theme.types';

interface CenterViewProps {
  theme: BoardThemeConfig;
  activePlayer?: Player;
  turnCount?: number;
  freeParkingPool?: number;
  isAwaitingRoll?: boolean;
  isDrawPending?: boolean;
  isDimmed?: boolean;
  lastDiceRoll?: { d1: number; d2: number };
  onRollClick?: () => void;
}

export const CenterView: React.FC<CenterViewProps> = ({
  theme,
  activePlayer,
  turnCount = 1,
  freeParkingPool = 0,
  isAwaitingRoll = false,
  isDrawPending = false,
  isDimmed = false,
  lastDiceRoll,
  onRollClick,
}) => {
  return (
    <g
      transform="translate(140, 140)"
      className={`transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
    >
      {/* 1. Center Area Backdrop (720 x 720) */}
      <rect
        x={0}
        y={0}
        width={720}
        height={720}
        fill={theme.centerBg}
        rx={12}
      />

      {/* Decorative Center Medallion & Compass Lines */}
      <circle cx={360} cy={360} r={280} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
      <circle cx={360} cy={360} r={200} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} strokeDasharray="6 4" />
      <line x1={80} y1={360} x2={640} y2={360} stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} />
      <line x1={360} y1={80} x2={360} y2={640} stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} />

      {/* 2. Top-Left Diagonal Deck: Destiny Beacon Cards */}
      <g transform="translate(90, 90)">
        {/* Stack shadow */}
        <rect x={6} y={6} width={110} height={70} rx={8} fill="rgba(0,0,0,0.4)" />
        {/* Card 1 (bottom) */}
        <rect x={4} y={4} width={110} height={70} rx={8} fill="#581c87" stroke="#9333ea" strokeWidth={1.5} />
        {/* Card 2 (middle) */}
        <rect x={2} y={2} width={110} height={70} rx={8} fill="#6b21a8" stroke="#a855f7" strokeWidth={1.5} />
        {/* Card 3 (top) with optional bobbing */}
        <rect
          x={0}
          y={0}
          width={110}
          height={70}
          rx={8}
          fill="#7e22ce"
          stroke="#c084fc"
          strokeWidth={2}
          className={isDrawPending ? 'animate-pulse' : ''}
        />
        <circle cx={55} cy={35} r={18} fill="#3b0764" stroke="#e9d5ff" strokeWidth={1.5} />
        <polygon points="55,23 58,31 66,35 58,39 55,47 52,39 44,35 52,31" fill="#fde047" />
        <text x={55} y={60} fill="#f3e8ff" fontSize={9} fontWeight="bold" textAnchor="middle" letterSpacing="0.05em">
          DESTINY
        </text>
      </g>

      {/* 3. Bottom-Right Diagonal Deck: Sovereign Vault Cards */}
      <g transform="translate(520, 560)">
        <rect x={6} y={6} width={110} height={70} rx={8} fill="rgba(0,0,0,0.4)" />
        <rect x={4} y={4} width={110} height={70} rx={8} fill="#78350f" stroke="#b45309" strokeWidth={1.5} />
        <rect x={2} y={2} width={110} height={70} rx={8} fill="#854d0e" stroke="#ca8a04" strokeWidth={1.5} />
        <rect
          x={0}
          y={0}
          width={110}
          height={70}
          rx={8}
          fill="#92400e"
          stroke="#facc15"
          strokeWidth={2}
          className={isDrawPending ? 'animate-pulse' : ''}
        />
        <rect x={40} y={20} width={30} height={20} rx={3} fill="#451a03" stroke="#fde047" strokeWidth={1.5} />
        <circle cx={55} cy={30} r={3} fill="#fde047" />
        <text x={55} y={60} fill="#fef3c7" fontSize={9} fontWeight="bold" textAnchor="middle" letterSpacing="0.05em">
          VAULT
        </text>
      </g>

      {/* 4. Central Dice Rolling Zone (360 x 260) */}
      <g transform="translate(180, 230)">
        <rect
          x={0}
          y={0}
          width={360}
          height={260}
          rx={16}
          fill={theme.diceMatBg}
          stroke={theme.diceMatBorder}
          strokeWidth={2}
          strokeDasharray="8 4"
        />

        {/* Centerpiece Logo */}
        <g transform="translate(180, 75)">
          <text
            x={0}
            y={0}
            fill="url(#centerLogoGrad)"
            fontSize={28}
            fontWeight="900"
            textAnchor="middle"
            letterSpacing="0.25em"
            className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            EMPIRE CITY
          </text>
          <text
            x={0}
            y={22}
            fill="rgba(255,255,255,0.5)"
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="0.15em"
          >
            SOVEREIGN PROPERTY TRADING
          </text>
        </g>

        {/* Free Parking Jackpot Badge in Center */}
        {freeParkingPool > 0 && (
          <g transform="translate(110, 125)">
            <rect x={0} y={0} width={140} height={32} rx={16} fill="#065f46" stroke="#34d399" strokeWidth={1.5} />
            <circle cx={20} cy={16} r={9} fill="#facc15" />
            <text x={20} y={20} fill="#0f172a" fontSize={11} fontWeight="900" textAnchor="middle">$</text>
            <text x={78} y={21} fill="#fef08a" fontSize={14} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              ${freeParkingPool}
            </text>
          </g>
        )}

        {/* Turn Status / Roll Prompt */}
        {activePlayer && (
          <g transform="translate(50, 180)">
            <rect
              x={0}
              y={0}
              width={260}
              height={54}
              rx={27}
              fill="rgba(15,23,42,0.92)"
              stroke={activePlayer.color}
              strokeWidth={2}
            />
            {/* Active Character Avatar */}
            <g transform="translate(14, 7)">
              <CharacterArt id={activePlayer.characterId} emote={activePlayer.emote} size={40} />
            </g>
            <text x={70} y={24} fill="#ffffff" fontSize={12} fontWeight="bold">
              {activePlayer.name}
            </text>
            <text x={70} y={40} fill={theme.tileTextSecondary} fontSize={10}>
              Turn {turnCount} · {isAwaitingRoll ? 'Tap Roll to Move' : 'Turn in progress…'}
            </text>
          </g>
        )}
      </g>

      {/* 5. Last Dice Roll Corner Display */}
      {lastDiceRoll && (
        <g transform="translate(100, 570)">
          <rect x={0} y={0} width={90} height={36} rx={8} fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
          <text x={12} y={22} fill="#94a3b8" fontSize={9} fontWeight="bold">LAST:</text>
          <text x={58} y={24} fill="#facc15" fontSize={16} fontWeight="bold" fontFamily="monospace">
            {lastDiceRoll.d1 + lastDiceRoll.d2}
          </text>
        </g>
      )}

      {/* Defs */}
      <defs>
        <linearGradient id="centerLogoGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.centerLogoGrad[0]} />
          <stop offset="100%" stopColor={theme.centerLogoGrad[1]} />
        </linearGradient>
      </defs>
    </g>
  );
};
