import { GameState, PlayerAction } from '../engines/types';
import {
  ErrorCallback,
  NetworkAdapter,
  PlayerEventCallback,
  StateCallback,
} from './NetworkAdapter';

export class MockAdapter implements NetworkAdapter {
  public simulatedLatency = 30; // ms
  public packetLossRate = 0.0;
  private connected = true;
  private host = true;
  private stateCallbacks: Set<StateCallback> = new Set();
  private playerCallbacks: Set<PlayerEventCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private currentState: GameState | null = null;

  async connect(_roomCode: string, _playerId: string, isHost: boolean): Promise<boolean> {
    this.host = isHost;
    this.connected = true;
    return true;
  }

  disconnect(): void {
    this.connected = false;
  }

  async sendAction(_action: PlayerAction): Promise<boolean> {
    if (Math.random() < this.packetLossRate) return false;
    return true;
  }

  async broadcastState(state: GameState): Promise<boolean> {
    this.currentState = state;
    if (Math.random() < this.packetLossRate) return false;

    setTimeout(() => {
      this.stateCallbacks.forEach((cb) => cb(state));
    }, this.simulatedLatency);

    return true;
  }

  onState(callback: StateCallback): () => void {
    this.stateCallbacks.add(callback);
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
    return this.simulatedLatency;
  }

  isConnected(): boolean {
    return this.connected;
  }

  isHost(): boolean {
    return this.host;
  }
}
