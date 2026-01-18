/**
 * Card Rarity & Value Calculator
 * Calculates card rarity and value based on trade performance metrics
 * See CARD_RARITY_SYSTEM_PROMPT.md for detailed formulas
 */

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
}

export interface TradeMetrics {
  roiPercent: number // signed: + for profit, - for loss
  holdDays: number
  notionalUSD: number
  direction: 'LONG' | 'SHORT'
  pair: string // e.g., "BTC/USD"
}

export interface CardMetadata {
  rarity: Rarity
  value: number // USD value of the card
  name: string // Generated card name
}

/**
 * Calculate card rarity from trade performance
 * Uses the complete MVP formula with 4 factors:
 * - ROI Score (0-50 points)
 * - Duration Score (0-20 points)
 * - Size Score (0-20 points)
 * - Win Bonus (0-10 points)
 */
export function calculateRarity(metrics: TradeMetrics): Rarity {
  const roiScore = Math.min(Math.abs(metrics.roiPercent), 100) * 0.5
  const durationScore = Math.min(metrics.holdDays, 20)
  const sizeScore = Math.min(metrics.notionalUSD / 100, 20)
  const winBonus = metrics.roiPercent > 0 ? 10 : 0

  const totalScore = roiScore + durationScore + sizeScore + winBonus

  if (totalScore >= 90) return Rarity.MYTHIC
  if (totalScore >= 70) return Rarity.LEGENDARY
  if (totalScore >= 50) return Rarity.EPIC
  if (totalScore >= 30) return Rarity.RARE
  return Rarity.COMMON
}

/**
 * Calculate card value based on profit and rarity
 * Formula: Card Value = max(Profit × Rarity_Multiplier, $10)
 */
export function calculateCardValue(
  roiPercent: number,
  notionalUSD: number,
  rarity: Rarity
): number {
  const RARITY_MULTIPLIERS: Record<Rarity, number> = {
    [Rarity.COMMON]: 1.2,
    [Rarity.RARE]: 1.5,
    [Rarity.EPIC]: 2.0,
    [Rarity.LEGENDARY]: 3.0,
    [Rarity.MYTHIC]: 5.0,
  }

  const profit = Math.abs((roiPercent / 100) * notionalUSD)
  const multiplier = RARITY_MULTIPLIERS[rarity]
  return Math.max(profit * multiplier, 10) // Minimum $10
}

/**
 * Generate card name based on trade and rarity
 * Format: Adjective + Asset + Noun
 */
export function generateCardName(metrics: TradeMetrics, rarity: Rarity): string {
  const isWin = metrics.roiPercent > 0
  const asset = metrics.pair.split('/')[0] // BTC from BTC/USD

  // Adjective tables by rarity and win/loss
  const ADJECTIVES: Record<Rarity, { win: string[]; loss: string[] }> = {
    [Rarity.MYTHIC]: {
      win: ['Godlike', 'Divine', 'Perfect', 'Celestial'],
      loss: ['Catastrophic', 'Apocalyptic', 'Disastrous', 'Legendary Loss'],
    },
    [Rarity.LEGENDARY]: {
      win: ['Epic', 'Legendary', 'Supreme', 'Majestic'],
      loss: ['Titanic', 'Colossal', 'Monumental Loss'],
    },
    [Rarity.EPIC]: {
      win: ['Stellar', 'Magnificent', 'Brilliant', 'Superb'],
      loss: ['Massive', 'Substantial Loss'],
    },
    [Rarity.RARE]: {
      win: ['Strong', 'Solid', 'Notable', 'Impressive'],
      loss: ['Significant Loss'],
    },
    [Rarity.COMMON]: {
      win: ['Modest', 'Steady', 'Stable'],
      loss: ['Minor Loss'],
    },
  }

  const adjectives = ADJECTIVES[rarity][isWin ? 'win' : 'loss']
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]

  // Noun based on direction and outcome
  let noun: string
  if (metrics.direction === 'LONG') {
    noun = isWin ? 'Bull' : 'Slump'
  } else {
    noun = isWin ? 'Short' : 'Rally'
  }

  return `${adjective} ${asset} ${noun}`
}

/**
 * Calculate complete card metadata from trade metrics
 */
export function calculateCardMetadata(metrics: TradeMetrics): CardMetadata {
  const rarity = calculateRarity(metrics)
  const value = calculateCardValue(metrics.roiPercent, metrics.notionalUSD, rarity)
  const name = generateCardName(metrics, rarity)

  return {
    rarity,
    value,
    name,
  }
}

/**
 * Get card design properties based on rarity
 */
export function getCardDesign(rarity: Rarity, pair: string) {
  const asset = pair.split('/')[0].toLowerCase()

  const RARITY_COLORS: Record<Rarity, string[]> = {
    [Rarity.COMMON]: ['#95A5A6', '#7F8C8D'],
    [Rarity.RARE]: ['#3498DB', '#2980B9'],
    [Rarity.EPIC]: ['#9B59B6', '#8E44AD'],
    [Rarity.LEGENDARY]: ['#FFD700', '#FF8C00'],
    [Rarity.MYTHIC]: ['#E74C3C', '#C0392B'],
  }

  return {
    colors: RARITY_COLORS[rarity],
    imageUrl: `/images/cards/${asset}-card.jpg`, // Placeholder
    animation: rarity === Rarity.MYTHIC ? 'glow' : 'none',
  }
}

