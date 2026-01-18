import { NextRequest, NextResponse } from 'next/server'

/**
 * Market Ticker API Route
 * Fetches live market data for trading pairs
 * For hackathon: Returns mock data. In production, fetch from Pear Protocol API
 */

export interface MarketTicker {
  pair: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pair = searchParams.get('pair') // e.g., "HYPE-ETH"

    // For hackathon: Return mock market data
    // TODO: Replace with actual Pear Protocol API call: GET /market/ticker
    // Example: const response = await pearClient.get(`/market/ticker?pair=${pair}`)

    // Generate mock data based on pair
    const mockTickers: Record<string, MarketTicker> = {
      'HYPE-ETH': {
        pair: 'HYPE-ETH',
        price: 245.32,
        change24h: 5.23,
        volume24h: 1250000,
        high24h: 250.15,
        low24h: 230.89,
      },
      'HYPE': {
        pair: 'HYPE',
        price: 0.045,
        change24h: -2.15,
        volume24h: 850000,
        high24h: 0.048,
        low24h: 0.043,
      },
      'ETH': {
        pair: 'ETH',
        price: 2450.89,
        change24h: 1.87,
        volume24h: 50000000,
        high24h: 2500.12,
        low24h: 2400.45,
      },
    }

    // If specific pair requested, return that; otherwise return all
    if (pair) {
      const ticker = mockTickers[pair] || {
        pair,
        price: Math.random() * 1000 + 100,
        change24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000,
        high24h: Math.random() * 1000 + 200,
        low24h: Math.random() * 1000,
      }

      return NextResponse.json(ticker, { status: 200 })
    }

    // Return all tickers
    return NextResponse.json(Object.values(mockTickers), { status: 200 })
  } catch (error) {
    console.error('Error fetching market ticker:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch market data',
      },
      { status: 500 }
    )
  }
}

