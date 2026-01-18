import { NextRequest, NextResponse } from 'next/server'
import { pearClient } from '@/lib/pearClient'
import { characters } from '@/lib/characters'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both formats: characterId (legacy) and direct basket trade (new Trade Builder)
    let longAssets: string[]
    let shortAssets: string[]
    let notional: number
    let orderType: string | undefined
    let limitPrice: number | undefined

    if (body.characterId) {
      // Legacy format: character-based trading
      const { characterId } = body

      // Find the character
      const character = characters.find((c) => c.id === characterId)

      if (!character) {
        return NextResponse.json(
          {
            success: false,
            error: `Character with id "${characterId}" not found`,
          },
          { status: 404 }
        )
      }

      // Extract coin symbols from basket (long side)
      // Remove /USD, /USDC suffixes and convert to coin names
      longAssets = character.basket.map((pair) => {
        // Extract coin name from symbol (e.g., 'AI/USD' -> 'AI')
        return pair.symbol.split('/')[0].trim()
      })

      // For now, try long-only trades to simplify and avoid 500 errors
      shortAssets = [] // Empty for long-only trades
      notional = 10 // Fixed notional for character trades
    } else {
      // New format: Direct basket trade from Trade Builder
      const { long, short, weightsLong, weightsShort, notional: notionalValue, orderType: ot, limitPrice: lp } = body

      // Validate required fields
      if (!long || !Array.isArray(long) || long.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Long basket is required and must be a non-empty array',
          },
          { status: 400 }
        )
      }

      if (!notionalValue || notionalValue <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Notional value is required and must be greater than 0',
          },
          { status: 400 }
        )
      }

      // Validate weights if provided
      if (weightsLong && (weightsLong.length !== long.length || Math.abs(weightsLong.reduce((sum: number, w: number) => sum + w, 0) - 1.0) > 0.01)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Long weights must match asset count and sum to 1.0',
          },
          { status: 400 }
        )
      }

      if (short && short.length > 0 && weightsShort) {
        if (weightsShort.length !== short.length || Math.abs(weightsShort.reduce((sum: number, w: number) => sum + w, 0) - 1.0) > 0.01) {
          return NextResponse.json(
            {
              success: false,
              error: 'Short weights must match asset count and sum to 1.0',
            },
            { status: 400 }
          )
        }
      }

      longAssets = long
      shortAssets = short || []
      notional = notionalValue
      orderType = ot || 'market'
      limitPrice = lp
    }


    // Execute the basket trade
    const result = await pearClient.executeBasketTrade(
      {
        long: longAssets,
        short: shortAssets,
      },
      notional
    )


    const response: any = {
      success: true,
      orderId: result.orderId,
      status: result.status,
      basket: {
        long: longAssets,
        short: shortAssets,
      },
    }

    // Include character info if this was a character-based trade
    if (body.characterId) {
      const character = characters.find((c) => c.id === body.characterId)
      response.message = `Trade executed for ${character?.name || 'character'}`
      response.character = {
        id: character?.id,
        name: character?.name,
      }
    } else {
      response.message = 'Trade executed successfully'
      response.orderType = orderType
      if (limitPrice) response.limitPrice = limitPrice
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Log error but don't expose internal details
    console.error('Error executing trade:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    // Don't expose sensitive information like API keys or internal paths
    const safeErrorMessage = errorMessage.includes('API key') ||
      errorMessage.includes('secret') ||
      errorMessage.includes('token')
      ? 'Authentication or configuration error'
      : errorMessage

    return NextResponse.json(
      {
        success: false,
        error: safeErrorMessage,
      },
      { status: 500 }
    )
  }
}

