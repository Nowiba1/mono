import { BoardEngine } from './BoardEngine';
import { Player, PropertyOwnership, TradeOffer } from './types';

export class TradeEngine {
  static validateTrade(
    trade: TradeOffer,
    players: Player[],
    properties: PropertyOwnership
  ): { valid: boolean; reason?: string } {
    const fromPlayer = players.find((p) => p.id === trade.fromPlayerId);
    const toPlayer = players.find((p) => p.id === trade.toPlayerId);

    if (!fromPlayer || !toPlayer) {
      return { valid: false, reason: 'Invalid players in trade offer' };
    }

    if (fromPlayer.isBankrupt || toPlayer.isBankrupt) {
      return { valid: false, reason: 'Bankrupt players cannot trade' };
    }

    // Cash checks
    if (trade.offeredCash < 0 || trade.requestedCash < 0) {
      return { valid: false, reason: 'Cash amount cannot be negative' };
    }

    if (fromPlayer.cash < trade.offeredCash) {
      return { valid: false, reason: `${fromPlayer.name} does not have sufficient cash` };
    }

    if (toPlayer.cash < trade.requestedCash) {
      return { valid: false, reason: `${toPlayer.name} does not have sufficient cash` };
    }

    // Jail cards check
    if (fromPlayer.getOutOfJailCards < trade.offeredJailCards) {
      return { valid: false, reason: `${fromPlayer.name} does not have enough Pardon Passes` };
    }

    if (toPlayer.getOutOfJailCards < trade.requestedJailCards) {
      return { valid: false, reason: `${toPlayer.name} does not have enough Pardon Passes` };
    }

    // Property ownership and building checks
    for (const propId of trade.offeredPropertyIds) {
      const own = properties[propId];
      if (!own || own.ownerId !== fromPlayer.id) {
        return { valid: false, reason: `${fromPlayer.name} does not own property #${propId}` };
      }
      const space = BoardEngine.getSpace(propId);
      if (space.district) {
        const districtIds = BoardEngine.getDistrictPropertyIds(space.district);
        const hasBuildings = districtIds.some((id) => (properties[id]?.houses || 0) > 0);
        if (hasBuildings) {
          return {
            valid: false,
            reason: `Cannot trade ${space.name} while any building stands in the ${space.district} district`,
          };
        }
      }
    }

    for (const propId of trade.requestedPropertyIds) {
      const own = properties[propId];
      if (!own || own.ownerId !== toPlayer.id) {
        return { valid: false, reason: `${toPlayer.name} does not own property #${propId}` };
      }
      const space = BoardEngine.getSpace(propId);
      if (space.district) {
        const districtIds = BoardEngine.getDistrictPropertyIds(space.district);
        const hasBuildings = districtIds.some((id) => (properties[id]?.houses || 0) > 0);
        if (hasBuildings) {
          return {
            valid: false,
            reason: `Cannot trade ${space.name} while any building stands in the ${space.district} district`,
          };
        }
      }
    }

    return { valid: true };
  }

  static executeTrade(
    trade: TradeOffer,
    players: Player[],
    properties: PropertyOwnership
  ): {
    updatedPlayers: Player[];
    updatedProperties: PropertyOwnership;
  } {
    const updatedProperties = { ...properties };

    const updatedPlayers = players.map((p) => {
      if (p.id === trade.fromPlayerId) {
        return {
          ...p,
          cash: p.cash - trade.offeredCash + trade.requestedCash,
          getOutOfJailCards: p.getOutOfJailCards - trade.offeredJailCards + trade.requestedJailCards,
        };
      }
      if (p.id === trade.toPlayerId) {
        return {
          ...p,
          cash: p.cash + trade.offeredCash - trade.requestedCash,
          getOutOfJailCards: p.getOutOfJailCards + trade.offeredJailCards - trade.requestedJailCards,
        };
      }
      return p;
    });

    // Transfer properties from fromPlayer to toPlayer
    trade.offeredPropertyIds.forEach((propId) => {
      if (updatedProperties[propId]) {
        updatedProperties[propId] = {
          ...updatedProperties[propId],
          ownerId: trade.toPlayerId,
        };
      }
    });

    // Transfer properties from toPlayer to fromPlayer
    trade.requestedPropertyIds.forEach((propId) => {
      if (updatedProperties[propId]) {
        updatedProperties[propId] = {
          ...updatedProperties[propId],
          ownerId: trade.fromPlayerId,
        };
      }
    });

    return {
      updatedPlayers,
      updatedProperties,
    };
  }
}
