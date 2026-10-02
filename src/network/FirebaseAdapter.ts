import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User } from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
  onDisconnect,
  serverTimestamp,
  Database,
  Unsubscribe,
} from 'firebase/database';
import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase.config';
import { RulesEngine } from '../engines/RulesEngine';
import { GameState, PlayerAction } from '../engines/types';
import {
  ErrorCallback,
  NetworkAdapter,
  PlayerEventCallback,
  StateCallback,
} from './NetworkAdapter';

export class FirebaseAdapter implements NetworkAdapter {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Database | null = null;
  private user: User | null = null;

  private roomCode = '';
  private playerId = '';
  private host = false;
  private connected = false;
  private latency = 35; // ms
  private stateCallbacks: Set<StateCallback> = new Set();
  private playerCallbacks: Set<PlayerEventCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private currentState: GameState | null = null;
  private unsubs: Unsubscribe[] = [];

  async connect(roomCode: string, playerId: string, isHost: boolean): Promise<boolean> {
    this.roomCode = roomCode.trim().toUpperCase();
    this.playerId = playerId;
    this.host = isHost;

    const config = getFirebaseConfig();

    try {
      if (!getApps().length) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }

      this.auth = getAuth(this.app);
      this.db = getDatabase(this.app);

      // Sign in anonymously
      const cred = await signInAnonymously(this.auth);
      this.user = cred.user;
      const uid = this.user.uid;

      const roomRef = ref(this.db, `rooms/${this.roomCode}`);
      const playerRef = ref(this.db, `rooms/${this.roomCode}/players/${uid}`);
      const connectedRef = ref(this.db, '.info/connected');

      // Presence tracking
      const unsubConn = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          this.connected = true;
          onDisconnect(playerRef).update({
            connected: false,
            lastSeen: serverTimestamp(),
          });
          set(playerRef, {
            id: this.playerId,
            uid,
            isHost: this.host,
            connected: true,
            lastSeen: Date.now(),
          });
          this.playerCallbacks.forEach((cb) => cb(this.playerId, true));
        }
      });
      this.unsubs.push(unsubConn);

      // If host, set up meta and action queue listener
      if (this.host) {
        const metaRef = ref(this.db, `rooms/${this.roomCode}/meta`);
        await set(metaRef, {
          hostId: uid,
          roomCode: this.roomCode,
          createdAt: Date.now(),
          status: 'ACTIVE',
        });

        // Listen for guest actions in queue
        const actionsRef = ref(this.db, `rooms/${this.roomCode}/actions`);
        const unsubActions = onValue(actionsRef, async (snap) => {
          const actionsVal = snap.val();
          if (actionsVal && this.currentState) {
            for (const [actionId, item] of Object.entries(actionsVal) as [string, { action: PlayerAction; playerId: string }][]) {
              try {
                const nextState = RulesEngine.reduce(this.currentState, item.action);
                await this.broadcastState(nextState);
                await remove(ref(this.db!, `rooms/${this.roomCode}/actions/${actionId}`));
              } catch (err) {
                console.error('Error applying guest action:', err);
              }
            }
          }
        });
        this.unsubs.push(unsubActions);
      }

      // Listen for latest state
      const stateRef = ref(this.db, `rooms/${this.roomCode}/state`);
      const unsubState = onValue(stateRef, (snap) => {
        const stateVal = snap.val();
        if (stateVal) {
          this.currentState = stateVal;
          this.stateCallbacks.forEach((cb) => cb(stateVal));
        }
      });
      this.unsubs.push(unsubState);

      this.connected = true;
      return true;
    } catch (e) {
      console.warn('Firebase connection failed, falling back to local simulation:', e);
      this.connected = true;
      if (this.host && this.currentState) {
        this.stateCallbacks.forEach((cb) => cb(this.currentState!));
      }
      return true;
    }
  }

  disconnect(): void {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];
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
    }

    // Guest sends action to host queue via Realtime Database
    if (this.db && this.user) {
      try {
        const actionsRef = ref(this.db, `rooms/${this.roomCode}/actions`);
        await push(actionsRef, {
          playerId: this.playerId,
          uid: this.user.uid,
          action,
          timestamp: Date.now(),
        });
        return true;
      } catch (e) {
        console.error('Error pushing action to Firebase:', e);
      }
    }

    return true;
  }

  async broadcastState(state: GameState): Promise<boolean> {
    this.currentState = state;
    this.stateCallbacks.forEach((cb) => cb(state));

    if (this.db && this.host) {
      try {
        const stateRef = ref(this.db, `rooms/${this.roomCode}/state`);
        await set(stateRef, state);
      } catch (e) {
        console.warn('Error broadcasting state to Firebase RTDB:', e);
      }
    }

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
