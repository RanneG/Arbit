import { NextResponse } from 'next/server'
import { calculateCardRarity, TradeData } from '@/lib/cardUtils'

/**
 * GET /api/bot-demo
 * Simulates trade data and calculates card rarity
 * Returns a JSON object with tradeId and calculated rarity
 */
export async function GET() {
  try {
    // Generate random trade data to simulate a trade
    const roi = Math.random() * 100 // Random ROI between 0-100%
    const stakeAmount = Math.random() * 2000 + 100 // Random stake between $100-$2100
    const volatilityScore = Math.random() // Random volatility score between 0-1

    // Create trade data object
    const tradeData: TradeData = {
      roi: Math.round(roi * 100) / 100, // Round to 2 decimal places
      stakeAmount: Math.round(stakeAmount * 100) / 100, // Round to 2 decimal places
      volatilityScore: Math.round(volatilityScore * 100) / 100, // Round to 2 decimal places
    }

    // Calculate rarity using the function
    const rarity = calculateCardRarity(tradeData)

    // Generate a fake trade ID (format: trade_xxxxxxxx)
    const tradeId = `trade_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`

    // Return the result
    return NextResponse.json(
      {
        tradeId,
        rarity,
        tradeData: {
          roi: tradeData.roi,
          stakeAmount: tradeData.stakeAmount,
          volatilityScore: tradeData.volatilityScore,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
