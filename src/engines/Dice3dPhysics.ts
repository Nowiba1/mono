/**
 * 3D Dice tumble physics and orientation calculations.
 * Seeded PRNG decides the final face first;
 * this physics system guides the 3D CSS tumble to land precisely on the target.
 */

export interface Dice3dTransform {
  rotX: number;
  rotY: number;
  rotZ: number;
}

export class Dice3dPhysics {
  /**
   * Returns base 3D orientation for standard 6-sided die faces.
   */
  static getFaceRotation(faceValue: number): { x: number; y: number } {
    switch (faceValue) {
      case 1: // Front face
        return { x: 0, y: 0 };
      case 2: // Right face
        return { x: 0, y: -90 };
      case 3: // Top face
        return { x: -90, y: 0 };
      case 4: // Bottom face
        return { x: 90, y: 0 };
      case 5: // Left face
        return { x: 0, y: 90 };
      case 6: // Back face
        return { x: 180, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }

  /**
   * Generates dynamic 3D tumbling transforms with realistic spin revolutions
   * that settle on the exact target die face.
   */
  static calculateTumbleAnimation(targetFace: number): {
    start: Dice3dTransform;
    midpoint: Dice3dTransform;
    final: Dice3dTransform;
  } {
    const base = this.getFaceRotation(targetFace);
    // Add 2-3 full 360-degree spins for visual inertia
    const fullSpinsX = (2 + Math.floor(Math.random() * 2)) * 360;
    const fullSpinsY = (2 + Math.floor(Math.random() * 2)) * 360;

    return {
      start: {
        rotX: Math.floor(Math.random() * 360),
        rotY: Math.floor(Math.random() * 360),
        rotZ: Math.floor(Math.random() * 180),
      },
      midpoint: {
        rotX: base.x + fullSpinsX / 2 + 180,
        rotY: base.y + fullSpinsY / 2 + 180,
        rotZ: 90,
      },
      final: {
        rotX: base.x + fullSpinsX,
        rotY: base.y + fullSpinsY,
        rotZ: 0,
      },
    };
  }
}
