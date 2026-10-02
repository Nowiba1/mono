import { AIEngine } from '../engines/AIEngine';
import { RulesEngine } from '../engines/RulesEngine';
import { GameState, PlayerAction } from '../engines/types';
import {
  ErrorCallback,
  NetworkAdapter,
  PlayerEventCallback,
  StateCallback,
} from './NetworkAdapter';

export class LocalAdapter implements NetworkAdapter {
  private currentState: GameState | null = null;
  private stateCallbacks: Set<StateCallback> = new Set();
  private playerCallbacks: Set<PlayerEventCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private botTimer: number | null = null;
  private active = false;

  async connect(_roomCode: string, _playerId: string, _isHost: boolean): Promise<boolean> {
    this.active = true;
    return true;
  }

  disconnect(): void {
    this.active = false;
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    this.stateCallbacks.clear();
    this.playerCallbacks.clear();
    this.errorCallbacks.clear();
  }

  async sendAction(action: PlayerAction): Promise<boolean> {
    if (!this.currentState) return false;

    try {
      const nextState = RulesEngine.reduce(this.currentState, action);
      await this.broadcastState(nextState);
      return true;
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Action reduction failed';
      this.errorCallbacks.forEach((cb) => cb(err));
      return false;
    }
  }

  async broadcastState(state: GameState): Promise<boolean> {
    this.currentState = state;
    this.stateCallbacks.forEach((cb) => cb(state));

    // Check if the next turn or auction belongs to a bot
    this.scheduleBotTurnIfApplicable();
    return true;
  }

  onState(callback: StateCallback): () => void {
    this.stateCallbacks.add(callback);
    if (this.currentState) {
      callback(this.currentState);
    }
    return () => this.stateCallbacks.delete(callback);
  }

  onPlayerStatus(callback: PlayerEventCallback): () => void {
    this.playerCallbacks.add(callback);
    return () => this.playerCallbacks.delete(callback);
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  getLatency(): number {
    return 0; // Local execution
  }

  isConnected(): boolean {
    return this.active;
  }

  isHost(): boolean {
    return true;
  }

  private scheduleBotTurnIfApplicable(): void {
    if (!this.currentState || this.currentState.phase === 'GAME_OVER') return;

    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }

    const state = this.currentState;
    let targetBotId: string | null = null;

    if (state.phase === 'AUCTION' && state.auction) {
      const currentBidderId = state.auction.activeBidderIds[state.auction.currentBidderIndex];
      const bidder = state.players.find((p) => p.id === currentBidderId);
      if (bidder?.isBot) {
        targetBotId = bidder.id;
      }
    } else {
      const activePlayer = state.players[state.activePlayerIndex];
      if (activePlayer?.isBot && !activePlayer.isBankrupt) {
        targetBotId = activePlayer.id;
      }
    }

    if (targetBotId) {
      // Natural bot "thinking" delay
      this.botTimer = window.setTimeout(() => {
        if (!this.currentState) return;
        const botAction = AIEngine.getNextAction(this.currentState, targetBotId!);
        if (botAction) {
          this.sendAction(botAction);
        }
      }, 700);
    }
  }
}
