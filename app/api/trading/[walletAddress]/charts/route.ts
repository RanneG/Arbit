import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const walletAddress = params.walletAddress

    // TODO: Replace with actual Pear Protocol API integration
    // For now, return mock chart data that simulates Pear Protocol style
    
    // Generate 7 days of data
    const days = 7
    const baseValue = 10000
    const portfolioValue: number[] = []
    const profitLoss: number[] = []
    const dates: string[] = []

    for (let i = 0; i < days; i++) {
      const dayOffset = days - i - 1
      const date = new Date()
      date.setDate(date.getDate() - dayOffset)
      dates.push(`Day ${i + 1}`)
      
      // Simulate portfolio growth with some volatility
      const growth = Math.random() * 0.15 + 0.05 // 5-20% growth
      const value = baseValue * (1 + growth * (days - i) / days)
      portfolioValue.push(Math.round(value))
      
      // Profit/Loss starts at 0 and grows
      const profit = (value - baseValue) * 0.8 // 80% of growth is profit
      profitLoss.push(Math.round(profit))
    }

    // Calculate win rate from mock trades
    const totalTrades = 12
    const winRate = Math.round((totalTrades * 0.75)) // 75% win rate

    const chartData = {
      portfolioValue,
      profitLoss,
      dates,
      winRate,
      totalTrades,
    }

    return NextResponse.json(chartData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trading chart data' },
      { status: 500 }
    )
  }
}
