import React, { useMemo, useState } from 'react';
import { GameState, Player } from '../../engines/types';
import { BOARD_SPACES } from '../../config/board.data';
import { CHARACTERS } from '../../config/characters.data';
import { LOGICAL_BOARD_SIZE, LOGICAL_FRAME_SIZE, pawnSlotsFor, tileIndexToRect } from './geometry';
import { getLodSettings, lodForTileSize } from './lod.config';
import { CameraController, CameraMode } from './CameraController';
import { THEMES, BoardThemeKey } from './theme.types';
import { TileView } from './TileView';
import { CenterView } from './CenterView';
import { PawnView } from './PawnView';
import { BuildingView } from './BuildingView';
import { OwnershipView } from './OwnershipView';

export interface BoardRendererProps {
  gameState: GameState;
  themeKey?: BoardThemeKey;
  boardSizePx?: number;
  selectedSpaceId?: number | null;
  cameraMode?: CameraMode;
  tiltEnabled?: boolean;
  highlightedSpaceIds?: number[];
  pawnHopOffsets?: Record<string, { x: number; y: number; arcY: number }>;
  isDimmed?: boolean;
  showFps?: boolean;
  onTileClick?: (spaceId: number) => void;
  onRollClick?: () => void;
}

export const BoardRenderer: React.FC<BoardRendererProps> = ({
  gameState,
  themeKey = 'classic',
  boardSizePx = 360,
  selectedSpaceId = null,
  cameraMode = 'follow',
  tiltEnabled = false,
  highlightedSpaceIds = [],
  pawnHopOffsets = {},
  isDimmed = false,
  showFps = false,
  onTileClick,
  onRollClick,
}) => {
  const theme = useMemo(() => THEMES[themeKey] || THEMES.classic, [themeKey]);
  const activePlayer = gameState.players[gameState.activePlayerIndex];

  // Tile dimensions on screen
  const sideTilePx = (boardSizePx / 1000) * 80;
  const lodLevel = lodForTileSize(sideTilePx);
  const lod = getLodSettings(lodLevel);

  // Compute camera target focus based on active player
  const targetFocus = useMemo(() => {
    if (!activePlayer) return null;
    const rect = tileIndexToRect(activePlayer.position);
    return { x: rect.centerX, y: rect.centerY };
  }, [activePlayer?.position]);

  // Group pawns by position to calculate non-overlapping slots
  const pawnsByTile = useMemo(() => {
    const map = new Map<number, Player[]>();
    for (const player of gameState.players) {
      if (player.isBankrupt) continue;
      const list = map.get(player.position) || [];
      list.push(player);
      map.set(player.position, list);
    }
    return map;
  }, [gameState.players]);

  // Pre-calculate rectangles for all 40 tiles
  const tileRects = useMemo(() => {
    return BOARD_SPACES.map((space) => tileIndexToRect(space.id));
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden select-none">
      <CameraController
        boardSizePx={boardSizePx}
        cameraMode={cameraMode}
        targetFocusLogical={targetFocus}
        tiltEnabled={tiltEnabled}
      >
        {({ camera, containerProps, recenter }) => (
          <div
            {...containerProps}
            className="relative cursor-grab active:cursor-grabbing touch-none transition-transform duration-200 ease-out"
            style={{
              width: boardSizePx,
              height: boardSizePx,
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom}) ${
                camera.tilt ? `perspective(900px) rotateX(${camera.tilt}deg)` : ''
              }`,
              transformOrigin: 'center center',
            }}
          >
            {/* SVG Master Layer Stack (0 to 1024 units logical) */}
            <svg
              viewBox="-12 -12 1024 1024"
              width={boardSizePx}
              height={boardSizePx}
              className="filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
            >
              {/* Layer 1: Board Base + Decorative Outer Frame */}
              <rect
                x={-12}
                y={-12}
                width={LOGICAL_FRAME_SIZE}
                height={LOGICAL_FRAME_SIZE}
                fill={theme.frameBg}
                stroke={theme.frameBorder}
                strokeWidth={3}
                rx={16}
              />
              <rect
                x={0}
                y={0}
                width={LOGICAL_BOARD_SIZE}
                height={LOGICAL_BOARD_SIZE}
                fill={theme.boardBg}
                rx={10}
              />

              {/* Layer 2: Center Artwork & Decks */}
              <CenterView
                theme={theme}
                activePlayer={activePlayer}
                turnCount={gameState.turnCount}
                freeParkingPool={gameState.freeParkingPool}
                isAwaitingRoll={gameState.phase === 'START_TURN'}
                isDrawPending={gameState.phase === 'RESOLVING_SPACE'}
                isDimmed={isDimmed}
                onRollClick={onRollClick}
              />

              {/* Layer 3: 40 Illustrated Tile Faces */}
              <g id="tiles-layer">
                {BOARD_SPACES.map((space) => {
                  const rect = tileRects[space.id];
                  const propState = gameState.properties[space.id];
                  const owner = propState ? gameState.players.find((p) => p.id === propState.ownerId) : undefined;
                  const isSelected = selectedSpaceId === space.id;
                  const isHighlighted = highlightedSpaceIds.includes(space.id) || activePlayer?.position === space.id;

                  return (
                    <TileView
                      key={space.id}
                      space={space}
                      rect={rect}
                      propertyState={propState}
                      ownerColor={owner?.color}
                      lod={lod}
                      theme={theme}
                      isSelected={isSelected}
                      isHighlighted={isHighlighted}
                      freeParkingJackpot={gameState.freeParkingPool}
                      onTap={onTileClick}
                    />
                  );
                })}
              </g>

              {/* Layer 4: Ownership Flags & Avatar Seals */}
              <g id="ownership-layer">
                {BOARD_SPACES.map((space) => {
                  const rect = tileRects[space.id];
                  const propState = gameState.properties[space.id];
                  if (!propState) return null;
                  const owner = gameState.players.find((p) => p.id === propState.ownerId);
                  return (
                    <OwnershipView
                      key={`own-${space.id}`}
                      rect={rect}
                      propertyState={propState}
                      owner={owner}
                      showAvatar={lod.showOwnerAvatar}
                    />
                  );
                })}
              </g>

              {/* Layer 5: Building Layer (Eco-Villas & Grand Citadels) */}
              <g id="buildings-layer">
                {BOARD_SPACES.map((space) => {
                  const rect = tileRects[space.id];
                  const propState = gameState.properties[space.id];
                  if (!propState || propState.houses <= 0) return null;
                  return (
                    <BuildingView
                      key={`bld-${space.id}`}
                      rect={rect}
                      houses={propState.houses}
                      lodShowSlots={lod.showBuildingSlots}
                    />
                  );
                })}
              </g>

              {/* Layer 7: Pawn Layer (Depth-Sorted by Y coordinate) */}
              <g id="pawns-layer">
                {Array.from(pawnsByTile.entries()).flatMap(([tileIdx, playersOnTile]) => {
                  const slots = pawnSlotsFor(tileIdx, playersOnTile.length, playersOnTile.some((p) => p.inJail));

                  return playersOnTile.map((player, slotIdx) => {
                    const slot = slots[slotIdx] || { x: 500, y: 500, scale: 1.0 };
                    const hopOffset = pawnHopOffsets[player.id];
                    const posX = hopOffset ? hopOffset.x : slot.x;
                    const posY = hopOffset ? hopOffset.y : slot.y;
                    const arcY = hopOffset ? hopOffset.arcY : 0;

                    return (
                      <PawnView
                        key={player.id}
                        id={player.id}
                        name={player.name}
                        characterId={player.characterId}
                        color={player.color}
                        x={posX}
                        y={posY}
                        scale={slot.scale}
                        isCurrentTurn={player.id === activePlayer?.id}
                        isMoving={Boolean(hopOffset)}
                        hopArcY={arcY}
                        emote={player.emote}
                        billboardTilt={camera.tilt}
                        jailTurnCount={player.inJail ? player.jailTurns : undefined}
                      />
                    );
                  });
                })}
              </g>
            </svg>
          </div>
        )}
      </CameraController>
    </div>
  );
};
