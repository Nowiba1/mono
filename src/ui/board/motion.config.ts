/**
 * Motion and Animation timing constants for Empire City Board.
 * Tunable parameters for pawn hops, camera follow, and VFX.
 */

export const MOTION_CONFIG = {
  // Pawn Movement
  HOP_BASE_DURATION_MS: 260,
  HOP_MIN_DURATION_MS: 150,
  HOP_ARC_HEIGHT_UNITS: 22,
  PASS_GO_PAUSE_MS: 380,
  TELEPORT_VANISH_MS: 240,
  TELEPORT_APPEAR_MS: 240,
  SIREN_FLASH_MS: 600,

  // Camera Follow
  CAMERA_FOLLOW_ZOOM: 1.75,
  CAMERA_LANDING_ZOOM: 2.1,
  CAMERA_SMOOTH_FACTOR: 0.12,
  CAMERA_USER_PAUSE_MS: 3000,

  // Visual Effects
  COIN_STREAM_DURATION_MS: 650,
  TILE_PULSE_DURATION_MS: 450,
  DICE_SETTLE_DISPLAY_MS: 1200,
  CARD_FLIP_DURATION_MS: 500,
  EMOTE_DISPLAY_MS: 2200,

  // Multipliers
  SPEED_MULTIPLIERS: {
    '1x': 1.0,
    '2x': 0.6,
    '3x': 0.25,
  },
} as const;

export function getAdjustedDuration(baseMs: number, speed: '1x' | '2x' | '3x', reducedMotion: boolean = false): number {
  if (reducedMotion) return Math.min(60, baseMs * 0.15);
  return baseMs * MOTION_CONFIG.SPEED_MULTIPLIERS[speed];
}
