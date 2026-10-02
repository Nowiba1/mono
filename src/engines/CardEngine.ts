import { DESTINY_CARDS, VAULT_CARDS } from '../config/cards.data';
import { BoardEngine } from './BoardEngine';
import { DiceEngine } from './DiceEngine';
import { Card, CardDeckType, Player, PropertyOwnership } from './types';

export class CardEngine {
  static createDecks(seed: number): {
    vaultDeck: Card[];
    destinyDeck: Card[];
    nextSeed: number;
  } {
    const v = DiceEngine.shuffle(VAULT_CARDS, seed);
    const d = DiceEngine.shuffle(DESTINY_CARDS, v.nextSeed);
    return {
      vaultDeck: v.shuffled,
      destinyDeck: d.shuffled,
      nextSeed: d.nextSeed,
    };
  }

  static drawCard(
    deckType: CardDeckType,
    deck: Card[],
    seed: number
  ): {
    card: Card;
    remainingDeck: Card[];
    nextSeed: number;
  } {
    let currentDeck = [...deck];
    let nextSeed = seed;

    if (currentDeck.length === 0) {
      const source = deckType === 'VAULT' ? VAULT_CARDS : DESTINY_CARDS;
      const sh = DiceEngine.shuffle(source, seed);
      currentDeck = sh.shuffled;
      nextSeed = sh.nextSeed;
    }

    const card = currentDeck.shift()!;

    // If card is JAIL_FREE, it is held by player and NOT put at the bottom of the deck until played
    if (card.effect !== 'JAIL_FREE') {
      currentDeck.push(card);
    }

    return {
      card,
      remainingDeck: currentDeck,
      nextSeed,
    };
  }

  static returnJailCard(deckType: CardDeckType, deck: Card[]): Card[] {
    const cardId = deckType === 'VAULT' ? 'vault_5' : 'destiny_8';
    const source = deckType === 'VAULT' ? VAULT_CARDS : DESTINY_CARDS;
    const card = source.find((c) => c.id === cardId);
    if (!card) return deck;
    return [...deck, card];
  }

  static findNearestTransit(currentPosition: number): number {
    const transits = BoardEngine.getAllTransitIds(); // [5, 15, 25, 35]
    for (const t of transits) {
      if (t > currentPosition) return t;
    }
    return transits[0]; // wraps around to 5
  }

  static findNearestUtility(currentPosition: number): number {
    const utilities = BoardEngine.getAllUtilityIds(); // [12, 28]
    for (const u of utilities) {
      if (u > currentPosition) return u;
    }
    return utilities[0]; // wraps around to 12
  }

  /**
   * Calculates repair fees for all properties owned by the player.
   */
  static calculateRepairs(
    player: Player,
    properties: PropertyOwnership,
    houseFee: number,
    hotelFee: number
  ): number {
    let fee = 0;
    Object.values(properties).forEach((ownership) => {
      if (ownership.ownerId === player.id) {
        if (ownership.houses === 5) {
          fee += hotelFee;
        } else if (ownership.houses > 0) {
          fee += ownership.houses * houseFee;
        }
      }
    });
    return fee;
  }
}
