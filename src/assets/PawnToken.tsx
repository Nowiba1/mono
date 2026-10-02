import React from 'react';

interface PawnTokenProps {
  color: string;
  name: string;
  size?: number;
  isCurrentTurn?: boolean;
  isMoving?: boolean;
}

export const PawnToken: React.FC<PawnTokenProps> = ({
  color,
  name,
  size = 32,
  isCurrentTurn = false,
  isMoving = false,
}) => {
  const safeId = color.replace(/[^a-zA-Z0-9]/g, '_');

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ${
        isMoving ? 'animate-bounce -translate-y-2' : isCurrentTurn ? 'scale-110' : ''
      }`}
      style={{ width: size, height: size * 1.25 }}
      title={name}
      aria-label={`Pawn of ${name}`}
    >
      <svg
        viewBox="0 0 48 60"
        width={size}
        height={size * 1.25}
        className="filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.7)]"
      >
        <defs>
          <radialGradient id={`pawnHead_${safeId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id={`pawnBody_${safeId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f172a" stopOpacity={0.6} />
            <stop offset="30%" stopColor={color} />
            <stop offset="70%" stopColor="#ffffff" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity={0.7} />
          </linearGradient>
        </defs>

        {/* Dynamic drop shadow */}
        <ellipse cx="24" cy="56" rx="16" ry="3.5" fill="rgba(0,0,0,0.5)" />

        {/* Pawn Base Pedestal */}
        <ellipse cx="24" cy="52" rx="15" ry="5" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
        <path d="M10,50 Q24,53 38,50 L34,44 Q24,46 14,44 Z" fill={`url(#pawnBody_${safeId})`} />

        {/* Waist Collar */}
        <ellipse cx="24" cy="42" rx="9" ry="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

        {/* Neck / Stem */}
        <path d="M16,42 Q24,34 18,24 Q24,25 30,24 Q24,34 32,42 Z" fill={`url(#pawnBody_${safeId})`} />

        {/* Spherical Head with 3D Specular Highlight */}
        <circle cx="24" cy="16" r="11" fill={`url(#pawnHead_${safeId})`} stroke="#ffffff" strokeWidth="1.5" />
        <ellipse cx="21" cy="13" rx="3.5" ry="2" fill="#ffffff" opacity={0.65} />

        {/* Active Turn Indicator Glow */}
        {isCurrentTurn && (
          <circle
            cx="24"
            cy="16"
            r="13.5"
            fill="none"
            stroke="#facc15"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
      </svg>
    </div>
  );
};
