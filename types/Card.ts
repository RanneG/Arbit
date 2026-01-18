export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum Faction {
  NEBULA = 'nebula',
  VOID = 'void',
  STELLAR = 'stellar',
  COSMIC = 'cosmic',
  QUANTUM = 'quantum',
}

export interface CardStats {
  longPosition: number; // Ability to profit from upward price movements (0-100)
  shortPosition: number; // Ability to profit from downward price movements (0-100)
  leverage: number; // Risk management and position sizing ability (0-100)
  marketIQ: number; // Understanding of market dynamics and trends (0-100)
}

export interface TradeData {
  tradeId?: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice?: number;
  exitPrice?: number;
  roiPercent: number;
  holdDays: number;
  profit?: number;
  notionalUSD?: number;
  roi?: number;
  stakeAmount?: number;
}

export interface Card {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  faction: Faction;
  stats: CardStats;
  description: string;
  imageUrl?: string;
  ownerAddress?: string;
  tokenId?: string;
  mintedAt?: string;
  marketValue?: number;
  tradingPair?: string;
  lastTradePrice?: number;
  tradeData?: TradeData; // Optional trade performance data for cards minted from closed trades
}

export interface UserCollection {
  walletAddress: string;
  cards: Card[];
  totalCards: number;
  totalValue: number;
}
