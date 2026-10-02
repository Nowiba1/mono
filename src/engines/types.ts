/**
 * Pure TypeScript types for Empire City engines and state machine.
 * Zero UI imports.
 */

export type DistrictColor =
  | 'sepia'      // Old Harbor
  | 'cyan'       // Neon Quarter
  | 'magenta'    // Artisan Heights
  | 'amber'      // Emerald District
  | 'crimson'    // Solaris Ridge
  | 'gold'       // Celestial Hill
  | 'emerald'    // Skyline Financial
  | 'navy';      // Crown Peak

export type SpaceType =
  | 'PROPERTY'
  | 'TRANSIT'
  | 'UTILITY'
  | 'GO'
  | 'VAULT'
  | 'DESTINY'
  | 'TAX'
  | 'JAIL'
  | 'FREE_PARKING'
  | 'GO_TO_JAIL';

export interface BoardSpace {
  id: number;              // 0 to 39
  name: string;
  type: SpaceType;
  district?: DistrictColor;
  price?: number;
  rent?: number[];         // [base, 1 house, 2 houses, 3 houses, 4 houses, hotel]
  houseCost?: number;
  mortgageValue?: number;
  taxAmount?: number;
  subtitle?: string;
  landmarkKey: string;     // Unique vector landmark key
}

export type CharacterId =
  | 'thorne'
  | 'marcel'
  | 'cloud'
  | 'fox'
  | 'starling'
  | 'monet'
  | 'salt'
  | 'nitro'
  | 'spark'
  | 'valoria'
  | 'blackfin'
  | 'vane';

export type CharacterEmote =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'thinking'
  | 'jailed'
  | 'bankrupt'
  | 'winner';

export type BotDifficulty = 'EASY' | 'NORMAL' | 'HARD';
export type BotPersonality = 'AGGRESSIVE' | 'CAUTIOUS' | 'TRADER' | 'BALANCED';

export interface Player {
  id: string;
  name: string;
  characterId: CharacterId;
  color: string;
  cash: number;
  position: number;        // 0 to 39
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  isBankrupt: boolean;
  isBot: boolean;
  difficulty?: BotDifficulty;
  personality?: BotPersonality;
  emote: CharacterEmote;
}

export type GamePhase =
  | 'START_TURN'
  | 'ROLLING'
  | 'RESOLVING_SPACE'
  | 'AWAITING_PURCHASE'
  | 'AUCTION'
  | 'AWAITING_END_TURN'
  | 'GAME_OVER';

export interface PropertyState {
  ownerId: string;
  houses: number;         // 0-4 houses, 5 = hotel
  isMortgaged: boolean;
}

export interface PropertyOwnership {
  [spaceId: number]: PropertyState;
}

export type CardDeckType = 'VAULT' | 'DESTINY';

export type CardEffectType =
  | 'MOVE_TO'
  | 'MOVE_RELATIVE'
  | 'MOVE_NEAREST_TRANSIT'
  | 'MOVE_NEAREST_UTILITY'
  | 'PAY_BANK'
  | 'COLLECT_BANK'
  | 'PAY_PLAYERS'
  | 'COLLECT_PLAYERS'
  | 'REPAIRS'
  | 'JAIL_FREE'
  | 'GO_TO_JAIL';

export interface Card {
  id: string;
  deck: CardDeckType;
  title: string;
  description: string;
  effect: CardEffectType;
  value?: number;
  targetSpaceId?: number;
  houseFee?: number;
  hotelFee?: number;
  icon: string;
}

export interface AuctionState {
  propertyId: number;
  currentBid: number;
  highestBidderId: string | null;
  activeBidderIds: string[];
  currentBidderIndex: number;
  minIncrement: number;
  timerRemaining: number;
}

export interface TradeOffer {
  fromPlayerId: string;
  toPlayerId: string;
  offeredCash: number;
  offeredPropertyIds: number[];
  offeredJailCards: number;
  requestedCash: number;
  requestedPropertyIds: number[];
  requestedJailCards: number;
}

export interface GameSettings {
  startingCash: number;
  goSalary: number;
  doubleGoLanding: boolean;
  freeParkingJackpot: boolean;
  auctionEnabled: boolean;
  evenBuildRule: boolean;
  mortgageInterestRate: number; // 0.10 for 10%
  jailFine: number;
  turnTimerSeconds: number;
}

export interface ActionLogItem {
  id: string;
  turn: number;
  playerId: string;
  message: string;
  type: 'ROLL' | 'MOVE' | 'BUY' | 'PAY_RENT' | 'CARD' | 'JAIL' | 'BUILD' | 'MORTGAGE' | 'TRADE' | 'AUCTION' | 'BANKRUPTCY';
  timestamp: number;
}

export interface GameState {
  id: string;
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  dice: [number, number];
  consecutiveDoubles: number;
  extraTurn: boolean;
  properties: PropertyOwnership;
  vaultDeck: Card[];
  destinyDeck: Card[];
  currentCard: Card | null;
  auction: AuctionState | null;
  pendingTrade: TradeOffer | null;
  freeParkingPool: number;
  bankHouses: number;       // Starts at 32
  bankHotels: number;       // Starts at 12
  turnCount: number;
  settings: GameSettings;
  logs: ActionLogItem[];
  winnerId: string | null;
  rngSeed: number;
}

export type PlayerAction =
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_PROPERTY' }
  | { type: 'DECLINE_PURCHASE' }
  | { type: 'PAY_JAIL_FINE' }
  | { type: 'USE_JAIL_CARD' }
  | { type: 'BID_AUCTION'; amount: number }
  | { type: 'PASS_AUCTION' }
  | { type: 'BUILD_HOUSE'; propertyId: number }
  | { type: 'SELL_HOUSE'; propertyId: number }
  | { type: 'MORTGAGE_PROPERTY'; propertyId: number }
  | { type: 'UNMORTGAGE_PROPERTY'; propertyId: number }
  | { type: 'PROPOSE_TRADE'; trade: TradeOffer }
  | { type: 'ACCEPT_TRADE' }
  | { type: 'REJECT_TRADE' }
  | { type: 'RESOLVE_CARD' }
  | { type: 'END_TURN' }
  | { type: 'DECLARE_BANKRUPTCY' };
