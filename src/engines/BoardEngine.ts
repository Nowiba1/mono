import { BOARD_SPACES } from '../config/board.data';
import { BoardSpace, DistrictColor, PropertyOwnership } from './types';

export class BoardEngine {
  private static spaceMap: Map<number, BoardSpace> = new Map(
    BOARD_SPACES.map((space) => [space.id, space])
  );

  private static districtMap: Map<DistrictColor, number[]> = new Map();

  static {
    BOARD_SPACES.forEach((space) => {
      if (space.type === 'PROPERTY' && space.district) {
        if (!this.districtMap.has(space.district)) {
          this.districtMap.set(space.district, []);
        }
        this.districtMap.get(space.district)!.push(space.id);
      }
    });
  }

  static getSpace(id: number): BoardSpace {
    const space = this.spaceMap.get(id);
    if (!space) {
      throw new Error(`Space with id ${id} not found`);
    }
    return space;
  }

  static getAllSpaces(): BoardSpace[] {
    return BOARD_SPACES;
  }

  static getDistrictPropertyIds(district: DistrictColor): number[] {
    return this.districtMap.get(district) || [];
  }

  static getAllTransitIds(): number[] {
    return [5, 15, 25, 35];
  }

  static getAllUtilityIds(): number[] {
    return [12, 28];
  }

  /**
   * Checks if player owns all properties in the district.
   */
  static hasMonopoly(properties: PropertyOwnership, district: DistrictColor, playerId: string): boolean {
    const districtIds = this.getDistrictPropertyIds(district);
    if (districtIds.length === 0) return false;
    return districtIds.every((id) => properties[id]?.ownerId === playerId);
  }

  /**
   * Counts how many transit hubs a player owns.
   */
  static countTransitOwned(properties: PropertyOwnership, playerId: string): number {
    return this.getAllTransitIds().filter((id) => properties[id]?.ownerId === playerId).length;
  }

  /**
   * Counts how many public utilities a player owns.
   */
  static countUtilitiesOwned(properties: PropertyOwnership, playerId: string): number {
    return this.getAllUtilityIds().filter((id) => properties[id]?.ownerId === playerId).length;
  }

  /**
   * Calculates rent for a given space when landed on by a player.
   */
  static calculateRent(
    spaceId: number,
    properties: PropertyOwnership,
    diceRollSum: number,
    multiplier = 1
  ): number {
    const space = this.getSpace(spaceId);
    const ownership = properties[spaceId];
    if (!ownership) return 0;
    if (ownership.isMortgaged) return 0;

    const ownerId = ownership.ownerId;

    if (space.type === 'PROPERTY') {
      const houses = ownership.houses;
      if (houses > 0 && space.rent && space.rent[houses] !== undefined) {
        return space.rent[houses] * multiplier;
      }
      // 0 houses: check if owner has full monopoly
      const baseRent = space.rent ? space.rent[0] : 0;
      if (space.district && this.hasMonopoly(properties, space.district, ownerId)) {
        return baseRent * 2 * multiplier;
      }
      return baseRent * multiplier;
    }

    if (space.type === 'TRANSIT') {
      const owned = this.countTransitOwned(properties, ownerId);
      const transitRents = [0, 25, 50, 100, 200];
      const base = transitRents[Math.min(owned, 4)];
      return base * multiplier;
    }

    if (space.type === 'UTILITY') {
      const owned = this.countUtilitiesOwned(properties, ownerId);
      const rate = owned >= 2 ? 10 : 4;
      return diceRollSum * rate * multiplier;
    }

    return 0;
  }

  /**
   * Validates if a player can build a house/hotel on a property.
   */
  static canBuildHouse(
    propertyId: number,
    playerId: string,
    properties: PropertyOwnership,
    playerCash: number,
    bankHouses: number,
    bankHotels: number,
    evenBuildRule = true
  ): { allowed: boolean; reason?: string } {
    const space = this.getSpace(propertyId);
    if (space.type !== 'PROPERTY' || !space.district) {
      return { allowed: false, reason: 'Not a developable district property' };
    }

    const ownership = properties[propertyId];
    if (!ownership || ownership.ownerId !== playerId) {
      return { allowed: false, reason: 'You do not own this property' };
    }

    if (ownership.isMortgaged) {
      return { allowed: false, reason: 'Property is mortgaged' };
    }

    if (!this.hasMonopoly(properties, space.district, playerId)) {
      return { allowed: false, reason: 'You must own all properties in the district to build' };
    }

    const districtIds = this.getDistrictPropertyIds(space.district);
    const anyMortgaged = districtIds.some((id) => properties[id]?.isMortgaged);
    if (anyMortgaged) {
      return { allowed: false, reason: 'Cannot build while any property in the district is mortgaged' };
    }

    if (ownership.houses >= 5) {
      return { allowed: false, reason: 'Already has a Grand Citadel (Hotel)' };
    }

    const houseCost = space.houseCost || 100;
    if (playerCash < houseCost) {
      return { allowed: false, reason: 'Insufficient funds' };
    }

    // Check bank supply
    if (ownership.houses === 4) {
      if (bankHotels <= 0) {
        return { allowed: false, reason: 'Bank is out of Grand Citadels (Hotels)' };
      }
    } else {
      if (bankHouses <= 0) {
        return { allowed: false, reason: 'Bank is out of Eco-Villas (Houses)' };
      }
    }

    // Even-building rule
    if (evenBuildRule) {
      const currentLevel = ownership.houses;
      for (const otherId of districtIds) {
        const otherLevel = properties[otherId]?.houses || 0;
        if (otherLevel < currentLevel) {
          return { allowed: false, reason: 'Must build evenly across all district properties' };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Validates if a player can sell a house/hotel from a property.
   */
  static canSellHouse(
    propertyId: number,
    playerId: string,
    properties: PropertyOwnership,
    evenBuildRule = true
  ): { allowed: boolean; reason?: string } {
    const space = this.getSpace(propertyId);
    if (space.type !== 'PROPERTY' || !space.district) {
      return { allowed: false, reason: 'Not a developable district property' };
    }

    const ownership = properties[propertyId];
    if (!ownership || ownership.ownerId !== playerId) {
      return { allowed: false, reason: 'You do not own this property' };
    }

    if (ownership.houses <= 0) {
      return { allowed: false, reason: 'No buildings on this property' };
    }

    // Even-building rule
    if (evenBuildRule) {
      const currentLevel = ownership.houses;
      const districtIds = this.getDistrictPropertyIds(space.district);
      for (const otherId of districtIds) {
        const otherLevel = properties[otherId]?.houses || 0;
        if (otherLevel > currentLevel) {
          return { allowed: false, reason: 'Must dismantle evenly across all district properties' };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Validates mortgaging a property.
   */
  static canMortgage(
    propertyId: number,
    playerId: string,
    properties: PropertyOwnership
  ): { allowed: boolean; reason?: string } {
    const space = this.getSpace(propertyId);
    const ownership = properties[propertyId];
    if (!ownership || ownership.ownerId !== playerId) {
      return { allowed: false, reason: 'You do not own this property' };
    }

    if (ownership.isMortgaged) {
      return { allowed: false, reason: 'Already mortgaged' };
    }

    if (space.district) {
      const districtIds = this.getDistrictPropertyIds(space.district);
      const hasBuildings = districtIds.some((id) => (properties[id]?.houses || 0) > 0);
      if (hasBuildings) {
        return { allowed: false, reason: 'Must dismantle all buildings in the district before mortgaging' };
      }
    }

    return { allowed: true };
  }

  /**
   * Validates unmortgaging a property.
   */
  static canUnmortgage(
    propertyId: number,
    playerId: string,
    properties: PropertyOwnership,
    playerCash: number,
    interestRate = 0.10
  ): { allowed: boolean; cost: number; reason?: string } {
    const space = this.getSpace(propertyId);
    const ownership = properties[propertyId];
    if (!ownership || ownership.ownerId !== playerId) {
      return { allowed: false, cost: 0, reason: 'You do not own this property' };
    }

    if (!ownership.isMortgaged) {
      return { allowed: false, cost: 0, reason: 'Property is not mortgaged' };
    }

    const mortgageValue = space.mortgageValue || Math.floor((space.price || 0) / 2);
    const cost = Math.ceil(mortgageValue * (1 + interestRate));

    if (playerCash < cost) {
      return { allowed: false, cost, reason: `Requires $${cost} to unmortgage` };
    }

    return { allowed: true, cost };
  }
}
