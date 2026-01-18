import { NextResponse } from 'next/server'
import { mockCards } from '@/lib/mockCards'
import { UserCollection } from '@/types/Card'

export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const walletAddress = params.walletAddress

    // TODO: Replace with actual database query
    // For now, return mock portfolio data
    const userCards = mockCards.slice(0, 6)
    const totalValue = userCards.reduce((sum, card) => sum + (card.marketValue || 0), 0)

    // Mock trading history
    const recentTrades = [
      {
        id: '1',
        cardId: '1',
        cardName: 'Nexus Prime',
        type: 'buy',
        amount: 10000,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'completed',
      },
      {
        id: '2',
        cardId: '2',
        cardName: 'Zephyr Flux',
        type: 'buy',
        amount: 3500,
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'completed',
      },
      {
        id: '3',
        cardId: '3',
        cardName: 'Voidweaver',
        type: 'sell',
        amount: 8000,
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: 'completed',
      },
    ]

    // Calculate holdings breakdown
    const byRarity: Record<string, number> = {}
    const byFaction: Record<string, number> = {}
    
    userCards.forEach(card => {
      byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1
      byFaction[card.faction] = (byFaction[card.faction] || 0) + 1
    })
    
    const topCards = [...userCards]
      .sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))
      .slice(0, 5)

    const portfolio = {
      walletAddress,
      totalCards: userCards.length,
      totalValue,
      cards: userCards,
      recentTrades,
      performance: {
        totalTrades: 12,
        winRate: 75,
        totalProfit: 5000,
      },
      holdings: {
        byRarity,
        byFaction,
        topCards,
      },
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}
