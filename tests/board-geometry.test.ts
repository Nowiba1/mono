import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  tileIndexToRect,
  pathBetween,
  pawnSlotsFor,
  LOGICAL_BOARD_SIZE,
  CORNER_SIZE,
  SIDE_TILE_WIDTH,
  SIDE_TILE_HEIGHT,
  clampCamera,
} from '../src/ui/board/geometry';
import { lodForTileSize } from '../src/ui/board/lod.config';

describe('Empire City Board Geometry Spec', () => {
  it('should correctly calculate all 40 tile rectangles with exact dimensions', () => {
    for (let i = 0; i < 40; i++) {
      const rect = tileIndexToRect(i);
      assert.strictEqual(rect.index, i, `Tile ${i} index mismatch`);
      assert(rect.x >= 0 && rect.x <= LOGICAL_BOARD_SIZE, `Tile ${i} x out of bounds: ${rect.x}`);
      assert(rect.y >= 0 && rect.y <= LOGICAL_BOARD_SIZE, `Tile ${i} y out of bounds: ${rect.y}`);

      if (i % 10 === 0) {
        // Corner
        assert.strictEqual(rect.isCorner, true, `Tile ${i} should be a corner`);
        assert.strictEqual(rect.width, CORNER_SIZE, `Tile ${i} corner width should be 140`);
        assert.strictEqual(rect.height, CORNER_SIZE, `Tile ${i} corner height should be 140`);
      } else {
        // Side tile
        assert.strictEqual(rect.isCorner, false, `Tile ${i} should be a side tile`);
        if (rect.side === 'bottom' || rect.side === 'top') {
          assert.strictEqual(rect.width, SIDE_TILE_WIDTH, `Tile ${i} width should be 80`);
          assert.strictEqual(rect.height, SIDE_TILE_HEIGHT, `Tile ${i} height should be 140`);
        } else {
          assert.strictEqual(rect.width, SIDE_TILE_HEIGHT, `Tile ${i} width should be 140`);
          assert.strictEqual(rect.height, SIDE_TILE_WIDTH, `Tile ${i} height should be 80`);
        }
      }
    }
  });

  it('should compute exact step-by-step path sequence with GO wrap-around', () => {
    const pathForward = pathBetween(38, 2);
    assert.deepStrictEqual(pathForward, [39, 0, 1, 2]);

    const pathBackward = pathBetween(2, 38, 'backward');
    assert.deepStrictEqual(pathBackward, [1, 0, 39, 38]);
  });

  it('should generate non-overlapping pawn slots for 1 to 6 players', () => {
    for (let tileIdx = 0; tileIdx < 40; tileIdx++) {
      for (let count = 1; count <= 6; count++) {
        const slots = pawnSlotsFor(tileIdx, count);
        assert.strictEqual(slots.length, count);

        // Verify no two slots are identical
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            const dist = Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y);
            assert(dist > 5, `Pawn slots overlap on tile ${tileIdx}: dist=${dist}`);
          }
        }
      }
    }
  });

  it('should calculate Level of Detail (LOD) correctly based on pixel dimensions and zoom', () => {
    assert.strictEqual(lodForTileSize(24, 1.0), 'tiny');
    assert.strictEqual(lodForTileSize(44, 1.0), 'medium');
    assert.strictEqual(lodForTileSize(80, 1.0), 'full');
    assert.strictEqual(lodForTileSize(80, 2.6), 'zoomed');
  });

  it('should safely clamp camera panning within bounds', () => {
    const clamped = clampCamera(2000, -2000, 1.5, 400, 400, 400);
    assert(Math.abs(clamped.x) <= 400, 'X pan clamped');
    assert(Math.abs(clamped.y) <= 400, 'Y pan clamped');
  });
});
