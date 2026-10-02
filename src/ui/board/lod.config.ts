/**
 * Level of Detail (LOD) Configuration for Empire City Board.
 * Dynamically adapts tile rendering based on on-screen pixel dimensions and camera zoom.
 */

export type LodLevel = 'tiny' | 'medium' | 'full' | 'zoomed';

export const LOD_THRESHOLDS = {
  TINY_MAX_PX: 32,
  MEDIUM_MAX_PX: 56,
  ZOOMED_MIN_FACTOR: 2.3,
} as const;

export interface LodSettings {
  showLandmarkIcon: boolean;
  showDistrictEmblem: boolean;
  showPriceBadge: boolean;
  showPropertyName: boolean;
  showRentPreview: boolean;
  showOwnerAvatar: boolean;
  showBuildingSlots: boolean;
}

export function lodForTileSize(pixelWidth: number, zoom: number = 1.0): LodLevel {
  if (zoom >= LOD_THRESHOLDS.ZOOMED_MIN_FACTOR) {
    return 'zoomed';
  }
  if (pixelWidth < LOD_THRESHOLDS.TINY_MAX_PX) {
    return 'tiny';
  }
  if (pixelWidth <= LOD_THRESHOLDS.MEDIUM_MAX_PX) {
    return 'medium';
  }
  return 'full';
}

export function getLodSettings(level: LodLevel): LodSettings {
  switch (level) {
    case 'tiny':
      return {
        showLandmarkIcon: true,
        showDistrictEmblem: true,
        showPriceBadge: false,
        showPropertyName: false,
        showRentPreview: false,
        showOwnerAvatar: false,
        showBuildingSlots: false,
      };
    case 'medium':
      return {
        showLandmarkIcon: true,
        showDistrictEmblem: true,
        showPriceBadge: true,
        showPropertyName: false,
        showRentPreview: false,
        showOwnerAvatar: true,
        showBuildingSlots: true,
      };
    case 'full':
      return {
        showLandmarkIcon: true,
        showDistrictEmblem: true,
        showPriceBadge: true,
        showPropertyName: true,
        showRentPreview: true,
        showOwnerAvatar: true,
        showBuildingSlots: true,
      };
    case 'zoomed':
    default:
      return {
        showLandmarkIcon: true,
        showDistrictEmblem: true,
        showPriceBadge: true,
        showPropertyName: true,
        showRentPreview: true,
        showOwnerAvatar: true,
        showBuildingSlots: true,
      };
  }
}
