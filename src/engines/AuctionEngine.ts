import { AuctionState, Player } from './types';

export class AuctionEngine {
  static startAuction(propertyId: number, eligiblePlayers: Player[]): AuctionState {
    const activeBidderIds = eligiblePlayers
      .filter((p) => !p.isBankrupt && p.cash >= 10)
      .map((p) => p.id);

    return {
      propertyId,
      currentBid: 0,
      highestBidderId: null,
      activeBidderIds,
      currentBidderIndex: 0,
      minIncrement: 10,
      timerRemaining: 15, // 15 seconds per round
    };
  }

  static placeBid(
    auction: AuctionState,
    playerId: string,
    bidAmount: number,
    playerCash: number
  ): {
    updatedAuction: AuctionState;
    success: boolean;
    reason?: string;
  } {
    if (!auction.activeBidderIds.includes(playerId)) {
      return { updatedAuction: auction, success: false, reason: 'Player is not an active bidder' };
    }

    const minRequired = auction.currentBid + auction.minIncrement;
    if (bidAmount < minRequired) {
      return {
        updatedAuction: auction,
        success: false,
        reason: `Bid must be at least $${minRequired}`,
      };
    }

    if (bidAmount > playerCash) {
      return { updatedAuction: auction, success: false, reason: 'Insufficient funds for this bid' };
    }

    // Advance to next active bidder
    const currentIdx = auction.activeBidderIds.indexOf(playerId);
    const nextIdx = (currentIdx + 1) % auction.activeBidderIds.length;

    return {
      updatedAuction: {
        ...auction,
        currentBid: bidAmount,
        highestBidderId: playerId,
        currentBidderIndex: nextIdx,
        timerRemaining: 15,
      },
      success: true,
    };
  }

  static passBid(
    auction: AuctionState,
    playerId: string
  ): {
    updatedAuction: AuctionState;
    isAuctionOver: boolean;
    winnerId: string | null;
    finalPrice: number;
  } {
    const remainingBidders = auction.activeBidderIds.filter((id) => id !== playerId);

    if (remainingBidders.length === 0) {
      // All passed
      return {
        updatedAuction: { ...auction, activeBidderIds: [] },
        isAuctionOver: true,
        winnerId: auction.highestBidderId,
        finalPrice: auction.currentBid,
      };
    }

    if (remainingBidders.length === 1 && auction.highestBidderId !== null) {
      // 1 bidder left who made a bid
      return {
        updatedAuction: { ...auction, activeBidderIds: remainingBidders },
        isAuctionOver: true,
        winnerId: remainingBidders[0],
        finalPrice: auction.currentBid,
      };
    }

    const nextIndex = auction.currentBidderIndex % remainingBidders.length;

    return {
      updatedAuction: {
        ...auction,
        activeBidderIds: remainingBidders,
        currentBidderIndex: nextIndex,
      },
      isAuctionOver: false,
      winnerId: null,
      finalPrice: auction.currentBid,
    };
  }
}
