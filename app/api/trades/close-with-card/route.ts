import { NextRequest, NextResponse } from 'next/server'
import {
  calculateCardMetadata,
  getCardDesign,
  type TradeMetrics,
  Rarity as CalculatorRarity,
} from '@/lib/cardRarityCalculator'
import { Card, Rarity } from '@/types/Card'

/**
 * POST /api/trades/close-with-card
 * 
 * Closes an active trade and mints a card based on trade performance
 * 
 * Request Body:
 * {
 *   "tradeId": "trade_123",
 *   "exitPrice": 45000.50
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "closedTrade": { ... },
 *   "card": {
 *     "id": "card-trade_123-1234567890",
 *     "name": "Epic BTC Bull",
 *     "rarity": "EPIC",
 *     "value": 4500,
 *     "tradeData": { ... },
 *     "design": { ... },
 *     "mintedAt": "2024-..."
 *   }
 * }
 */

interface CloseTradeRequest {
  tradeId: string
  exitPrice: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CloseTradeRequest = await request.json()

    // Request validation
    const { tradeId, exitPrice } = body

    if (!tradeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'tradeId is required',
        },
        { status: 400 }
      )
    }

    if (!exitPrice || exitPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'exitPrice must be a positive number',
        },
        { status: 400 }
      )
    }

    // TODO: Fetch the active trade from database
    // For now, we'll use mock data structure
    // In production, this would be: const trade = await db.trades.findById(tradeId)
    // Mock trade data (replace with actual database query)
    const trade = {
      id: tradeId,
      pair: 'BTC/USD', // Would come from DB
      direction: 'LONG' as const, // Would come from DB
      entryPrice: 40000, // Would come from DB
      notional: 5000, // Would come from DB
      openedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      userId: 'user_123', // Would come from DB
      walletAddress: '0x...', // Would come from DB
    }

    // Step 1: Calculate final trade metrics
    const roiPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100
    const holdDays = calculateDaysBetween(new Date(trade.openedAt), new Date())
    const profit = (roiPercent / 100) * trade.notional

    // Step 2: Calculate card rarity and metadata
    const tradeMetrics: TradeMetrics = {
      roiPercent,
      holdDays,
      notionalUSD: trade.notional,
      direction: trade.direction,
      pair: trade.pair,
    }

    const cardMetadata = calculateCardMetadata(tradeMetrics)
    const cardDesign = getCardDesign(cardMetadata.rarity, trade.pair)

    // Map calculator rarity to Card.Rarity type
    const mapRarityToCardType = (rarity: CalculatorRarity): Rarity => {
      switch (rarity) {
        case CalculatorRarity.MYTHIC:
        case CalculatorRarity.LEGENDARY:
          return Rarity.LEGENDARY // Use LEGENDARY as highest available
        case CalculatorRarity.EPIC:
          return Rarity.EPIC
        case CalculatorRarity.RARE:
          return Rarity.RARE
        default:
          return Rarity.COMMON
      }
    }

    // Step 3: Create card object
    const cardId = `card-${tradeId}-${Date.now()}`
    const cardRarity = mapRarityToCardType(cardMetadata.rarity)
    const mintedCard: Card = {
      id: cardId,
      name: cardMetadata.name,
      title: `${cardMetadata.rarity} ${trade.pair.split('/')[0]} Card`,
      rarity: cardRarity,
      faction: 'cosmic', // Default faction
      stats: {
        longPosition: trade.direction === 'LONG' ? 80 : 20,
        shortPosition: trade.direction === 'SHORT' ? 80 : 20,
        leverage: Math.min(Math.floor(Math.abs(roiPercent) / 10), 100),
        marketIQ: Math.min(Math.floor((cardMetadata.value / 100) * 10), 100),
      },
      description: `Minted from ${trade.pair} ${trade.direction} trade. ROI: ${roiPercent.toFixed(2)}%, Held: ${holdDays} days`,
      imageUrl: cardDesign.imageUrl,
      ownerAddress: trade.walletAddress,
      mintedAt: new Date().toISOString(),
      marketValue: cardMetadata.value,
      // Custom trade data embedded
      tradingPair: trade.pair,
    }

    // Step 4: Create closed trade object
    const closedTrade = {
      id: trade.id,
      pair: trade.pair,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      exitPrice,
      pnl: profit,
      pnlPercent: roiPercent,
      holdTime: holdDays,
      openedAt: trade.openedAt,
      closedAt: new Date().toISOString(),
      cardId: cardId,
      status: 'CLOSED' as const,
    }

    // Step 5: TODO - Update trade status in database
    // await db.trades.update(tradeId, {
    //   status: 'closed',
    //   exitPrice,
    //   closedAt: new Date(),
    //   cardId: cardId,
    // })

    // Step 6: TODO - Mint NFT card (on-chain or store in DB)
    // const nftCard = await mintCardNFT(mintedCard, trade.walletAddress)

    // Step 7: TODO - Add card to user's collection
    // await db.users.addCard(trade.userId, mintedCard)

    console.log(`✅ Trade closed and card minted: ${cardId}`)
    console.log(`   Trade: ${trade.pair} ${trade.direction} - ${roiPercent.toFixed(2)}% ROI`)
    console.log(`   Card: ${mintedCard.name} (${cardMetadata.rarity}) - $${cardMetadata.value}`)

    // Return both closed trade and card
    return NextResponse.json(
      {
        success: true,
        closedTrade,
        card: {
          ...mintedCard,
          rarity: cardMetadata.rarity, // Include calculator rarity string (MYTHIC, LEGENDARY, etc.)
          value: cardMetadata.value,
          tradeData: {
            tradeId: trade.id,
            pair: trade.pair,
            direction: trade.direction,
            entryPrice: trade.entryPrice,
            exitPrice,
            roiPercent,
            holdDays,
            profit,
          },
          design: cardDesign,
        },
        message: `Successfully closed trade and minted ${cardMetadata.rarity} card: ${mintedCard.name}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error closing trade and minting card:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: 'Failed to close trade and mint card',
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to calculate days between two dates
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(diffDays, 0) // Ensure non-negative
}

