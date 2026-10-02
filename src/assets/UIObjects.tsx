import React from 'react';

// Custom 3D Dice Face with custom rounded pips
export const DiceFaceSvg: React.FC<{ value: number; size?: number }> = ({ value, size = 48 }) => {
  const renderPips = () => {
    switch (value) {
      case 1:
        return <circle cx="24" cy="24" r="5" fill="#dc2626" />;
      case 2:
        return (
          <>
            <circle cx="14" cy="14" r="4" fill="#0f172a" />
            <circle cx="34" cy="34" r="4" fill="#0f172a" />
          </>
        );
      case 3:
        return (
          <>
            <circle cx="12" cy="12" r="3.5" fill="#0f172a" />
            <circle cx="24" cy="24" r="4" fill="#dc2626" />
            <circle cx="36" cy="36" r="3.5" fill="#0f172a" />
          </>
        );
      case 4:
        return (
          <>
            <circle cx="14" cy="14" r="3.5" fill="#0f172a" />
            <circle cx="34" cy="14" r="3.5" fill="#0f172a" />
            <circle cx="14" cy="34" r="3.5" fill="#0f172a" />
            <circle cx="34" cy="34" r="3.5" fill="#0f172a" />
          </>
        );
      case 5:
        return (
          <>
            <circle cx="13" cy="13" r="3.5" fill="#0f172a" />
            <circle cx="35" cy="13" r="3.5" fill="#0f172a" />
            <circle cx="24" cy="24" r="4" fill="#dc2626" />
            <circle cx="13" cy="35" r="3.5" fill="#0f172a" />
            <circle cx="35" cy="35" r="3.5" fill="#0f172a" />
          </>
        );
      case 6:
        return (
          <>
            <circle cx="14" cy="12" r="3" fill="#0f172a" />
            <circle cx="34" cy="12" r="3" fill="#0f172a" />
            <circle cx="14" cy="24" r="3" fill="#0f172a" />
            <circle cx="34" cy="24" r="3" fill="#0f172a" />
            <circle cx="14" cy="36" r="3" fill="#0f172a" />
            <circle cx="34" cy="36" r="3" fill="#0f172a" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] rounded-lg bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-white/80"
    >
      {renderPips()}
    </svg>
  );
};

// Money Banknote / Coin Icon
export const CurrencyBadge: React.FC<{ amount: number; size?: 'sm' | 'md' | 'lg' }> = ({
  amount,
  size = 'md',
}) => {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 font-mono font-bold text-emerald-300 shadow-sm ${sizeClasses[size]}`}
    >
      <span className="text-emerald-400 font-sans font-black">$</span>
      <span>{formatted}</span>
    </div>
  );
};

// Auction Gavel
export const AuctionGavelIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-label="Auction Gavel">
      <rect x="8" y="4" width="16" height="8" rx="2" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="16" y1="12" x2="16" y2="28" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      <rect x="6" y="26" width="20" height="4" rx="1" fill="#451a03" />
    </svg>
  );
};

// Victory Trophy
export const VictoryTrophyIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-label="Victory Trophy">
      <defs>
        <linearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>
      <path d="M16,12 L48,12 L44,32 Q32,44 20,32 Z" fill="url(#trophyGrad)" stroke="#ca8a04" strokeWidth="2" />
      <path d="M16,16 Q6,20 16,28" fill="none" stroke="#eab308" strokeWidth="3" />
      <path d="M48,16 Q58,20 48,28" fill="none" stroke="#eab308" strokeWidth="3" />
      <rect x="28" y="38" width="8" height="12" fill="#ca8a04" />
      <rect x="18" y="50" width="28" height="8" rx="2" fill="#78350f" stroke="#ca8a04" strokeWidth="1.5" />
    </svg>
  );
};

// Pardon Pass Card (Get Out of Jail Free)
export const PardonPassBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-[11px] font-bold text-amber-300"
      title={`${count} Municipal Pardon Pass(es)`}
    >
      <span>🎟️</span>
      <span>Pass x{count}</span>
    </div>
  );
};
