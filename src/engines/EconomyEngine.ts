import { BoardEngine } from './BoardEngine';
import { Player, PropertyOwnership } from './types';

export class EconomyEngine {
  /**
   * Adjusts player's cash balance.
   */
  static adjustCash(player: Player, delta: number): Player {
    return {
      ...player,
      cash: player.cash + delta,
    };
  }

  /**
   * Transfers cash between two players.
   */
  static transferCash(
    fromPlayer: Player,
    toPlayer: Player,
    amount: number
  ): { from: Player; to: Player } {
    return {
      from: { ...fromPlayer, cash: fromPlayer.cash - amount },
      to: { ...toPlayer, cash: toPlayer.cash + amount },
    };
  }

  /**
   * Calculates total net worth of a player:
   * Cash + Property purchase values + House investment values.
   */
  static calculateNetWorth(player: Player, properties: PropertyOwnership): number {
    let total = player.cash;

    Object.entries(properties).forEach(([spaceIdStr, ownership]) => {
      if (ownership.ownerId === player.id) {
        const spaceId = Number(spaceIdStr);
        const space = BoardEngine.getSpace(spaceId);

        if (ownership.isMortgaged) {
          total += space.mortgageValue || Math.floor((space.price || 0) / 2);
        } else {
          total += space.price || 0;
          if (ownership.houses > 0 && space.houseCost) {
            total += ownership.houses * space.houseCost;
          }
        }
      }
    });

    total += player.getOutOfJailCards * 50;
    return total;
  }

  /**
   * Calculates maximum possible liquidation value of a player right now:
   * Cash + 50% refund on all buildings + mortgage values of all unmortgaged properties.
   */
  static calculateLiquidationValue(player: Player, properties: PropertyOwnership): number {
    let value = player.cash;

    Object.entries(properties).forEach(([spaceIdStr, ownership]) => {
      if (ownership.ownerId === player.id) {
        const spaceId = Number(spaceIdStr);
        const space = BoardEngine.getSpace(spaceId);

        // Houses sold at 50%
        if (ownership.houses > 0 && space.houseCost) {
          value += ownership.houses * Math.floor(space.houseCost / 2);
        }

        // Unmortgaged property mortgage value
        if (!ownership.isMortgaged) {
          value += space.mortgageValue || Math.floor((space.price || 0) / 2);
        }
      }
    });

    value += player.getOutOfJailCards * 50;
    return value;
  }

  /**
   * Checks if player is unable to pay a specific amount even after total liquidation.
   */
  static isBankrupt(player: Player, properties: PropertyOwnership, amountDue: number): boolean {
    const maxLiquidation = this.calculateLiquidationValue(player, properties);
    return maxLiquidation < amountDue;
  }

  /**
   * Handles bankruptcy liquidation:
   * Transfers all assets to creditor or releases to the bank.
   */
  static liquidatePlayer(
    bankruptPlayer: Player,
    creditorPlayer: Player | null,
    properties: PropertyOwnership,
    bankHouses: number,
    bankHotels: number
  ): {
    updatedProperties: PropertyOwnership;
    updatedCreditor: Player | null;
    updatedBankHouses: number;
    updatedBankHotels: number;
  } {
    const updatedProperties: PropertyOwnership = { ...properties };
    let newBankHouses = bankHouses;
    let newBankHotels = bankHotels;

    let updatedCreditor = creditorPlayer ? { ...creditorPlayer } : null;

    Object.entries(properties).forEach(([spaceIdStr, ownership]) => {
      if (ownership.ownerId === bankruptPlayer.id) {
        const spaceId = Number(spaceIdStr);

        // If bankrupt to bank: dismantle all buildings and unmortgage/release
        if (!updatedCreditor) {
          if (ownership.houses === 5) {
            newBankHotels += 1;
          } else if (ownership.houses > 0) {
            newBankHouses += ownership.houses;
          }
          delete updatedProperties[spaceId];
        } else {
          // If bankrupt to player: transfer ownership
          // Any buildings remain or if bankrupt, classic rules say buildings were dismantled for debt
          if (ownership.houses === 5) {
            newBankHotels += 1;
          } else if (ownership.houses > 0) {
            newBankHouses += ownership.houses;
          }

          updatedProperties[spaceId] = {
            ownerId: updatedCreditor.id,
            houses: 0,
            isMortgaged: ownership.isMortgaged,
          };
        }
      }
    });

    if (updatedCreditor) {
      updatedCreditor.cash += Math.max(0, bankruptPlayer.cash);
      updatedCreditor.getOutOfJailCards += bankruptPlayer.getOutOfJailCards;
    }

    return {
      updatedProperties,
      updatedCreditor,
      updatedBankHouses: newBankHouses,
      updatedBankHotels: newBankHotels,
    };
  }
}
