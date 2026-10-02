import { GameState } from './types';

export interface SaveSlotMetadata {
  slotId: string;
  gameId: string;
  turnCount: number;
  playersCount: number;
  timestamp: number;
  winnerId: string | null;
}

export class SaveEngine {
  private static STORAGE_PREFIX = 'empire_city_save_';
  private static AUTOSAVE_KEY = 'empire_city_autosave';
  private static SLOTS_INDEX_KEY = 'empire_city_save_slots';

  /**
   * Automatically saves active state every turn.
   */
  static autoSave(state: GameState): boolean {
    try {
      localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('AutoSave failed:', e);
      return false;
    }
  }

  /**
   * Loads autosaved game if one exists.
   */
  static loadAutoSave(): GameState | null {
    try {
      const data = localStorage.getItem(this.AUTOSAVE_KEY);
      if (!data) return null;
      return JSON.parse(data) as GameState;
    } catch {
      return null;
    }
  }

  /**
   * Saves to a specific named slot (e.g. 'slot_1', 'slot_2', 'slot_3').
   */
  static saveToSlot(slotId: string, state: GameState): boolean {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${slotId}`, JSON.stringify(state));

      // Update slots index
      const meta: SaveSlotMetadata = {
        slotId,
        gameId: state.id,
        turnCount: state.turnCount,
        playersCount: state.players.length,
        timestamp: Date.now(),
        winnerId: state.winnerId,
      };

      const slots = this.listSlots();
      const updatedSlots = { ...slots, [slotId]: meta };
      localStorage.setItem(this.SLOTS_INDEX_KEY, JSON.stringify(updatedSlots));
      return true;
    } catch (e) {
      console.warn('Slot save failed:', e);
      return false;
    }
  }

  /**
   * Loads state from a specific slot.
   */
  static loadFromSlot(slotId: string): GameState | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${slotId}`);
      if (!data) return null;
      return JSON.parse(data) as GameState;
    } catch {
      return null;
    }
  }

  /**
   * Lists all existing save slots.
   */
  static listSlots(): Record<string, SaveSlotMetadata> {
    try {
      const data = localStorage.getItem(this.SLOTS_INDEX_KEY);
      if (!data) return {};
      return JSON.parse(data) as Record<string, SaveSlotMetadata>;
    } catch {
      return {};
    }
  }

  /**
   * Exports game state as downloadable JSON string.
   */
  static exportToJson(state: GameState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Validates and imports JSON string into a GameState object.
   */
  static importFromJson(jsonString: string): { success: boolean; state?: GameState; error?: string } {
    try {
      const parsed = JSON.parse(jsonString) as GameState;
      if (!parsed.id || !Array.isArray(parsed.players) || typeof parsed.turnCount !== 'number') {
        return { success: false, error: 'Invalid Empire City save file format' };
      }
      return { success: true, state: parsed };
    } catch {
      return { success: false, error: 'Could not parse JSON file' };
    }
  }

  /**
   * Clears autosave.
   */
  static clearAutoSave(): void {
    try {
      localStorage.removeItem(this.AUTOSAVE_KEY);
    } catch {
      // Ignore
    }
  }
}
