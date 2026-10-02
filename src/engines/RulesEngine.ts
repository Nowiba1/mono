import { DEFAULT_GAME_SETTINGS } from '../config/rules.config';
import { AuctionEngine } from './AuctionEngine';
import { BoardEngine } from './BoardEngine';
import { CardEngine } from './CardEngine';
import { DiceEngine } from './DiceEngine';
import { EconomyEngine } from './EconomyEngine';
import { gameEvents } from './EventBus';
import { TradeEngine } from './TradeEngine';
import {
  ActionLogItem,
  Card,
  GamePhase,
  GameSettings,
  GameState,
  Player,
  PlayerAction,
  PropertyOwnership,
} from './types';

export class RulesEngine {
  static createInitialState(
    players: Player[],
    settings: GameSettings = DEFAULT_GAME_SETTINGS,
    seed = 1337
  ): GameState {
    const { vaultDeck, destinyDeck, nextSeed } = CardEngine.createDecks(seed);

    return {
      id: `game_${Date.now()}`,
      players: players.map((p) => ({
        ...p,
        cash: settings.startingCash,
        position: 0,
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        isBankrupt: false,
        emote: 'idle',
      })),
      activePlayerIndex: 0,
      phase: 'START_TURN',
      dice: [1, 1],
      consecutiveDoubles: 0,
      extraTurn: false,
      properties: {},
      vaultDeck,
      destinyDeck,
      currentCard: null,
      auction: null,
      pendingTrade: null,
      freeParkingPool: 0,
      bankHouses: 32,
      bankHotels: 12,
      turnCount: 1,
      settings,
      logs: [
        {
          id: `log_${Date.now()}_0`,
          turn: 1,
          playerId: players[0]?.id || '',
          message: 'Empire City Municipal Session commenced.',
          type: 'MOVE',
          timestamp: Date.now(),
        },
      ],
      winnerId: null,
      rngSeed: nextSeed,
    };
  }

  static reduce(state: GameState, action: PlayerAction): GameState {
    if (state.phase === 'GAME_OVER' && action.type !== 'DECLARE_BANKRUPTCY') {
      return state;
    }

    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return state;

    switch (action.type) {
      case 'ROLL_DICE':
        return this.handleRollDice(state);

      case 'BUY_PROPERTY':
        return this.handleBuyProperty(state);

      case 'DECLINE_PURCHASE':
        return this.handleDeclinePurchase(state);

      case 'PAY_JAIL_FINE':
        return this.handlePayJailFine(state);

      case 'USE_JAIL_CARD':
        return this.handleUseJailCard(state);

      case 'BID_AUCTION':
        return this.handleBidAuction(state, action.amount);

      case 'PASS_AUCTION':
        return this.handlePassAuction(state);

      case 'BUILD_HOUSE':
        return this.handleBuildHouse(state, action.propertyId);

      case 'SELL_HOUSE':
        return this.handleSellHouse(state, action.propertyId);

      case 'MORTGAGE_PROPERTY':
        return this.handleMortgage(state, action.propertyId);

      case 'UNMORTGAGE_PROPERTY':
        return this.handleUnmortgage(state, action.propertyId);

      case 'PROPOSE_TRADE':
        return this.handleProposeTrade(state, action.trade);

      case 'ACCEPT_TRADE':
        return this.handleAcceptTrade(state);

      case 'REJECT_TRADE':
        return this.handleRejectTrade(state);

      case 'RESOLVE_CARD':
        return this.handleResolveCard(state);

      case 'END_TURN':
        return this.handleEndTurn(state);

      case 'DECLARE_BANKRUPTCY':
        return this.handleBankruptcy(state, activePlayer.id);

      default:
        return state;
    }
  }

  private static handleRollDice(state: GameState): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const { dice, sum, isDoubles, nextSeed } = DiceEngine.roll(state.rngSeed);

    gameEvents.emit('DICE_ROLLED', activePlayer.id, { dice, sum, isDoubles });

    let newState = {
      ...state,
      dice,
      rngSeed: nextSeed,
    };

    // If player is currently in jail
    if (activePlayer.inJail) {
      if (isDoubles) {
        // Rolled doubles in jail: get out free and move, but no extra turn
        const releasedPlayer: Player = {
          ...activePlayer,
          inJail: false,
          jailTurns: 0,
          emote: 'happy',
        };
        newState = this.updatePlayer(newState, releasedPlayer);
        gameEvents.emit('RELEASED_FROM_JAIL', activePlayer.id);
        newState = this.addLog(newState, `${activePlayer.name} rolled doubles (${dice[0]}, ${dice[1]}) and escaped City Detention!`, 'JAIL');
        return this.movePlayer(newState, sum);
      } else {
        const nextJailTurns = activePlayer.jailTurns + 1;
        if (nextJailTurns >= 3) {
          // Must pay fine and move
          const fine = state.settings.jailFine;
          const updatedPlayer: Player = {
            ...activePlayer,
            cash: activePlayer.cash - fine,
            inJail: false,
            jailTurns: 0,
            emote: 'sad',
          };
          newState = this.updatePlayer(newState, updatedPlayer);
          gameEvents.emit('RELEASED_FROM_JAIL', activePlayer.id);
          newState = this.addLog(newState, `${activePlayer.name} served 3 turns, paid $${fine} municipal fine, and was released.`, 'JAIL');
          return this.movePlayer(newState, sum);
        } else {
          // Remains in jail
          const updatedPlayer: Player = {
            ...activePlayer,
            jailTurns: nextJailTurns,
            emote: 'thinking',
          };
          newState = this.updatePlayer(newState, updatedPlayer);
          newState = this.addLog(newState, `${activePlayer.name} rolled ${dice[0]}+${dice[1]} without doubles and remains in detention.`, 'JAIL');
          return {
            ...newState,
            phase: 'AWAITING_END_TURN',
            extraTurn: false,
          };
        }
      }
    }

    // Normal movement outside jail
    let newConsecutiveDoubles = isDoubles ? state.consecutiveDoubles + 1 : 0;

    if (newConsecutiveDoubles === 3) {
      // 3 consecutive doubles -> Go to detention
      const detainedPlayer: Player = {
        ...activePlayer,
        position: 10,
        inJail: true,
        jailTurns: 0,
        emote: 'jailed',
      };
      newState = this.updatePlayer(newState, detainedPlayer);
      gameEvents.emit('SENT_TO_JAIL', activePlayer.id, { reason: 'SPEEDING' });
      newState = this.addLog(newState, `${activePlayer.name} rolled 3 consecutive doubles and was arrested for reckless speeding!`, 'JAIL');
      return {
        ...newState,
        phase: 'AWAITING_END_TURN',
        consecutiveDoubles: 0,
        extraTurn: false,
      };
    }

    newState = {
      ...newState,
      consecutiveDoubles: newConsecutiveDoubles,
      extraTurn: isDoubles,
    };

    newState = this.addLog(newState, `${activePlayer.name} rolled ${dice[0]} and ${dice[1]} (total ${sum}).`, 'ROLL');
    return this.movePlayer(newState, sum);
  }

  private static movePlayer(state: GameState, steps: number): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    let newPosition = (activePlayer.position + steps) % 40;
    if (newPosition < 0) newPosition += 40;

    const passedGo = steps > 0 && newPosition < activePlayer.position;
    const landedOnGo = newPosition === 0;

    let updatedPlayer = { ...activePlayer, position: newPosition };
    let newState = { ...state };

    // Collect GO salary
    if (passedGo || landedOnGo) {
      let stipend = state.settings.goSalary;
      if (landedOnGo && state.settings.doubleGoLanding) {
        stipend *= 2;
      }
      updatedPlayer.cash += stipend;
      gameEvents.emit('GO_COLLECTED', activePlayer.id, { stipend });
      newState = this.addLog(newState, `${activePlayer.name} passed City Gate and received $${stipend} municipal stipend.`, 'MOVE');
    }

    newState = this.updatePlayer(newState, updatedPlayer);
    gameEvents.emit('TOKEN_MOVED', activePlayer.id, { position: newPosition });

    return this.resolveSpace(newState, newPosition);
  }

  private static resolveSpace(state: GameState, spaceId: number): GameState {
    const space = BoardEngine.getSpace(spaceId);
    const activePlayer = state.players[state.activePlayerIndex];
    const ownership = state.properties[spaceId];

    // 1. PROPERTY, TRANSIT, UTILITY
    if (space.type === 'PROPERTY' || space.type === 'TRANSIT' || space.type === 'UTILITY') {
      if (!ownership) {
        // Unowned property
        if (activePlayer.cash >= (space.price || 0)) {
          return {
            ...state,
            phase: 'AWAITING_PURCHASE',
          };
        } else {
          // Cannot afford direct buy; offer auction or decline
          if (state.settings.auctionEnabled) {
            return this.startAuction(state, spaceId);
          } else {
            return { ...state, phase: 'AWAITING_END_TURN' };
          }
        }
      } else if (ownership.ownerId !== activePlayer.id && !ownership.isMortgaged) {
        // Pay rent
        const diceSum = state.dice[0] + state.dice[1];
        const rentDue = BoardEngine.calculateRent(spaceId, state.properties, diceSum);
        const owner = state.players.find((p) => p.id === ownership.ownerId);

        if (rentDue > 0 && owner) {
          return this.processRentPayment(state, activePlayer, owner, rentDue, space.name);
        }
      }
      return { ...state, phase: 'AWAITING_END_TURN' };
    }

    // 2. TAX
    if (space.type === 'TAX') {
      const taxAmount = space.taxAmount || 100;
      let pool = state.freeParkingPool;
      if (state.settings.freeParkingJackpot) {
        pool += taxAmount;
      }

      if (activePlayer.cash >= taxAmount) {
        const updated = {
          ...activePlayer,
          cash: activePlayer.cash - taxAmount,
          emote: 'sad' as const,
        };
        let s = this.updatePlayer(state, updated);
        s = this.addLog(s, `${activePlayer.name} paid $${taxAmount} in ${space.name}.`, 'PAY_RENT');
        return { ...s, freeParkingPool: pool, phase: 'AWAITING_END_TURN' };
      } else {
        // Under debt to bank
        if (EconomyEngine.isBankrupt(activePlayer, state.properties, taxAmount)) {
          return this.handleBankruptcy(state, activePlayer.id);
        } else {
          return { ...state, freeParkingPool: pool, phase: 'AWAITING_END_TURN' };
        }
      }
    }

    // 3. FREE_PARKING
    if (space.type === 'FREE_PARKING') {
      if (state.settings.freeParkingJackpot && state.freeParkingPool > 0) {
        const pool = state.freeParkingPool;
        const updated = {
          ...activePlayer,
          cash: activePlayer.cash + pool,
          emote: 'happy' as const,
        };
        let s = this.updatePlayer(state, updated);
        s = this.addLog(s, `${activePlayer.name} rested at Free Haven and won the municipal jackpot of $${pool}!`, 'MOVE');
        return { ...s, freeParkingPool: 0, phase: 'AWAITING_END_TURN' };
      }
      return { ...state, phase: 'AWAITING_END_TURN' };
    }

    // 4. GO_TO_JAIL
    if (space.type === 'GO_TO_JAIL') {
      const detainedPlayer: Player = {
        ...activePlayer,
        position: 10,
        inJail: true,
        jailTurns: 0,
        emote: 'jailed',
      };
      let s = this.updatePlayer(state, detainedPlayer);
      gameEvents.emit('SENT_TO_JAIL', activePlayer.id, { reason: 'ORDER' });
      s = this.addLog(s, `${activePlayer.name} landed on Detain Order and was marched to City Detention.`, 'JAIL');
      return {
        ...s,
        phase: 'AWAITING_END_TURN',
        consecutiveDoubles: 0,
        extraTurn: false,
      };
    }

    // 5. VAULT CHEST & DESTINY BEACON
    if (space.type === 'VAULT' || space.type === 'DESTINY') {
      const isVault = space.type === 'VAULT';
      const deck = isVault ? state.vaultDeck : state.destinyDeck;
      const { card, remainingDeck, nextSeed } = CardEngine.drawCard(
        isVault ? 'VAULT' : 'DESTINY',
        deck,
        state.rngSeed
      );

      gameEvents.emit('CARD_DRAWN', activePlayer.id, { card });
      let s = this.addLog(state, `${activePlayer.name} drew a ${space.name} card: "${card.title}".`, 'CARD');

      return {
        ...s,
        currentCard: card,
        vaultDeck: isVault ? remainingDeck : s.vaultDeck,
        destinyDeck: isVault ? s.destinyDeck : remainingDeck,
        rngSeed: nextSeed,
        phase: 'RESOLVING_SPACE',
      };
    }

    return { ...state, phase: 'AWAITING_END_TURN' };
  }

  private static handleResolveCard(state: GameState): GameState {
    const card = state.currentCard;
    if (!card) return { ...state, phase: 'AWAITING_END_TURN' };

    const activePlayer = state.players[state.activePlayerIndex];
    let newState: GameState = { ...state, currentCard: null };

    switch (card.effect) {
      case 'MOVE_TO': {
        const targetId = card.targetSpaceId ?? 0;
        const steps = (targetId - activePlayer.position + 40) % 40;
        return this.movePlayer(newState, steps);
      }

      case 'MOVE_RELATIVE': {
        const steps = card.value ?? 0;
        return this.movePlayer(newState, steps);
      }

      case 'MOVE_NEAREST_TRANSIT': {
        const targetTransit = CardEngine.findNearestTransit(activePlayer.position);
        const steps = (targetTransit - activePlayer.position + 40) % 40;
        return this.movePlayer(newState, steps);
      }

      case 'MOVE_NEAREST_UTILITY': {
        const targetUtility = CardEngine.findNearestUtility(activePlayer.position);
        const steps = (targetUtility - activePlayer.position + 40) % 40;
        return this.movePlayer(newState, steps);
      }

      case 'PAY_BANK': {
        const val = card.value ?? 0;
        const updated = { ...activePlayer, cash: activePlayer.cash - val };
        newState = this.updatePlayer(newState, updated);
        newState = this.addLog(newState, `${activePlayer.name} paid $${val} to the Bank.`, 'PAY_RENT');
        break;
      }

      case 'COLLECT_BANK': {
        const val = card.value ?? 0;
        const updated = { ...activePlayer, cash: activePlayer.cash + val, emote: 'happy' as const };
        newState = this.updatePlayer(newState, updated);
        newState = this.addLog(newState, `${activePlayer.name} collected $${val} from the Bank.`, 'MOVE');
        break;
      }

      case 'PAY_PLAYERS': {
        const fee = card.value ?? 50;
        const otherPlayers = newState.players.filter((p) => p.id !== activePlayer.id && !p.isBankrupt);
        const total = fee * otherPlayers.length;

        const updatedActive = { ...activePlayer, cash: activePlayer.cash - total };
        newState = this.updatePlayer(newState, updatedActive);

        newState = {
          ...newState,
          players: newState.players.map((p) =>
            p.id !== activePlayer.id && !p.isBankrupt ? { ...p, cash: p.cash + fee } : p
          ),
        };
        newState = this.addLog(newState, `${activePlayer.name} paid $${fee} to each developer.`, 'PAY_RENT');
        break;
      }

      case 'COLLECT_PLAYERS': {
        const fee = card.value ?? 10;
        const otherPlayers = newState.players.filter((p) => p.id !== activePlayer.id && !p.isBankrupt);
        const total = fee * otherPlayers.length;

        const updatedActive = { ...activePlayer, cash: activePlayer.cash + total, emote: 'happy' as const };
        newState = this.updatePlayer(newState, updatedActive);

        newState = {
          ...newState,
          players: newState.players.map((p) =>
            p.id !== activePlayer.id && !p.isBankrupt ? { ...p, cash: p.cash - fee } : p
          ),
        };
        newState = this.addLog(newState, `${activePlayer.name} collected $${fee} from each developer.`, 'MOVE');
        break;
      }

      case 'REPAIRS': {
        const houseFee = card.houseFee ?? 25;
        const hotelFee = card.hotelFee ?? 100;
        const fee = CardEngine.calculateRepairs(activePlayer, newState.properties, houseFee, hotelFee);
        const updated = { ...activePlayer, cash: activePlayer.cash - fee };
        newState = this.updatePlayer(newState, updated);
        newState = this.addLog(newState, `${activePlayer.name} assessed $${fee} for civic renovations.`, 'PAY_RENT');
        break;
      }

      case 'JAIL_FREE': {
        const updated = {
          ...activePlayer,
          getOutOfJailCards: activePlayer.getOutOfJailCards + 1,
          emote: 'happy' as const,
        };
        newState = this.updatePlayer(newState, updated);
        newState = this.addLog(newState, `${activePlayer.name} acquired a municipal Pardon Pass!`, 'CARD');
        break;
      }

      case 'GO_TO_JAIL': {
        const detainedPlayer: Player = {
          ...activePlayer,
          position: 10,
          inJail: true,
          jailTurns: 0,
          emote: 'jailed',
        };
        newState = this.updatePlayer(newState, detainedPlayer);
        gameEvents.emit('SENT_TO_JAIL', activePlayer.id, { reason: 'CARD' });
        newState = this.addLog(newState, `${activePlayer.name} was detained by municipal decree.`, 'JAIL');
        return {
          ...newState,
          phase: 'AWAITING_END_TURN',
          consecutiveDoubles: 0,
          extraTurn: false,
        };
      }
    }

    return { ...newState, phase: 'AWAITING_END_TURN' };
  }

  private static processRentPayment(
    state: GameState,
    renter: Player,
    landlord: Player,
    amount: number,
    propertyName: string
  ): GameState {
    if (renter.cash >= amount) {
      const { from, to } = EconomyEngine.transferCash(renter, landlord, amount);
      let s = this.updatePlayer(state, { ...from, emote: 'sad' });
      s = this.updatePlayer(s, { ...to, emote: 'happy' });
      gameEvents.emit('RENT_PAID', renter.id, { landlordId: landlord.id, amount, propertyName });
      s = this.addLog(s, `${renter.name} paid $${amount} rent to ${landlord.name} at ${propertyName}.`, 'PAY_RENT');
      return { ...s, phase: 'AWAITING_END_TURN' };
    } else {
      // Check if insolvent
      if (EconomyEngine.isBankrupt(renter, state.properties, amount)) {
        return this.handleBankruptcy(state, renter.id, landlord.id);
      } else {
        // Can liquidate buildings/mortgages to pay
        const partialCash = renter.cash;
        const { from, to } = EconomyEngine.transferCash(renter, landlord, partialCash);
        let s = this.updatePlayer(state, { ...from, emote: 'sad' });
        s = this.updatePlayer(s, { ...to, emote: 'happy' });
        s = this.addLog(s, `${renter.name} owes $${amount - partialCash} remaining rent to ${landlord.name}.`, 'PAY_RENT');
        return { ...s, phase: 'AWAITING_END_TURN' };
      }
    }
  }

  private static handleBuyProperty(state: GameState): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const space = BoardEngine.getSpace(activePlayer.position);
    const price = space.price || 0;

    if (activePlayer.cash < price) return state;

    const updatedPlayer: Player = {
      ...activePlayer,
      cash: activePlayer.cash - price,
      emote: 'happy',
    };

    const updatedProperties: PropertyOwnership = {
      ...state.properties,
      [space.id]: {
        ownerId: activePlayer.id,
        houses: 0,
        isMortgaged: false,
      },
    };

    let s = this.updatePlayer(state, updatedPlayer);
    s = { ...s, properties: updatedProperties, phase: 'AWAITING_END_TURN' };
    gameEvents.emit('PROPERTY_BOUGHT', activePlayer.id, { propertyId: space.id, price });
    s = this.addLog(s, `${activePlayer.name} acquired ${space.name} for $${price}.`, 'BUY');
    return s;
  }

  private static handleDeclinePurchase(state: GameState): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const space = BoardEngine.getSpace(activePlayer.position);

    if (state.settings.auctionEnabled) {
      let s = this.addLog(state, `${activePlayer.name} declined to buy ${space.name}. Sending to municipal auction!`, 'AUCTION');
      return this.startAuction(s, space.id);
    }

    return { ...state, phase: 'AWAITING_END_TURN' };
  }

  private static startAuction(state: GameState, propertyId: number): GameState {
    const auction = AuctionEngine.startAuction(propertyId, state.players);
    gameEvents.emit('AUCTION_STARTED', undefined, { propertyId });
    return {
      ...state,
      auction,
      phase: 'AUCTION',
    };
  }

  private static handleBidAuction(state: GameState, amount: number): GameState {
    if (!state.auction) return state;
    const currentBidderId = state.auction.activeBidderIds[state.auction.currentBidderIndex];
    const bidder = state.players.find((p) => p.id === currentBidderId);
    if (!bidder) return state;

    const { updatedAuction, success, reason } = AuctionEngine.placeBid(
      state.auction,
      currentBidderId,
      amount,
      bidder.cash
    );

    if (!success) return state;

    gameEvents.emit('AUCTION_BID', currentBidderId, { amount });
    let s = this.addLog(state, `${bidder.name} bid $${amount} for ${BoardEngine.getSpace(state.auction.propertyId).name}.`, 'AUCTION');
    return {
      ...s,
      auction: updatedAuction,
    };
  }

  private static handlePassAuction(state: GameState): GameState {
    if (!state.auction) return state;
    const currentBidderId = state.auction.activeBidderIds[state.auction.currentBidderIndex];
    const bidder = state.players.find((p) => p.id === currentBidderId);

    const { updatedAuction, isAuctionOver, winnerId, finalPrice } = AuctionEngine.passBid(
      state.auction,
      currentBidderId
    );

    let s = this.addLog(state, `${bidder ? bidder.name : 'Bidder'} passed on auction.`, 'AUCTION');

    if (isAuctionOver) {
      if (winnerId && finalPrice > 0) {
        const winner = s.players.find((p) => p.id === winnerId);
        if (winner) {
          const updatedWinner = {
            ...winner,
            cash: winner.cash - finalPrice,
            emote: 'happy' as const,
          };
          s = this.updatePlayer(s, updatedWinner);
          s = {
            ...s,
            properties: {
              ...s.properties,
              [state.auction.propertyId]: {
                ownerId: winnerId,
                houses: 0,
                isMortgaged: false,
              },
            },
          };
          gameEvents.emit('AUCTION_ENDED', winnerId, { propertyId: state.auction.propertyId, finalPrice });
          s = this.addLog(s, `${winner.name} won the auction for ${BoardEngine.getSpace(state.auction.propertyId).name} for $${finalPrice}!`, 'AUCTION');
        }
      } else {
        s = this.addLog(s, `Auction for ${BoardEngine.getSpace(state.auction.propertyId).name} concluded with no winning bids.`, 'AUCTION');
      }

      return {
        ...s,
        auction: null,
        phase: 'AWAITING_END_TURN',
      };
    }

    return {
      ...s,
      auction: updatedAuction,
    };
  }

  private static handleBuildHouse(state: GameState, propertyId: number): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const check = BoardEngine.canBuildHouse(
      propertyId,
      activePlayer.id,
      state.properties,
      activePlayer.cash,
      state.bankHouses,
      state.bankHotels,
      state.settings.evenBuildRule
    );

    if (!check.allowed) return state;

    const space = BoardEngine.getSpace(propertyId);
    const houseCost = space.houseCost || 100;
    const currentHouses = state.properties[propertyId]?.houses || 0;
    const isHotelUpgrade = currentHouses === 4;

    const updatedPlayer = {
      ...activePlayer,
      cash: activePlayer.cash - houseCost,
      emote: 'happy' as const,
    };

    const updatedProperties = {
      ...state.properties,
      [propertyId]: {
        ...state.properties[propertyId],
        houses: currentHouses + 1,
      },
    };

    let s = this.updatePlayer(state, updatedPlayer);
    s = {
      ...s,
      properties: updatedProperties,
      bankHouses: isHotelUpgrade ? s.bankHouses + 4 : s.bankHouses - 1,
      bankHotels: isHotelUpgrade ? s.bankHotels - 1 : s.bankHotels,
    };

    gameEvents.emit('HOUSE_BUILT', activePlayer.id, { propertyId, isHotel: isHotelUpgrade });
    s = this.addLog(s, `${activePlayer.name} constructed a ${isHotelUpgrade ? 'Grand Citadel' : 'Eco-Villa'} on ${space.name} for $${houseCost}.`, 'BUILD');
    return s;
  }

  private static handleSellHouse(state: GameState, propertyId: number): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const check = BoardEngine.canSellHouse(
      propertyId,
      activePlayer.id,
      state.properties,
      state.settings.evenBuildRule
    );

    if (!check.allowed) return state;

    const space = BoardEngine.getSpace(propertyId);
    const refund = Math.floor((space.houseCost || 100) / 2);
    const currentHouses = state.properties[propertyId]?.houses || 0;
    const isHotelDowngrade = currentHouses === 5;

    const updatedPlayer = {
      ...activePlayer,
      cash: activePlayer.cash + refund,
    };

    const updatedProperties = {
      ...state.properties,
      [propertyId]: {
        ...state.properties[propertyId],
        houses: currentHouses - 1,
      },
    };

    let s = this.updatePlayer(state, updatedPlayer);
    s = {
      ...s,
      properties: updatedProperties,
      bankHouses: isHotelDowngrade ? s.bankHouses - 4 : s.bankHouses + 1,
      bankHotels: isHotelDowngrade ? s.bankHotels + 1 : s.bankHotels,
    };

    gameEvents.emit('HOUSE_SOLD', activePlayer.id, { propertyId });
    s = this.addLog(s, `${activePlayer.name} dismantled a building on ${space.name} and received $${refund}.`, 'BUILD');
    return s;
  }

  private static handleMortgage(state: GameState, propertyId: number): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const check = BoardEngine.canMortgage(propertyId, activePlayer.id, state.properties);
    if (!check.allowed) return state;

    const space = BoardEngine.getSpace(propertyId);
    const mortgageValue = space.mortgageValue || Math.floor((space.price || 0) / 2);

    const updatedPlayer = {
      ...activePlayer,
      cash: activePlayer.cash + mortgageValue,
    };

    const updatedProperties = {
      ...state.properties,
      [propertyId]: {
        ...state.properties[propertyId],
        isMortgaged: true,
      },
    };

    let s = this.updatePlayer(state, updatedPlayer);
    s = { ...s, properties: updatedProperties };
    gameEvents.emit('PROPERTY_MORTGAGED', activePlayer.id, { propertyId, value: mortgageValue });
    s = this.addLog(s, `${activePlayer.name} mortgaged ${space.name} to the Bank for $${mortgageValue}.`, 'MORTGAGE');
    return s;
  }

  private static handleUnmortgage(state: GameState, propertyId: number): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const check = BoardEngine.canUnmortgage(
      propertyId,
      activePlayer.id,
      state.properties,
      activePlayer.cash,
      state.settings.mortgageInterestRate
    );
    if (!check.allowed) return state;

    const space = BoardEngine.getSpace(propertyId);
    const cost = check.cost;

    const updatedPlayer = {
      ...activePlayer,
      cash: activePlayer.cash - cost,
    };

    const updatedProperties = {
      ...state.properties,
      [propertyId]: {
        ...state.properties[propertyId],
        isMortgaged: false,
      },
    };

    let s = this.updatePlayer(state, updatedPlayer);
    s = { ...s, properties: updatedProperties };
    gameEvents.emit('PROPERTY_UNMORTGAGED', activePlayer.id, { propertyId, cost });
    s = this.addLog(s, `${activePlayer.name} lifted mortgage on ${space.name} for $${cost}.`, 'MORTGAGE');
    return s;
  }

  private static handlePayJailFine(state: GameState): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const fine = state.settings.jailFine;
    if (!activePlayer.inJail || activePlayer.cash < fine) return state;

    const updatedPlayer: Player = {
      ...activePlayer,
      cash: activePlayer.cash - fine,
      inJail: false,
      jailTurns: 0,
      emote: 'happy',
    };

    let s = this.updatePlayer(state, updatedPlayer);
    gameEvents.emit('RELEASED_FROM_JAIL', activePlayer.id);
    s = this.addLog(s, `${activePlayer.name} posted $${fine} bail and was released from City Detention.`, 'JAIL');
    return s;
  }

  private static handleUseJailCard(state: GameState): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer.inJail || activePlayer.getOutOfJailCards <= 0) return state;

    const updatedPlayer: Player = {
      ...activePlayer,
      getOutOfJailCards: activePlayer.getOutOfJailCards - 1,
      inJail: false,
      jailTurns: 0,
      emote: 'happy',
    };

    let s = this.updatePlayer(state, updatedPlayer);
    gameEvents.emit('RELEASED_FROM_JAIL', activePlayer.id);
    s = this.addLog(s, `${activePlayer.name} used a municipal Pardon Pass to exit City Detention.`, 'JAIL');
    return s;
  }

  private static handleProposeTrade(state: GameState, trade: typeof state.pendingTrade): GameState {
    if (!trade) return state;
    const check = TradeEngine.validateTrade(trade, state.players, state.properties);
    if (!check.valid) return state;

    gameEvents.emit('TRADE_PROPOSED', trade.fromPlayerId, trade);
    let s = this.addLog(state, `Trade proposal dispatched between ${trade.fromPlayerId} and ${trade.toPlayerId}.`, 'TRADE');
    return { ...s, pendingTrade: trade };
  }

  private static handleAcceptTrade(state: GameState): GameState {
    if (!state.pendingTrade) return state;
    const trade = state.pendingTrade;
    const check = TradeEngine.validateTrade(trade, state.players, state.properties);
    if (!check.valid) return { ...state, pendingTrade: null };

    const { updatedPlayers, updatedProperties } = TradeEngine.executeTrade(
      trade,
      state.players,
      state.properties
    );

    gameEvents.emit('TRADE_RESOLVED', trade.toPlayerId, { trade, accepted: true });
    let s = this.addLog(state, `Asset trade contract successfully ratified and signed.`, 'TRADE');
    return {
      ...s,
      players: updatedPlayers,
      properties: updatedProperties,
      pendingTrade: null,
    };
  }

  private static handleRejectTrade(state: GameState): GameState {
    if (!state.pendingTrade) return state;
    gameEvents.emit('TRADE_RESOLVED', state.pendingTrade.toPlayerId, { trade: state.pendingTrade, accepted: false });
    let s = this.addLog(state, `Trade proposal was declined.`, 'TRADE');
    return { ...s, pendingTrade: null };
  }

  private static handleBankruptcy(
    state: GameState,
    bankruptPlayerId: string,
    creditorPlayerId?: string
  ): GameState {
    const bankruptPlayer = state.players.find((p) => p.id === bankruptPlayerId);
    if (!bankruptPlayer || bankruptPlayer.isBankrupt) return state;

    const creditor = creditorPlayerId
      ? state.players.find((p) => p.id === creditorPlayerId) || null
      : null;

    const {
      updatedProperties,
      updatedCreditor,
      updatedBankHouses,
      updatedBankHotels,
    } = EconomyEngine.liquidatePlayer(
      bankruptPlayer,
      creditor,
      state.properties,
      state.bankHouses,
      state.bankHotels
    );

    const updatedPlayers = state.players.map((p) => {
      if (p.id === bankruptPlayerId) {
        return {
          ...p,
          cash: 0,
          isBankrupt: true,
          emote: 'bankrupt' as const,
        };
      }
      if (updatedCreditor && p.id === updatedCreditor.id) {
        return updatedCreditor;
      }
      return p;
    });

    let s = {
      ...state,
      players: updatedPlayers,
      properties: updatedProperties,
      bankHouses: updatedBankHouses,
      bankHotels: updatedBankHotels,
      phase: 'AWAITING_END_TURN' as GamePhase,
    };

    gameEvents.emit('BANKRUPTCY', bankruptPlayerId, { creditorId: creditorPlayerId });
    s = this.addLog(s, `${bankruptPlayer.name} declared total municipal bankruptcy and has been eliminated.`, 'BANKRUPTCY');

    // Check victory condition: only 1 non-bankrupt player remains
    const solventPlayers = updatedPlayers.filter((p) => !p.isBankrupt);
    if (solventPlayers.length === 1) {
      const winner = solventPlayers[0];
      const winPlayer: Player = { ...winner, emote: 'winner' };
      s = this.updatePlayer(s, winPlayer);
      s = {
        ...s,
        winnerId: winner.id,
        phase: 'GAME_OVER',
      };
      gameEvents.emit('VICTORY', winner.id);
      s = this.addLog(s, `🏆 ${winner.name} has triumphed as Grand Sovereign Chancellor of Empire City!`, 'BANKRUPTCY');
    }

    return s;
  }

  private static handleEndTurn(state: GameState): GameState {
    const activePlayer = state.players[state.activePlayerIndex];

    // If active player had rolled doubles and is not in jail and not bankrupt -> extra turn!
    if (state.extraTurn && !activePlayer.inJail && !activePlayer.isBankrupt) {
      return {
        ...state,
        phase: 'START_TURN',
        extraTurn: false,
      };
    }

    // Advance to next non-bankrupt player
    let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
    let attempts = 0;
    while (state.players[nextIndex].isBankrupt && attempts < state.players.length) {
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
    }

    const nextPlayer = state.players[nextIndex];

    return {
      ...state,
      activePlayerIndex: nextIndex,
      phase: 'START_TURN',
      consecutiveDoubles: 0,
      extraTurn: false,
      turnCount: state.turnCount + 1,
      players: state.players.map((p) => ({
        ...p,
        emote: p.isBankrupt ? 'bankrupt' : p.inJail ? 'jailed' : 'idle',
      })),
    };
  }

  private static updatePlayer(state: GameState, player: Player): GameState {
    return {
      ...state,
      players: state.players.map((p) => (p.id === player.id ? player : p)),
    };
  }

  private static addLog(
    state: GameState,
    message: string,
    type: ActionLogItem['type']
  ): GameState {
    const activePlayer = state.players[state.activePlayerIndex];
    const logItem: ActionLogItem = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      turn: state.turnCount,
      playerId: activePlayer ? activePlayer.id : '',
      message,
      type,
      timestamp: Date.now(),
    };
    return {
      ...state,
      logs: [logItem, ...state.logs.slice(0, 49)], // Keep last 50 logs
    };
  }
}
