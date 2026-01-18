/**
 * Calculates card rarity based on trade data
 * @param tradeData - Trade data containing ROI, stake amount, and volatility score
 * @returns Rarity string: 'COMMON', 'RARE', or 'LEGENDARY'
 */
export interface TradeData {
  roi: number; // Return on Investment (percentage)
  stakeAmount: number; // Amount staked/traded
  volatilityScore?: number; // Optional volatility score
}

export function calculateCardRarity(tradeData: TradeData): 'COMMON' | 'RARE' | 'LEGENDARY' {
  const { roi, stakeAmount, volatilityScore } = tradeData

  // Define thresholds
  const HIGH_ROI_THRESHOLD = 50 // 50% ROI or higher
  const HIGH_STAKE_THRESHOLD = 1000 // $1000 or more
  const MEDIUM_ROI_THRESHOLD = 20 // 20% ROI or higher
  const MEDIUM_STAKE_THRESHOLD = 500 // $500 or more

  // LEGENDARY: High ROI + High Stake
  if (roi >= HIGH_ROI_THRESHOLD && stakeAmount >= HIGH_STAKE_THRESHOLD) {
    return 'LEGENDARY'
  }

  // RARE: Medium ROI + Medium Stake, OR High ROI OR High Stake
  if (
    (roi >= MEDIUM_ROI_THRESHOLD && stakeAmount >= MEDIUM_STAKE_THRESHOLD) ||
    roi >= HIGH_ROI_THRESHOLD ||
    stakeAmount >= HIGH_STAKE_THRESHOLD
  ) {
    return 'RARE'
  }

  // COMMON: Everything else
  return 'COMMON'
}
