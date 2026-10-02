export type GameEventType =
  | 'DICE_ROLLED'
  | 'TOKEN_MOVED'
  | 'PROPERTY_BOUGHT'
  | 'RENT_PAID'
  | 'CARD_DRAWN'
  | 'SENT_TO_JAIL'
  | 'RELEASED_FROM_JAIL'
  | 'HOUSE_BUILT'
  | 'HOUSE_SOLD'
  | 'PROPERTY_MORTGAGED'
  | 'PROPERTY_UNMORTGAGED'
  | 'AUCTION_STARTED'
  | 'AUCTION_BID'
  | 'AUCTION_ENDED'
  | 'TRADE_PROPOSED'
  | 'TRADE_RESOLVED'
  | 'BANKRUPTCY'
  | 'VICTORY'
  | 'GO_COLLECTED'
  | 'EMOTE_CHANGED';

export interface GameEventPayload {
  type: GameEventType;
  playerId?: string;
  data?: unknown;
  timestamp: number;
}

export type EventCallback = (event: GameEventPayload) => void;

class EventBus {
  private listeners: Map<GameEventType, Set<EventCallback>> = new Map();

  on(type: GameEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  emit(type: GameEventType, playerId?: string, data?: unknown): void {
    const payload: GameEventPayload = {
      type,
      playerId,
      data,
      timestamp: Date.now(),
    };
    const cbs = this.listeners.get(type);
    if (cbs) {
      cbs.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error('Error in EventBus listener:', e);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const gameEvents = new EventBus();
