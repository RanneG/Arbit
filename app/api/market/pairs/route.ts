import { NextResponse } from 'next/server'

/**
 * Available Trading Pairs API Route
 * Returns list of pairs that Pear Protocol can trade
 * For hackathon: Hardcoded list. In production, fetch from Pear Protocol API
 */

export interface TradingPair {
  symbol: string
  base: string
  quote: string
  price: number
  change24h: number
  volume24h: number
}

export async function GET() {
  try {
    // For hackathon: Return hardcoded list of major pairs
    // TODO: Fetch from Pear Protocol API: GET /market/pairs or /market/instruments
    
    const pairs: TradingPair[] = [
      { symbol: 'HYPE', base: 'HYPE', quote: 'USD', price: 0.045, change24h: -2.15, volume24h: 850000 },
      { symbol: 'ETH', base: 'ETH', quote: 'USD', price: 2450.89, change24h: 1.87, volume24h: 50000000 },
      { symbol: 'BTC', base: 'BTC', quote: 'USD', price: 43250.12, change24h: 0.95, volume24h: 200000000 },
      { symbol: 'SOL', base: 'SOL', quote: 'USD', price: 98.45, change24h: 3.21, volume24h: 15000000 },
      { symbol: 'AI', base: 'AI', quote: 'USD', price: 2.35, change24h: -1.25, volume24h: 500000 },
      { symbol: 'ML', base: 'ML', quote: 'USD', price: 1.89, change24h: 4.56, volume24h: 300000 },
      { symbol: 'DOGE', base: 'DOGE', quote: 'USD', price: 0.089, change24h: 2.34, volume24h: 800000 },
      { symbol: 'ARB', base: 'ARB', quote: 'USD', price: 1.45, change24h: -0.87, volume24h: 200000 },
      { symbol: 'MATIC', base: 'MATIC', quote: 'USD', price: 0.78, change24h: 1.12, volume24h: 1500000 },
      { symbol: 'LINK', base: 'LINK', quote: 'USD', price: 14.89, change24h: 0.45, volume24h: 5000000 },
      { symbol: 'UNI', base: 'UNI', quote: 'USD', price: 6.78, change24h: -0.23, volume24h: 3000000 },
    ]

    return NextResponse.json(pairs, { status: 200 })
  } catch (error) {
    console.error('Error fetching trading pairs:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch trading pairs',
      },
      { status: 500 }
    )
  }
}

