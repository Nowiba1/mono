import { RulesEngine } from '../engines/RulesEngine';
import { GameState, PlayerAction } from '../engines/types';
import {
  ErrorCallback,
  NetworkAdapter,
  PlayerEventCallback,
  StateCallback,
} from './NetworkAdapter';

export class LanAdapter implements NetworkAdapter {
  private roomCode = '';
  private playerId = '';
  private host = false;
  private connected = false;
  private latency = 12; // ms
  private stateCallbacks: Set<StateCallback> = new Set();
  private playerCallbacks: Set<PlayerEventCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private currentState: GameState | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();

  async connect(roomCode: string, playerId: string, isHost: boolean): Promise<boolean> {
    this.roomCode = roomCode;
    this.playerId = playerId;
    this.host = isHost;
    this.connected = true;

    // Simulate initial local Wi-Fi handshake
    setTimeout(() => {
      this.playerCallbacks.forEach((cb) => cb(playerId, true));
    }, 100);

    return true;
  }

  disconnect(): void {
    this.dataChannels.forEach((dc) => dc.close());
    this.peerConnections.forEach((pc) => pc.close());
    this.dataChannels.clear();
    this.peerConnections.clear();
    this.connected = false;
    this.stateCallbacks.clear();
    this.playerCallbacks.clear();
    this.errorCallbacks.clear();
  }

  async sendAction(action: PlayerAction): Promise<boolean> {
    if (!this.connected) return false;

    if (this.host && this.currentState) {
      const nextState = RulesEngine.reduce(this.currentState, action);
      await this.broadcastState(nextState);
      return true;
    } else {
      // Send action to host over data channel
      const msg = JSON.stringify({ type: 'ACTION', playerId: this.playerId, action });
      this.dataChannels.forEach((channel) => {
        if (channel.readyState === 'open') {
          channel.send(msg);
        }
      });
      return true;
    }
  }

  async broadcastState(state: GameState): Promise<boolean> {
    this.currentState = state;
    this.stateCallbacks.forEach((cb) => cb(state));

    const msg = JSON.stringify({ type: 'STATE_SYNC', state });
    this.dataChannels.forEach((channel) => {
      if (channel.readyState === 'open') {
        channel.send(msg);
      }
    });

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
    return this.latency;
  }

  isConnected(): boolean {
    return this.connected;
  }

  isHost(): boolean {
    return this.host;
  }
}
