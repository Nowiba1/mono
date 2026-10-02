export type BoardThemeKey = 'classic' | 'neon' | 'ancient';

export interface DistrictThemeToken {
  bg: string;
  text: string;
  border: string;
  pattern: 'dots' | 'stripes' | 'grid' | 'waves' | 'diamonds' | 'chevrons' | 'circles' | 'circuit';
  emblem: string; // SVG icon key
}

export interface BoardThemeConfig {
  id: BoardThemeKey;
  name: string;
  ambientBg: string;
  frameBorder: string;
  frameBg: string;
  frameAccent: string;
  boardBg: string;
  tileBg: string;
  tileBorder: string;
  tileTextPrimary: string;
  tileTextSecondary: string;
  centerBg: string;
  centerLogoGrad: [string, string];
  diceMatBg: string;
  diceMatBorder: string;
  glowColor: string;
  districts: Record<string, DistrictThemeToken>;
}

export const THEMES: Record<BoardThemeKey, BoardThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Metropolis',
    ambientBg: 'radial-gradient(ellipse at 50% 40%, #0f172a 0%, #020617 100%)',
    frameBorder: '#ca8a04',
    frameBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    frameAccent: '#eab308',
    boardBg: '#0f172a',
    tileBg: '#1e293b',
    tileBorder: '#334155',
    tileTextPrimary: '#f8fafc',
    tileTextSecondary: '#94a3b8',
    centerBg: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
    centerLogoGrad: ['#fde047', '#ca8a04'],
    diceMatBg: 'rgba(15, 23, 42, 0.85)',
    diceMatBorder: 'rgba(234, 179, 8, 0.4)',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    districts: {
      sepia: { bg: '#78350f', text: '#fef3c7', border: '#b45309', pattern: 'stripes', emblem: 'anchor' },
      cyan: { bg: '#0891b2', text: '#cffafe', border: '#06b6d4', pattern: 'grid', emblem: 'bolt' },
      magenta: { bg: '#c026d3', text: '#fae8ff', border: '#d946ef', pattern: 'dots', emblem: 'palette' },
      amber: { bg: '#d97706', text: '#fef3c7', border: '#f59e0b', pattern: 'diamonds', emblem: 'crown' },
      crimson: { bg: '#dc2626', text: '#fee2e2', border: '#ef4444', pattern: 'waves', emblem: 'flame' },
      gold: { bg: '#ca8a04', text: '#fef9c3', border: '#eab308', pattern: 'chevrons', emblem: 'star' },
      emerald: { bg: '#059669', text: '#d1fae5', border: '#10b981', pattern: 'circles', emblem: 'gem' },
      navy: { bg: '#1d4ed8', text: '#dbeafe', border: '#3b82f6', pattern: 'circuit', emblem: 'shield' },
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon Cyberpunk',
    ambientBg: 'radial-gradient(ellipse at 50% 50%, #1e1035 0%, #030008 100%)',
    frameBorder: '#ec4899',
    frameBg: 'linear-gradient(135deg, #180828 0%, #05010d 100%)',
    frameAccent: '#06b6d4',
    boardBg: '#080112',
    tileBg: '#130824',
    tileBorder: '#3b185f',
    tileTextPrimary: '#fdf4ff',
    tileTextSecondary: '#a78bfa',
    centerBg: 'radial-gradient(circle at center, #260f42 0%, #05010e 100%)',
    centerLogoGrad: ['#38bdf8', '#ec4899'],
    diceMatBg: 'rgba(24, 8, 40, 0.9)',
    diceMatBorder: 'rgba(6, 182, 212, 0.5)',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    districts: {
      sepia: { bg: '#854d0e', text: '#fef08a', border: '#ca8a04', pattern: 'stripes', emblem: 'anchor' },
      cyan: { bg: '#06b6d4', text: '#ecfeff', border: '#22d3ee', pattern: 'circuit', emblem: 'bolt' },
      magenta: { bg: '#d946ef', text: '#fdf4ff', border: '#f0abfc', pattern: 'dots', emblem: 'palette' },
      amber: { bg: '#f59e0b', text: '#fffbeb', border: '#fbbf24', pattern: 'diamonds', emblem: 'crown' },
      crimson: { bg: '#f43f5e', text: '#fff1f2', border: '#fb7185', pattern: 'waves', emblem: 'flame' },
      gold: { bg: '#eab308', text: '#fefce8', border: '#facc15', pattern: 'chevrons', emblem: 'star' },
      emerald: { bg: '#10b981', text: '#ecfdf5', border: '#34d399', pattern: 'circles', emblem: 'gem' },
      navy: { bg: '#3b82f6', text: '#eff6ff', border: '#60a5fa', pattern: 'circuit', emblem: 'shield' },
    },
  },
  ancient: {
    id: 'ancient',
    name: 'Ancient Sovereign Empire',
    ambientBg: 'radial-gradient(ellipse at 50% 40%, #291809 0%, #0a0402 100%)',
    frameBorder: '#d97706',
    frameBg: 'linear-gradient(135deg, #3d2314 0%, #170d07 100%)',
    frameAccent: '#f59e0b',
    boardBg: '#1c100a',
    tileBg: '#2c1a10',
    tileBorder: '#4a2d1b',
    tileTextPrimary: '#fef3c7',
    tileTextSecondary: '#d4b996',
    centerBg: 'radial-gradient(circle at center, #3d2212 0%, #0d0603 100%)',
    centerLogoGrad: ['#fef08a', '#b45309'],
    diceMatBg: 'rgba(44, 26, 16, 0.9)',
    diceMatBorder: 'rgba(217, 119, 6, 0.5)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    districts: {
      sepia: { bg: '#6c381c', text: '#fef3c7', border: '#9a4f27', pattern: 'stripes', emblem: 'anchor' },
      cyan: { bg: '#0d7490', text: '#e0f2fe', border: '#0284c7', pattern: 'grid', emblem: 'bolt' },
      magenta: { bg: '#86198f', text: '#fae8ff', border: '#a21caf', pattern: 'dots', emblem: 'palette' },
      amber: { bg: '#b45309', text: '#fef3c7', border: '#d97706', pattern: 'diamonds', emblem: 'crown' },
      crimson: { bg: '#991b1b', text: '#fee2e2', border: '#b91c1c', pattern: 'waves', emblem: 'flame' },
      gold: { bg: '#a16207', text: '#fef9c3', border: '#ca8a04', pattern: 'chevrons', emblem: 'star' },
      emerald: { bg: '#047857', text: '#d1fae5', border: '#059669', pattern: 'circles', emblem: 'gem' },
      navy: { bg: '#1e40af', text: '#dbeafe', border: '#2563eb', pattern: 'circuit', emblem: 'shield' },
    },
  },
};
