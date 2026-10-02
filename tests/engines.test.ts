import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BoardEngine } from '../src/engines/BoardEngine';
import { DiceEngine } from '../src/engines/DiceEngine';
import { EconomyEngine } from '../src/engines/EconomyEngine';
import { AuctionEngine } from '../src/engines/AuctionEngine';
import { TradeEngine } from '../src/engines/TradeEngine';
import { RulesEngine } from '../src/engines/RulesEngine';
import { CardEngine } from '../src/engines/CardEngine';
import { Player, PropertyOwnership } from '../src/engines/types';

describe('Phase 1 & 2: Core Game Engines', () => {
  it('1. DiceEngine (Deterministic Seeded PRNG)', () => {
    const roll1 = DiceEngine.roll(12345);
    const roll2 = DiceEngine.roll(12345);
    assert.deepEqual(roll1.dice, roll2.dice, 'Same seed produces identical roll');
    assert.equal(roll1.sum, roll1.dice[0] + roll1.dice[1]);
    assert.ok(roll1.dice[0] >= 1 && roll1.dice[0] <= 6);
    assert.ok(roll1.dice[1] >= 1 && roll1.dice[1] <= 6);
  });

  it('2. BoardEngine (Board spaces, monopolies, rent & development)', () => {
    const space1 = BoardEngine.getSpace(1); // Alexandria Qaitbay Citadel (Nile Valley, sepia)
    assert.equal(space1.name, 'Alexandria Qaitbay Citadel');
    assert.equal(space1.price, 60);

    const properties: PropertyOwnership = {
      1: { ownerId: 'p1', houses: 0, isMortgaged: false },
      3: { ownerId: 'p1', houses: 0, isMortgaged: false },
    };

    // Monopoly check: Old Harbor has properties 1 and 3
    assert.equal(BoardEngine.hasMonopoly(properties, 'sepia', 'p1'), true);
    assert.equal(BoardEngine.hasMonopoly(properties, 'sepia', 'p2'), false);

    // Rent doubling on monopoly with 0 houses: base rent 2 * 2 = 4
    const rent = BoardEngine.calculateRent(1, properties, 7);
    assert.equal(rent, 4);

    // Can build house validation
    const buildCheck = BoardEngine.canBuildHouse(1, 'p1', properties, 500, 32, 12, true);
    assert.equal(buildCheck.allowed, true);
  });

  it('3. EconomyEngine & Bankruptcy', () => {
    const p1: Player = {
      id: 'p1',
      name: 'Player 1',
      characterId: 'thorne',
      color: '#3b82f6',
      cash: 100,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      isBot: false,
      emote: 'idle',
    };

    const properties: PropertyOwnership = {
      1: { ownerId: 'p1', houses: 0, isMortgaged: false }, // value 60, mortgage 30
    };

    const netWorth = EconomyEngine.calculateNetWorth(p1, properties);
    assert.equal(netWorth, 160);

    const maxLiquidation = EconomyEngine.calculateLiquidationValue(p1, properties);
    assert.equal(maxLiquidation, 130);

    assert.equal(EconomyEngine.isBankrupt(p1, properties, 200), true);
    assert.equal(EconomyEngine.isBankrupt(p1, properties, 120), false);
  });

  it('4. AuctionEngine', () => {
    const players: Player[] = [
      { id: 'p1', name: 'P1', characterId: 'thorne', color: '#1', cash: 500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
      { id: 'p2', name: 'P2', characterId: 'cloud', color: '#2', cash: 500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
    ];

    let auction = AuctionEngine.startAuction(1, players);
    assert.equal(auction.currentBid, 0);

    const bidRes = AuctionEngine.placeBid(auction, 'p1', 50, 500);
    assert.equal(bidRes.success, true);
    auction = bidRes.updatedAuction;
    assert.equal(auction.currentBid, 50);
    assert.equal(auction.highestBidderId, 'p1');

    const passRes = AuctionEngine.passBid(auction, 'p2');
    assert.equal(passRes.isAuctionOver, true);
    assert.equal(passRes.winnerId, 'p1');
    assert.equal(passRes.finalPrice, 50);
  });

  it('5. TradeEngine', () => {
    const players: Player[] = [
      { id: 'p1', name: 'P1', characterId: 'thorne', color: '#1', cash: 500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 1, isBankrupt: false, isBot: false, emote: 'idle' },
      { id: 'p2', name: 'P2', characterId: 'cloud', color: '#2', cash: 500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
    ];

    const properties: PropertyOwnership = {
      1: { ownerId: 'p1', houses: 0, isMortgaged: false },
      6: { ownerId: 'p2', houses: 0, isMortgaged: false },
    };

    const trade = {
      fromPlayerId: 'p1',
      toPlayerId: 'p2',
      offeredCash: 50,
      offeredPropertyIds: [1],
      offeredJailCards: 1,
      requestedCash: 100,
      requestedPropertyIds: [6],
      requestedJailCards: 0,
    };

    const validation = TradeEngine.validateTrade(trade, players, properties);
    assert.equal(validation.valid, true);

    const result = TradeEngine.executeTrade(trade, players, properties);
    assert.equal(result.updatedProperties[1].ownerId, 'p2');
    assert.equal(result.updatedProperties[6].ownerId, 'p1');
    assert.equal(result.updatedPlayers[0].cash, 550);
    assert.equal(result.updatedPlayers[1].cash, 450);
  });

  it('6. RulesEngine (Turn machine, movement, jail, GO salary)', () => {
    const players: Player[] = [
      { id: 'p1', name: 'P1', characterId: 'thorne', color: '#1', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
      { id: 'p2', name: 'P2', characterId: 'cloud', color: '#2', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
    ];

    const state = RulesEngine.createInitialState(players);
    assert.equal(state.phase, 'START_TURN');
    assert.equal(state.players[0].cash, 1500);

    const nextState = RulesEngine.reduce(state, { type: 'ROLL_DICE' });
    assert.notEqual(nextState.phase, 'START_TURN');
  });
});
