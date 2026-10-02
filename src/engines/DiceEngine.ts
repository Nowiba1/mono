/**
 * Seeded deterministic PRNG using Mulberry32.
 * Fair, replayable, cheat-proof dice rolls and deck shuffles.
 */

export class DiceEngine {
  /**
   * Mulberry32 algorithm: returns a pseudorandom number between 0 and 1,
   * along with the next state seed.
   */
  static next(seed: number): { value: number; nextSeed: number } {
    let t = (seed + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return { value: result, nextSeed: (seed + 1) | 0 };
  }

  /**
   * Rolls two 6-sided dice using the provided seed.
   */
  static roll(seed: number): {
    dice: [number, number];
    sum: number;
    isDoubles: boolean;
    nextSeed: number;
  } {
    const res1 = this.next(seed);
    const d1 = Math.floor(res1.value * 6) + 1;

    const res2 = this.next(res1.nextSeed);
    const d2 = Math.floor(res2.value * 6) + 1;

    return {
      dice: [d1, d2],
      sum: d1 + d2,
      isDoubles: d1 === d2,
      nextSeed: res2.nextSeed,
    };
  }

  /**
   * Deterministic Fisher-Yates shuffle.
   */
  static shuffle<T>(array: T[], seed: number): { shuffled: T[]; nextSeed: number } {
    const arr = [...array];
    let currentSeed = seed;
    for (let i = arr.length - 1; i > 0; i--) {
      const { value, nextSeed } = this.next(currentSeed);
      currentSeed = nextSeed;
      const j = Math.floor(value * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return { shuffled: arr, nextSeed: currentSeed };
  }
}
