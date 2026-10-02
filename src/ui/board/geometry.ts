/**
 * Pure geometry and coordinate helper module for Empire City board.
 * Logical coordinate system: 1000 x 1000 units.
 * Corners: 140 x 140 units.
 * Side tiles: 80 wide x 140 deep (9 per side).
 * Center: 720 x 720 units.
 */

export interface TileRect {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270 degrees
  centerX: number;
  centerY: number;
  side: 'bottom' | 'left' | 'top' | 'right';
  inwardNormal: { x: number; y: number };
  isCorner: boolean;
}

export interface PawnSlotPosition {
  x: number;
  y: number;
  scale: number;
  slotIndex: number;
}

export const LOGICAL_BOARD_SIZE = 1000;
export const LOGICAL_FRAME_SIZE = 1024;
export const CORNER_SIZE = 140;
export const SIDE_TILE_WIDTH = 80;
export const SIDE_TILE_HEIGHT = 140;
export const CENTER_AREA_OFFSET = 140;
export const CENTER_AREA_SIZE = 720;

/**
 * Pure function mapping any board index (0 to 39) to its exact logical rectangle.
 */
export function tileIndexToRect(index: number): TileRect {
  const normIndex = ((index % 40) + 40) % 40;

  // 1. Bottom Row: 0 (GO) down to 10 (Jail)
  if (normIndex === 0) {
    // Bottom-Right Corner (GO)
    return {
      index: 0,
      x: 860,
      y: 860,
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      rotation: 0,
      centerX: 930,
      centerY: 930,
      side: 'bottom',
      inwardNormal: { x: -1, y: -1 },
      isCorner: true,
    };
  } else if (normIndex >= 1 && normIndex <= 9) {
    // Bottom row side tiles (right to left: index 1 is at x=780, index 9 is at x=140)
    const x = 860 - normIndex * SIDE_TILE_WIDTH;
    const y = 860;
    return {
      index: normIndex,
      x,
      y,
      width: SIDE_TILE_WIDTH,
      height: SIDE_TILE_HEIGHT,
      rotation: 0,
      centerX: x + SIDE_TILE_WIDTH / 2,
      centerY: y + SIDE_TILE_HEIGHT / 2,
      side: 'bottom',
      inwardNormal: { x: 0, y: -1 },
      isCorner: false,
    };
  } else if (normIndex === 10) {
    // Bottom-Left Corner (Jail / Just Visiting)
    return {
      index: 10,
      x: 0,
      y: 860,
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      rotation: 90,
      centerX: 70,
      centerY: 930,
      side: 'left',
      inwardNormal: { x: 1, y: -1 },
      isCorner: true,
    };
  } else if (normIndex >= 11 && normIndex <= 19) {
    // Left column side tiles (bottom to top: index 11 is at y=780, index 19 is at y=140)
    const step = normIndex - 10;
    const x = 0;
    const y = 860 - step * SIDE_TILE_WIDTH;
    return {
      index: normIndex,
      x,
      y,
      width: SIDE_TILE_HEIGHT, // 140 wide
      height: SIDE_TILE_WIDTH,  // 80 high
      rotation: 90,
      centerX: x + SIDE_TILE_HEIGHT / 2,
      centerY: y + SIDE_TILE_WIDTH / 2,
      side: 'left',
      inwardNormal: { x: 1, y: 0 },
      isCorner: false,
    };
  } else if (normIndex === 20) {
    // Top-Left Corner (Free Parking)
    return {
      index: 20,
      x: 0,
      y: 0,
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      rotation: 180,
      centerX: 70,
      centerY: 70,
      side: 'top',
      inwardNormal: { x: 1, y: 1 },
      isCorner: true,
    };
  } else if (normIndex >= 21 && normIndex <= 29) {
    // Top row side tiles (left to right: index 21 is at x=140, index 29 is at x=780)
    const step = normIndex - 20;
    const x = 140 + (step - 1) * SIDE_TILE_WIDTH;
    const y = 0;
    return {
      index: normIndex,
      x,
      y,
      width: SIDE_TILE_WIDTH,
      height: SIDE_TILE_HEIGHT,
      rotation: 180,
      centerX: x + SIDE_TILE_WIDTH / 2,
      centerY: y + SIDE_TILE_HEIGHT / 2,
      side: 'top',
      inwardNormal: { x: 0, y: 1 },
      isCorner: false,
    };
  } else if (normIndex === 30) {
    // Top-Right Corner (Go To Jail)
    return {
      index: 30,
      x: 860,
      y: 0,
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      rotation: 270,
      centerX: 930,
      centerY: 70,
      side: 'right',
      inwardNormal: { x: -1, y: 1 },
      isCorner: true,
    };
  } else {
    // Right column side tiles (top to bottom: index 31 is at y=140, index 39 is at y=780)
    const step = normIndex - 30;
    const x = 860;
    const y = 140 + (step - 1) * SIDE_TILE_WIDTH;
    return {
      index: normIndex,
      x,
      y,
      width: SIDE_TILE_HEIGHT,
      height: SIDE_TILE_WIDTH,
      rotation: 270,
      centerX: x + SIDE_TILE_HEIGHT / 2,
      centerY: y + SIDE_TILE_WIDTH / 2,
      side: 'right',
      inwardNormal: { x: -1, y: 0 },
      isCorner: false,
    };
  }
}

/**
 * Computes step-by-step path sequence from start to target index.
 */
export function pathBetween(from: number, to: number, direction: 'forward' | 'backward' = 'forward'): number[] {
  const path: number[] = [];
  const start = ((from % 40) + 40) % 40;
  const target = ((to % 40) + 40) % 40;

  if (start === target) return [start];

  if (direction === 'forward') {
    let curr = start;
    while (curr !== target) {
      curr = (curr + 1) % 40;
      path.push(curr);
    }
  } else {
    let curr = start;
    while (curr !== target) {
      curr = (curr - 1 + 40) % 40;
      path.push(curr);
    }
  }

  return path;
}

/**
 * Calculates deterministic non-overlapping pawn slots for up to 6 players on a tile.
 */
export function pawnSlotsFor(
  tileIndex: number,
  playerCount: number,
  isInJail: boolean = false
): PawnSlotPosition[] {
  const rect = tileIndexToRect(tileIndex);
  const count = Math.max(1, Math.min(6, playerCount));
  const scale = count >= 4 ? 0.75 : count >= 3 ? 0.85 : 1.0;

  // Special handling for Jail (index 10)
  if (rect.isCorner && tileIndex === 10) {
    if (isInJail) {
      // Inside cell box (upper right portion of corner 10)
      const cellCenter = { x: 92, y: 908 };
      const offsets = [
        { x: 0, y: 0 },
        { x: -16, y: -10 },
        { x: 16, y: -10 },
        { x: -16, y: 12 },
        { x: 16, y: 12 },
        { x: 0, y: -18 },
      ];
      return Array.from({ length: count }).map((_, idx) => ({
        x: cellCenter.x + (offsets[idx]?.x || 0),
        y: cellCenter.y + (offsets[idx]?.y || 0),
        scale: 0.72,
        slotIndex: idx,
      }));
    } else {
      // Just Visiting strip along outer edge
      const stripCenter = { x: 38, y: 960 };
      const offsets = [
        { x: 0, y: 0 },
        { x: 18, y: 0 },
        { x: -18, y: 0 },
        { x: 34, y: 0 },
        { x: -18, y: -20 },
        { x: 18, y: -20 },
      ];
      return Array.from({ length: count }).map((_, idx) => ({
        x: stripCenter.x + (offsets[idx]?.x || 0),
        y: stripCenter.y + (offsets[idx]?.y || 0),
        scale: 0.75,
        slotIndex: idx,
      }));
    }
  }

  // General Corner tiles (0, 20, 30)
  if (rect.isCorner) {
    const cx = rect.centerX;
    const cy = rect.centerY;
    const gridOffsets = [
      { x: 0, y: 8 },
      { x: -24, y: -12 },
      { x: 24, y: -12 },
      { x: -24, y: 24 },
      { x: 24, y: 24 },
      { x: 0, y: -28 },
    ];
    return Array.from({ length: count }).map((_, idx) => ({
      x: cx + (gridOffsets[idx]?.x || 0),
      y: cy + (gridOffsets[idx]?.y || 0),
      scale,
      slotIndex: idx,
    }));
  }

  // Side tiles (Bottom, Left, Top, Right)
  const cx = rect.centerX;
  const cy = rect.centerY;

  if (rect.side === 'bottom' || rect.side === 'top') {
    // 80 wide x 140 deep. Slots in 2 rows x 3 columns
    const xSpacings = count === 1 ? [0] : count === 2 ? [-16, 16] : [-22, 0, 22];
    const yShift = rect.side === 'bottom' ? 8 : -8;
    const positions: PawnSlotPosition[] = [];

    for (let i = 0; i < count; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const px = cx + (xSpacings[col] ?? 0);
      const py = cy + yShift + (row === 1 ? 22 : -6);
      positions.push({ x: px, y: py, scale, slotIndex: i });
    }
    return positions;
  } else {
    // 140 wide x 80 deep. Left or Right column
    const ySpacings = count === 1 ? [0] : count === 2 ? [-16, 16] : [-22, 0, 22];
    const xShift = rect.side === 'left' ? 8 : -8;
    const positions: PawnSlotPosition[] = [];

    for (let i = 0; i < count; i++) {
      const row = i % 3;
      const col = Math.floor(i / 3);
      const px = cx + xShift + (col === 1 ? 22 : -6);
      const py = cy + (ySpacings[row] ?? 0);
      positions.push({ x: px, y: py, scale, slotIndex: i });
    }
    return positions;
  }
}

/**
 * Computes responsive square board size fitted inside viewport with safe margins.
 */
export function fitBoard(
  viewportWidth: number,
  viewportHeight: number,
  insets: { top: number; right: number; bottom: number; left: number } = { top: 0, right: 0, bottom: 0, left: 0 }
): number {
  const availW = Math.max(280, viewportWidth - insets.left - insets.right - 16);
  const isPortrait = viewportHeight > viewportWidth;
  // In portrait, board takes ~58% of height to leave room for bottom action HUD
  const maxH = isPortrait ? (viewportHeight - insets.top - insets.bottom) * 0.60 : viewportHeight - insets.top - insets.bottom - 24;
  const size = Math.min(availW, maxH);
  return Math.max(260, Math.floor(size));
}

/**
 * Clamps pan coordinates so the board cannot be dragged out of view.
 */
export function clampCamera(
  panX: number,
  panY: number,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
  boardSizePx: number
): { x: number; y: number } {
  const maxPanX = Math.max(0, (boardSizePx * zoom - viewportWidth) / 2 + 100);
  const maxPanY = Math.max(0, (boardSizePx * zoom - viewportHeight) / 2 + 100);

  return {
    x: Math.max(-maxPanX, Math.min(maxPanX, panX)),
    y: Math.max(-maxPanY, Math.min(maxPanY, panY)),
  };
}
