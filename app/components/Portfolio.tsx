'use client'

/**
 * Portfolio Component - Redesigned
 * Follows PORTFOLIO_DESIGN_PROMPT.md structure:
 * - Active Trades (current positions) - separated from cards
 * - Trade History (closed trades → cards) - shows connections
 * - Portfolio Performance Chart - shows total value over time
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from './Card'
import WalletConnect from './WalletConnect'
import PortfolioChart from './PortfolioChart'
import { Card as CardType } from '@/types/Card'
import './styles/Portfolio.css'

// Data structure matching PORTFOLIO_DESIGN_PROMPT.md
interface ActiveTrade {
  id: string
  pair: string // "BTC/USD"
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  currentPrice: number
  pnl: number // current profit/loss
  pnlPercent: number
  notional: number
  openedAt: string // ISO timestamp
  status: 'ACTIVE'
}

interface CardNFT {
  id: string
  name: string
  imageUrl?: string
  sourceTradeId: string // Links back to trade history
  profitLocked: number // P&L from source trade
  mintedAt: string // ISO timestamp
  rarity?: string
  currentValue: number
  status: 'MINTED'
  // CardType fields for compatibility
  title?: string
  faction?: string
  stats?: any
  description?: string
  marketValue?: number
}

interface ClosedTrade {
  id: string
  pair: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  pnl: number // final profit/loss
  pnlPercent: number
  holdTime: number // days
  openedAt: string
  closedAt: string
  cardId?: string // Link to created card (if exists)
  status: 'CLOSED'
}

interface PortfolioSummary {
  activeTradesCount: number
  cardsCount: number
  totalValue: number
  activeTradesValue: number
  cardsValue: number
  winRate: number // 0-1, calculated from closed trades
}

interface TimeSeriesPoint {
  timestamp: string
  totalValue: number
  activeTradesValue: number
  cardsValue: number
}

interface PortfolioData {
  walletAddress: string
  activeTrades: ActiveTrade[]
  cards: CardNFT[]
  tradeHistory: ClosedTrade[]
  portfolioHistory: TimeSeriesPoint[]
  summary: PortfolioSummary
}

// Calculate portfolio summary from data
function calculatePortfolioSummary(
  activeTrades: ActiveTrade[],
  cards: CardNFT[],
  tradeHistory: ClosedTrade[]
): PortfolioSummary {
  // Active trades value (current market value)
  const activeTradesValue = activeTrades.reduce(
    (sum, trade) => sum + (trade.notional + trade.pnl),
    0
  )

  // Cards value (locked value from sold trades)
  const cardsValue = cards.reduce(
    (sum, card) => sum + (card.currentValue || card.profitLocked || 0),
    0
  )

  // Total portfolio value
  const totalValue = activeTradesValue + cardsValue

  // Win rate from closed trades
  const closedTrades = tradeHistory
  const winningTrades = closedTrades.filter(t => t.pnl > 0)
  const winRate = closedTrades.length > 0 
    ? winningTrades.length / closedTrades.length 
    : 0

  return {
    activeTradesCount: activeTrades.length,
    cardsCount: cards.length,
    totalValue,
    activeTradesValue,
    cardsValue,
    winRate
  }
}

// Create mock portfolio data for demo
function createMockPortfolio(walletAddress: string, existingCards: CardType[] = []): PortfolioData {
  // Mock active trades
  const activeTrades: ActiveTrade[] = [
    {
      id: 'trade_active_1',
      pair: 'BTC/USD',
      direction: 'LONG',
      entryPrice: 45000,
      currentPrice: 47500,
      pnl: 250,
      pnlPercent: 5.5,
      notional: 1000,
      openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE'
    },
    {
      id: 'trade_active_2',
      pair: 'ETH/USD',
      direction: 'SHORT',
      entryPrice: 2400,
      currentPrice: 2350,
      pnl: 50,
      pnlPercent: 2.08,
      notional: 1000,
      openedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE'
    }
  ]

  // Convert existing cards to CardNFT format
  const cards: CardNFT[] = existingCards.map((card, index) => ({
    id: card.id,
    name: card.name,
    imageUrl: card.imageUrl,
    sourceTradeId: `trade_${card.id}`,
    profitLocked: (card.marketValue || 0) * 0.1, // Estimate 10% of card value as profit
    mintedAt: card.mintedAt || new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    rarity: card.rarity,
    currentValue: card.marketValue || 0,
    status: 'MINTED',
    title: card.title,
    faction: card.faction,
    stats: card.stats,
    description: card.description,
    marketValue: card.marketValue
  }))

  // Mock trade history from cards
  const tradeHistory: ClosedTrade[] = cards.map((card, index) => ({
    id: card.sourceTradeId,
    pair: `${card.name.split(' ')[0]}/USD`, // Estimate from card name
    direction: index % 2 === 0 ? 'LONG' : 'SHORT',
    entryPrice: 1000 + index * 100,
    exitPrice: 1000 + index * 100 + (card.profitLocked || 0),
    pnl: card.profitLocked || 0,
    pnlPercent: ((card.profitLocked || 0) / 1000) * 100,
    holdTime: 3 + index,
    openedAt: new Date(new Date(card.mintedAt).getTime() - (3 + index) * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: card.mintedAt,
    cardId: card.id,
    status: 'CLOSED'
  }))

  // Generate portfolio history (mock time series)
  const now = Date.now()
  const portfolioHistory: TimeSeriesPoint[] = []
  const baseValue = 1000

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000)
    const activeValue = i > 2 ? baseValue * 0.8 : baseValue * 0.6 // Active trades decrease over time
    const cardsValue = baseValue * 0.4 + (30 - i) * 10 // Cards value increases over time
    portfolioHistory.push({
      timestamp: date.toISOString(),
      totalValue: activeValue + cardsValue,
      activeTradesValue: activeValue,
      cardsValue: cardsValue
    })
  }

  const summary = calculatePortfolioSummary(activeTrades, cards, tradeHistory)

  return {
    walletAddress,
    activeTrades,
    cards,
    tradeHistory,
    portfolioHistory,
    summary
  }
}

export default function Portfolio() {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D')

  useEffect(() => {
    const loadPortfolio = async () => {
      const storedWallet = localStorage.getItem('walletAddress')
      
      if (!storedWallet) {
        setLoading(false)
        return
      }

      setWalletAddress(storedWallet)

      try {
        // Try to get portfolio data
        const response = await fetch(`/api/portfolio/${storedWallet}`)
        if (response.ok) {
          const data = await response.json()
          
          // Convert existing data format to new structure
          // For now, use mock data structure
          const existingCards = data.cards || []
          const mockPortfolio = createMockPortfolio(storedWallet, existingCards)
          setPortfolio(mockPortfolio)
        } else {
          // Try to get user cards
          try {
            const cardsResponse = await fetch(`/api/users/${storedWallet}/cards`)
            if (cardsResponse.ok) {
              const cardsData = await cardsResponse.json()
              const existingCards = cardsData.cards || []
              const mockPortfolio = createMockPortfolio(storedWallet, existingCards)
              setPortfolio(mockPortfolio)
            } else {
              setPortfolio(createMockPortfolio(storedWallet))
            }
          } catch {
            setPortfolio(createMockPortfolio(storedWallet))
          }
        }
      } catch (error) {
        setPortfolio(createMockPortfolio(storedWallet))
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [])

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address || null)
    if (address) {
      // Reload portfolio data when wallet connects
      window.location.reload()
    }
  }

  const handleCloseTrade = async (trade: ActiveTrade) => {
    // Confirm with user before closing
    const confirmed = window.confirm(
      `Close ${trade.pair} ${trade.direction} position and mint card?\n\n` +
      `Current P&L: ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)} (${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent.toFixed(2)}%)`
    )

    if (!confirmed) return

    try {
      // Use currentPrice from trade as exit price
      const exitPrice = trade.currentPrice

      // Call close-with-card endpoint
      const response = await fetch('/api/trades/close-with-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeId: trade.id,
          exitPrice,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Show success message with card details
        alert(
          `✅ Trade closed!\n\n` +
          `Minted ${data.card.rarity} card: ${data.card.name}\n` +
          `Card Value: $${data.card.value.toFixed(2)}`
        )

        // Reload portfolio to show updated data
        window.location.reload()
      } else {
        // Show error message
        const errorMsg = data.error || 'Failed to close trade and mint card'
        alert(`Error: ${errorMsg}\n\n${data.details || ''}`)
        console.error('Close trade error:', data)
      }
    } catch (error) {
      console.error('Error closing trade:', error)
      alert('Failed to close trade. Please check console for details.')
    }
  }

  const handleCardPress = (card: CardNFT) => {
    router.push(`/card/${card.id}`)
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now()
    const time = new Date(timestamp).getTime()
    const diffMs = now - time
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks === 1) return '1 week ago'
    return `${diffWeeks} weeks ago`
  }

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="screen-container portfolio-container">
        <div className="loading-container">
          <p className="loading-text">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="screen-container portfolio-container">
        <div className="header">
          <div className="header-title-container">
            <h1 className="header-title">Portfolio</h1>
          </div>
          <p className="header-subtitle">
            Connect your wallet to view your trading portfolio
          </p>
        </div>
        <div className="wallet-connect-section">
          <WalletConnect onConnected={handleWalletConnected} />
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="screen-container portfolio-container">
        <div className="empty-container">
          <h2 className="empty-title">No Portfolio Data</h2>
          <p className="empty-text">
            Start trading to build your portfolio!
          </p>
          <button 
            className="browse-button"
            onClick={() => router.push('/trading')}
          >
            Go to Trading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container portfolio-container">
      <div className="header">
        <div className="header-title-container">
          <h1 className="header-title">Portfolio</h1>
        </div>
        <p className="header-subtitle">
          {portfolio.walletAddress.slice(0, 6)}...{portfolio.walletAddress.slice(-4)}
        </p>
      </div>

      {/* Header & Summary Metrics */}
      <div className="portfolio-stats">
        <div className="stat-card">
          <div className="stat-label">Active Trades</div>
          <div className="stat-value">{portfolio.summary.activeTradesCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cards Owned</div>
          <div className="stat-value">{portfolio.summary.cardsCount}</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-label">Total Portfolio Value</div>
          <div className="stat-value">${portfolio.summary.totalValue.toFixed(2)}</div>
          <div className="stat-breakdown">
            ${portfolio.summary.activeTradesValue.toFixed(2)} active + ${portfolio.summary.cardsValue.toFixed(2)} cards
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{(portfolio.summary.winRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Portfolio Performance Chart (MVP Priority) */}
      <div className="portfolio-chart-section">
        <div className="chart-header-section">
          <h2 className="section-title">Portfolio Performance</h2>
          <div className="time-filter-buttons">
            {(['7D', '30D', '90D', 'ALL'] as const).map((filter) => (
              <button
                key={filter}
                className={`time-filter-button ${timeFilter === filter ? 'active' : ''}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <PortfolioChart 
          portfolioHistory={portfolio.portfolioHistory} 
          timeFilter={timeFilter}
        />
      </div>

      {/* Active Trades Section (Current Positions) */}
      {portfolio.activeTrades.length > 0 && (
        <div className="active-trades-section">
          <h2 className="section-title">Active Trading Positions</h2>
          <div className="active-trades-list">
            {portfolio.activeTrades.map((trade) => {
              const pnlColor = trade.pnl >= 0 ? 'green' : 'red'
              return (
                <div key={trade.id} className="active-trade-card">
                  <div className="trade-header-row">
                    <span className="trade-pair">{trade.pair}</span>
                    <span className={`trade-direction-badge ${trade.direction.toLowerCase()}`}>
                      {trade.direction}
                    </span>
                    <span className="trade-status-badge active">ACTIVE</span>
                  </div>
                  <div className="trade-details-row">
                    <div className="trade-price-info">
                      <div>Entry: ${trade.entryPrice.toLocaleString()}</div>
                      <div>Current: ${trade.currentPrice.toLocaleString()}</div>
                    </div>
                    <div className={`trade-pnl ${pnlColor}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      <span className="pnl-percent">
                        ({trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="trade-meta-row">
                    <span className="trade-time-open">Opened {formatTimeAgo(trade.openedAt)}</span>
                    <span className="trade-notional">Notional: ${trade.notional}</span>
                  </div>
                  <button 
                    className="sell-to-create-card-button"
                    onClick={() => handleCloseTrade(trade)}
                  >
                    Sell to Create Card
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trade History (Closed Trades → Cards) */}
      {portfolio.tradeHistory.length > 0 && (
        <div className="trade-history-section">
          <div className="trade-history-header">
            <h2 className="section-title">Trade History</h2>
            <Link 
              href="/collection"
              className="view-all-cards-link"
            >
              View All Cards →
            </Link>
          </div>
          <div className="trade-history-list">
            {portfolio.tradeHistory.map((trade) => {
              const pnlColor = trade.pnl >= 0 ? 'green' : 'red'
              return (
                <div key={trade.id} className="trade-history-entry" id={`trade-${trade.id}`}>
                  <div className="trade-history-info">
                    <span className="trade-pair">{trade.pair}</span>
                    <span className={`trade-direction-badge ${trade.direction.toLowerCase()}`}>
                      {trade.direction}
                    </span>
                    <div className={`trade-pnl ${pnlColor}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </div>
                    <div className="trade-hold-time">Held for {trade.holdTime} days</div>
                    <div className="trade-closed-date">Closed {formatDate(trade.closedAt)}</div>
                  </div>
                  {trade.cardId ? (
                    <Link 
                      href={`/card/${trade.cardId}`} 
                      className="trade-card-link"
                    >
                      → Card: {portfolio.cards.find(c => c.id === trade.cardId)?.name || 'View Card'}
                    </Link>
                  ) : (
                    <span className="no-card-minted">No card minted</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

