import { BoardEngine } from './BoardEngine';
import { EconomyEngine } from './EconomyEngine';
import {
  BoardSpace,
  BotDifficulty,
  BotPersonality,
  GameState,
  Player,
  PlayerAction,
  TradeOffer,
} from './types';

export class AIEngine {
  /**
   * Evaluates the best action for a bot given the current game state.
   */
  static getNextAction(state: GameState, botPlayerId: string): PlayerAction | null {
    const player = state.players.find((p) => p.id === botPlayerId);
    if (!player || player.isBankrupt) return null;

    const difficulty: BotDifficulty = player.difficulty || 'NORMAL';
    const personality: BotPersonality = player.personality || 'BALANCED';

    // 1. In Jail: Decide how to escape
    if (player.inJail && state.phase === 'START_TURN') {
      return this.decideJailEscape(state, player, difficulty);
    }

    // 2. Start turn: Roll dice
    if (state.phase === 'START_TURN') {
      return { type: 'ROLL_DICE' };
    }

    // 3. Resolving card: Card drawn, acknowledge
    if (state.phase === 'RESOLVING_SPACE' && state.currentCard) {
      return { type: 'RESOLVE_CARD' };
    }

    // 4. Awaiting property purchase
    if (state.phase === 'AWAITING_PURCHASE') {
      const space = BoardEngine.getSpace(player.position);
      const shouldBuy = this.evaluatePropertyPurchase(state, player, space, difficulty, personality);
      if (shouldBuy) {
        return { type: 'BUY_PROPERTY' };
      } else {
        return { type: 'DECLINE_PURCHASE' };
      }
    }

    // 5. In Auction
    if (state.phase === 'AUCTION' && state.auction) {
      const currentBidderId = state.auction.activeBidderIds[state.auction.currentBidderIndex];
      if (currentBidderId === player.id) {
        const space = BoardEngine.getSpace(state.auction.propertyId);
        const maxBid = this.calculateMaxAuctionBid(state, player, space, difficulty, personality);
        const minNextBid = state.auction.currentBid + state.auction.minIncrement;

        if (minNextBid <= maxBid && minNextBid <= player.cash) {
          return { type: 'BID_AUCTION', amount: minNextBid };
        } else {
          return { type: 'PASS_AUCTION' };
        }
      }
      return null;
    }

    // 6. Awaiting End Turn: Build, mortgage, or end turn
    if (state.phase === 'AWAITING_END_TURN') {
      // If cash is negative (debt pending): mortgage properties
      if (player.cash < 0) {
        const mortgageAction = this.findPropertyToMortgage(state, player);
        if (mortgageAction) return mortgageAction;
        // Cannot raise cash -> declare bankruptcy
        return { type: 'DECLARE_BANKRUPTCY' };
      }

      // Check if bot can build houses/hotels
      const buildAction = this.evaluateBuildingUpgrades(state, player, difficulty, personality);
      if (buildAction) return buildAction;

      // Check if bot can lift mortgages
      const unmortgageAction = this.evaluateUnmortgages(state, player, difficulty);
      if (unmortgageAction) return unmortgageAction;

      return { type: 'END_TURN' };
    }

    return null;
  }

  /**
   * Decides whether to pay jail fine, use a card, or attempt rolling doubles.
   */
  private static decideJailEscape(
    state: GameState,
    player: Player,
    difficulty: BotDifficulty
  ): PlayerAction {
    // Late-game defense: if opponents own high-rent districts with houses, staying in jail is safe shelter!
    const opponentThreat = this.calculateOpponentThreatLevel(state, player.id);

    if (difficulty === 'HARD' && opponentThreat > 300 && player.jailTurns < 2) {
      // In Hard mode, stay in detention to avoid lethal rents
      return { type: 'ROLL_DICE' };
    }

    if (player.getOutOfJailCards > 0) {
      return { type: 'USE_JAIL_CARD' };
    }

    if (player.cash >= 250) {
      return { type: 'PAY_JAIL_FINE' };
    }

    return { type: 'ROLL_DICE' };
  }

  /**
   * Decides whether to buy an unowned property.
   */
  private static evaluatePropertyPurchase(
    state: GameState,
    player: Player,
    space: BoardSpace,
    difficulty: BotDifficulty,
    personality: BotPersonality
  ): boolean {
    const price = space.price || 0;
    if (player.cash < price) return false;

    // Minimum cash reserve depending on personality
    let reserve = 100;
    if (personality === 'CAUTIOUS') reserve = 250;
    if (personality === 'AGGRESSIVE') reserve = 30;

    // If purchase leaves player below reserve:
    if (player.cash - price < reserve && difficulty !== 'EASY') {
      // Exception: will completing a monopoly?
      if (space.district) {
        const districtIds = BoardEngine.getDistrictPropertyIds(space.district);
        const ownedCount = districtIds.filter((id) => state.properties[id]?.ownerId === player.id).length;
        if (ownedCount === districtIds.length - 1) {
          // Completes monopoly! Always buy!
          return true;
        }
      }
      return false;
    }

    // Easy AI buys almost anything if it has cash
    if (difficulty === 'EASY') {
      return player.cash >= price;
    }

    // Normal and Hard AI evaluate color monopoly completion & opponent blocking
    if (space.district) {
      const districtIds = BoardEngine.getDistrictPropertyIds(space.district);
      const ownedByPlayer = districtIds.filter((id) => state.properties[id]?.ownerId === player.id).length;

      // Completes own monopoly
      if (ownedByPlayer === districtIds.length - 1) return true;

      // Blocks opponent from monopoly
      for (const opponent of state.players) {
        if (opponent.id === player.id || opponent.isBankrupt) continue;
        const opponentCount = districtIds.filter((id) => state.properties[id]?.ownerId === opponent.id).length;
        if (opponentCount === districtIds.length - 1) {
          return true; // Denial buy
        }
      }
    }

    // Transit and utilities are strong early buys
    if (space.type === 'TRANSIT') return true;
    if (space.type === 'UTILITY' && player.cash > 300) return true;

    return true;
  }

  /**
   * Calculates maximum auction bid ceiling.
   */
  private static calculateMaxAuctionBid(
    state: GameState,
    player: Player,
    space: BoardSpace,
    difficulty: BotDifficulty,
    personality: BotPersonality
  ): number {
    const price = space.price || 100;
    let multiplier = 1.0;

    if (personality === 'AGGRESSIVE') multiplier = 1.25;
    if (personality === 'CAUTIOUS') multiplier = 0.85;

    if (space.district) {
      const districtIds = BoardEngine.getDistrictPropertyIds(space.district);
      const ownedCount = districtIds.filter((id) => state.properties[id]?.ownerId === player.id).length;
      if (ownedCount === districtIds.length - 1) {
        // Monopoly completion: worth bidding up to 1.6x face value
        multiplier = 1.6;
      }
    }

    const ceiling = Math.min(Math.floor(price * multiplier), player.cash - 40);
    return Math.max(0, ceiling);
  }

  /**
   * Checks for valid building upgrades (villas/citadels) adhering to even-building rule and cash reserves.
   */
  private static evaluateBuildingUpgrades(
    state: GameState,
    player: Player,
    difficulty: BotDifficulty,
    personality: BotPersonality
  ): PlayerAction | null {
    let minReserve = 150;
    if (personality === 'CAUTIOUS') minReserve = 300;
    if (personality === 'AGGRESSIVE') minReserve = 60;

    if (player.cash <= minReserve) return null;

    // Scan all properties owned by this player
    for (const [idStr, ownership] of Object.entries(state.properties)) {
      if (ownership.ownerId !== player.id || ownership.houses >= 5 || ownership.isMortgaged) continue;

      const propId = Number(idStr);
      const space = BoardEngine.getSpace(propId);
      if (!space.district) continue;

      const check = BoardEngine.canBuildHouse(
        propId,
        player.id,
        state.properties,
        player.cash - minReserve,
        state.bankHouses,
        state.bankHotels,
        state.settings.evenBuildRule
      );

      if (check.allowed) {
        return { type: 'BUILD_HOUSE', propertyId: propId };
      }
    }

    return null;
  }

  /**
   * Evaluates unmortgaging properties if plenty of cash is available.
   */
  private static evaluateUnmortgages(
    state: GameState,
    player: Player,
    difficulty: BotDifficulty
  ): PlayerAction | null {
    if (player.cash < 400) return null;

    for (const [idStr, ownership] of Object.entries(state.properties)) {
      if (ownership.ownerId !== player.id || !ownership.isMortgaged) continue;

      const propId = Number(idStr);
      const check = BoardEngine.canUnmortgage(
        propId,
        player.id,
        state.properties,
        player.cash - 200,
        state.settings.mortgageInterestRate
      );

      if (check.allowed) {
        return { type: 'UNMORTGAGE_PROPERTY', propertyId: propId };
      }
    }

    return null;
  }

  /**
   * Finds lowest-priority property to mortgage when in debt.
   */
  private static findPropertyToMortgage(state: GameState, player: Player): PlayerAction | null {
    // Priority: unmortgage un-grouped properties first, keep monopolies unencumbered
    const candidateIds: number[] = [];

    for (const [idStr, ownership] of Object.entries(state.properties)) {
      if (ownership.ownerId !== player.id || ownership.isMortgaged) continue;
      const propId = Number(idStr);
      const check = BoardEngine.canMortgage(propId, player.id, state.properties);
      if (check.allowed) {
        candidateIds.push(propId);
      }
    }

    if (candidateIds.length === 0) return null;

    // Prefer mortgaging utilities or single properties first
    candidateIds.sort((a, b) => {
      const spaceA = BoardEngine.getSpace(a);
      const spaceB = BoardEngine.getSpace(b);
      const monopolyA = spaceA.district ? BoardEngine.hasMonopoly(state.properties, spaceA.district, player.id) : false;
      const monopolyB = spaceB.district ? BoardEngine.hasMonopoly(state.properties, spaceB.district, player.id) : false;
      if (monopolyA && !monopolyB) return 1;
      if (!monopolyA && monopolyB) return -1;
      return (spaceA.price || 0) - (spaceB.price || 0);
    });

    return { type: 'MORTGAGE_PROPERTY', propertyId: candidateIds[0] };
  }

  /**
   * Calculates maximum rent hazard posed by opponents on the board.
   */
  private static calculateOpponentThreatLevel(state: GameState, playerId: string): number {
    let maxRent = 0;
    Object.entries(state.properties).forEach(([idStr, ownership]) => {
      if (ownership.ownerId !== playerId && !ownership.isMortgaged) {
        const propId = Number(idStr);
        const rent = BoardEngine.calculateRent(propId, state.properties, 7);
        if (rent > maxRent) {
          maxRent = rent;
        }
      }
    });
    return maxRent;
  }
}
