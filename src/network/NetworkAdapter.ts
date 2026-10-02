import { GameState, PlayerAction } from '../engines/types';

export interface NetworkMessage {
  id: string;
  senderId: string;
  type: 'ACTION' | 'STATE_SYNC' | 'CHAT' | 'HEARTBEAT';
  payload: unknown;
  timestamp: number;
}

export type StateCallback = (state: GameState) => void;
export type PlayerEventCallback = (playerId: string, connected: boolean) => void;
export type ErrorCallback = (error: string) => void;

export interface NetworkAdapter {
  connect(roomCode: string, playerId: string, isHost: boolean): Promise<boolean>;
  disconnect(): void;
  sendAction(action: PlayerAction): Promise<boolean>;
  broadcastState(state: GameState): Promise<boolean>;
  onState(callback: StateCallback): () => void;
  onPlayerStatus(callback: PlayerEventCallback): () => void;
  onError(callback: ErrorCallback): () => void;
  getLatency(): number;
  isConnected(): boolean;
  isHost(): boolean;
}
