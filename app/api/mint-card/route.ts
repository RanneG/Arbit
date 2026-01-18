import { NextRequest, NextResponse } from 'next/server'
import { pearClient } from '@/lib/pearClient'
import { getCharacterTrade, normalizeCharacterId } from '@/lib/tradeMapping'
import { mockCards } from '@/lib/mockCards'
import { Card, Rarity, Faction } from '@/types/Card'

/**
 * POST /api/mint-card
 * 
 * Trade-to-Mint Integration Endpoint
 * Executes a real Pear Protocol trade when a user mints a character card.
 * 
 * This is the core hackathon requirement - connecting card minting to live trading.
 * 
 * Request Body:
 * {
 *   "characterId": "nexus-prime",
 *   "userWallet": "0x..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "trade": {
 *     "orderId": "pear_ord_abc123",
 *     "status": "filled",
 *     "characterId": "nexus-prime"
 *   },
 *   "card": {
 *     "id": "nexus-prime",
 *     "name": "Nexus Prime",
 *     "rarity": "Legendary",
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Request & Validation
    const { characterId, userWallet } = body

    if (!characterId) {
      return NextResponse.json(
        {
          success: false,
          error: 'characterId is required',
        },
        { status: 400 }
      )
    }

    if (!userWallet) {
      return NextResponse.json(
        {
          success: false,
          error: 'userWallet is required',
        },
        { status: 400 }
      )
    }

    console.log(`Minting card for character: ${characterId}`)
    console.log(`User wallet: ${userWallet}`)

    // Character-to-Trade Mapping
    // Normalize character ID to handle various formats
    const normalizedId = normalizeCharacterId(characterId) || characterId
    const tradeConfig = getCharacterTrade(normalizedId)

    if (!tradeConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `Character "${characterId}" not found in trade mapping. Available characters: nexus-prime`,
        },
        { status: 404 }
      )
    }

    console.log('Trade configuration:', JSON.stringify(tradeConfig, null, 2))

    // Execute the Real Trade via Pear Protocol
    // This uses the real authentication flow with APITRADER client ID
    // No mock mode - this must execute a real trade
    try {
      console.log('Executing real Pear Protocol trade...')
      
      const tradeResult = await pearClient.executeBasketTrade(
        {
          long: tradeConfig.long,
          short: tradeConfig.short,
        },
        tradeConfig.notional
      )

      console.log(`✅ Trade executed successfully! Order ID: ${tradeResult.orderId}`)
      console.log(`Trade status: ${tradeResult.status}`)

      // Generate Card Metadata with Real Trade Data
      // Find the base card data from mockCards using normalized ID
      // Try multiple matching strategies for flexibility
      const baseCard = mockCards.find((card) => {
        const cardNameSlug = card.name.toLowerCase().replace(/\s+/g, '-')
        const cardNameLower = card.name.toLowerCase()
        const normalizedLower = normalizedId.toLowerCase()
        const originalLower = characterId.toLowerCase()
        
        return (
          card.id === normalizedId ||
          card.id === characterId ||
          cardNameSlug === normalizedLower ||
          cardNameSlug === originalLower ||
          cardNameLower === normalizedLower.replace(/-/g, ' ') ||
          cardNameLower === originalLower.replace(/-/g, ' ')
        )
      })

      if (!baseCard) {
        // If card not found in mockCards, create from scratch
        console.warn(`Card data not found for ${characterId}, creating from trade config`)
      }

      // Create the minted card with real trade orderId embedded
      const mintedCard: Card = {
        id: `${normalizedId}-${tradeResult.orderId}`,
        name: baseCard?.name || normalizedId.split('-').map((w: string) => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' '),
        title: baseCard?.title || `Minted via Trade ${tradeResult.orderId.slice(-8)}`,
        rarity: baseCard?.rarity || Rarity.LEGENDARY,
        faction: baseCard?.faction || Faction.COSMIC,
        stats: baseCard?.stats || {
          longPosition: Math.floor(Math.random() * 50) + 50,
          shortPosition: Math.floor(Math.random() * 50) + 50,
          leverage: Math.floor(Math.random() * 30) + 70,
          marketIQ: Math.floor(Math.random() * 20) + 80,
        },
        description: `${baseCard?.description || 'This card was minted through a live Pear Protocol trade.'} Trade Order ID: ${tradeResult.orderId}`,
        imageUrl: baseCard?.imageUrl,
        ownerAddress: userWallet,
        mintedAt: new Date().toISOString(),
        marketValue: baseCard?.marketValue,
        // Embed the real orderId in a custom attribute
        tradingPair: `${tradeConfig.long.join('+')}${tradeConfig.short.length > 0 ? `-${tradeConfig.short.join('+')}` : ''}`,
      }

      // Return combined trade confirmation and card data
      const response = {
        success: true,
        trade: {
          orderId: tradeResult.orderId,
          status: tradeResult.status,
          characterId: normalizedId,
          notional: tradeConfig.notional,
          basket: {
            long: tradeConfig.long,
            short: tradeConfig.short,
          },
        },
        card: mintedCard,
        message: `Successfully minted ${mintedCard.name} card via Pear Protocol trade`,
      }

      console.log('✅ Card minted successfully with trade orderId:', tradeResult.orderId)

      return NextResponse.json(response, { status: 200 })
    } catch (tradeError: any) {
      // Trade execution failed - do NOT generate a card
      console.error('❌ Trade execution failed:', tradeError)
      
      // Extract detailed error information
      let errorMessage = tradeError instanceof Error 
        ? tradeError.message 
        : 'Unknown trade execution error'

      // Try to extract more details from Axios error response
      let errorDetails: any = null
      if (tradeError?.response?.data) {
        errorDetails = tradeError.response.data
        console.error('Error response data:', JSON.stringify(errorDetails, null, 2))
      }
      if (tradeError?.response?.status) {
        console.error('Error status:', tradeError.response.status)
      }

      // Provide helpful error messages based on error type
      let userFriendlyError = errorMessage
      let helpfulDetails = 'No card was minted. The trade must succeed to mint a card.'

      // Check for specific error patterns
      if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
        userFriendlyError = 'Trade execution failed: Internal server error from Pear Protocol API.'
        helpfulDetails = 'Common causes: Agent wallet not set up, builder not approved, insufficient balance, or invalid trade configuration. Check server logs for details. Please approve the builder address first, then retry.'
      } else if (errorMessage.includes('Agent wallet') || errorMessage.includes('agent wallet')) {
        userFriendlyError = 'Trade execution failed: Agent wallet not set up. Please approve the builder address first.'
        helpfulDetails = 'Go to Portfolio page → Approve Builder → Confirm transaction → Retry mint.'
      } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        userFriendlyError = 'Trade execution failed: Authentication error. Please check your API configuration.'
        helpfulDetails = 'Check .env.local for PEAR_WALLET_PRIVATE_KEY and PEAR_CLIENT_ID.'
      } else if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        userFriendlyError = 'Trade execution failed: Insufficient balance or builder not approved.'
        helpfulDetails = 'Add more ETH/tokens to wallet or approve builder address first.'
      } else if (errorDetails?.message) {
        // Use API error message if available
        userFriendlyError = `Trade execution failed: ${errorDetails.message}`
      }

      return NextResponse.json(
        {
          success: false,
          error: userFriendlyError,
          details: helpfulDetails,
          // Include error details in development mode for debugging
          ...(process.env.NODE_ENV === 'development' && errorDetails && {
            debug: {
              statusCode: tradeError?.response?.status,
              errorData: errorDetails,
            },
          }),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    // Handle general errors
    console.error('Error in mint-card endpoint:', error)

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

