'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from './Card'
import WalletConnect from './WalletConnect'
import { Card as CardType } from '@/types/Card'
import './styles/Portfolio.css'

interface PortfolioData {
  walletAddress: string
  totalCards: number
  totalValue: number
  cards: CardType[]
  recentTrades: TradeHistory[]
  performance: {
    totalTrades: number
    winRate: number
    totalProfit: number
  }
  holdings?: {
    byRarity: Record<string, number>
    byFaction: Record<string, number>
    topCards: CardType[]
  }
}

interface TradeHistory {
  id: string
  cardId: string
  cardName: string
  type: 'buy' | 'sell'
  amount: number
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

const createMockPortfolio = (walletAddress: string, cards: CardType[] = []): PortfolioData => {
  const byRarity: Record<string, number> = {}
  const byFaction: Record<string, number> = {}
  
  cards.forEach(card => {
    byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1
    byFaction[card.faction] = (byFaction[card.faction] || 0) + 1
  })
  
  const topCards = [...cards]
    .sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))
    .slice(0, 5)
  
  return {
    walletAddress,
    totalCards: cards.length,
    totalValue: cards.reduce((sum, card) => sum + (card.marketValue || 0), 0),
    cards,
    recentTrades: [
      {
        id: '1',
        cardId: '1',
        cardName: cards[0]?.name || 'Nexus Prime',
        type: 'buy',
        amount: 10000,
        timestamp: new Date().toISOString(),
        status: 'completed',
      },
    ],
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
}

export default function Portfolio() {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)

  useEffect(() => {
    const loadPortfolio = async () => {
      const storedWallet = localStorage.getItem('walletAddress')
      
      if (!storedWallet) {
        setLoading(false)
        return
      }

      setWalletAddress(storedWallet)

      try {
        const response = await fetch(`/api/portfolio/${storedWallet}`)
        if (response.ok) {
          const data = await response.json()
          // Process holdings data if not present
          if (data.cards && data.cards.length > 0 && !data.holdings) {
            const byRarity: Record<string, number> = {}
            const byFaction: Record<string, number> = {}
            
            data.cards.forEach((card: CardType) => {
              byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1
              byFaction[card.faction] = (byFaction[card.faction] || 0) + 1
            })
            
            const topCards = [...data.cards]
              .sort((a: CardType, b: CardType) => (b.marketValue || 0) - (a.marketValue || 0))
              .slice(0, 5)
            
            data.holdings = {
              byRarity,
              byFaction,
              topCards,
            }
          }
          setPortfolio(data)
        } else {
          // Try to get user cards first
          try {
            const cardsResponse = await fetch(`/api/users/${storedWallet}/cards`)
            if (cardsResponse.ok) {
              const cardsData = await cardsResponse.json()
              setPortfolio(createMockPortfolio(storedWallet, cardsData.cards || []))
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

  const handleCardPress = (card: CardType) => {
    router.push(`/card/${card.id}`)
  }

  if (loading) {
    return (
      <div className="screen-container">
        <div className="loading-container">
          <p className="loading-text">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address || null)
    if (address) {
      // Reload portfolio data when wallet connects
      const loadPortfolio = async () => {
        setLoading(true)
        try {
          const response = await fetch(`/api/portfolio/${address}`)
          if (response.ok) {
            const data = await response.json()
            if (data.cards && data.cards.length > 0 && !data.holdings) {
              const byRarity: Record<string, number> = {}
              const byFaction: Record<string, number> = {}
              
              data.cards.forEach((card: CardType) => {
                byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1
                byFaction[card.faction] = (byFaction[card.faction] || 0) + 1
              })
              
              const topCards = [...data.cards]
                .sort((a: CardType, b: CardType) => (b.marketValue || 0) - (a.marketValue || 0))
                .slice(0, 5)
              
              data.holdings = {
                byRarity,
                byFaction,
                topCards,
              }
            }
            setPortfolio(data)
          } else {
            try {
              const cardsResponse = await fetch(`/api/users/${address}/cards`)
              if (cardsResponse.ok) {
                const cardsData = await cardsResponse.json()
                setPortfolio(createMockPortfolio(address, cardsData.cards || []))
              } else {
                setPortfolio(createMockPortfolio(address))
              }
            } catch {
              setPortfolio(createMockPortfolio(address))
            }
          }
        } catch (error) {
          setPortfolio(createMockPortfolio(address))
        } finally {
          setLoading(false)
        }
      }
      loadPortfolio()
    }
  }

  if (!walletAddress) {
    return (
      <div className="screen-container portfolio-container">
        <div className="header">
          <div className="header-title-container">
            <h1 className="header-title">Portfolio</h1>
            <div className="info-button-container">
              <button
                className="info-button"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                aria-label="Information about portfolio"
              >
                <span className="info-icon">i</span>
              </button>
              {showInfoTooltip && (
                <div className="info-tooltip">
                  View your trading card collection, portfolio value, holdings breakdown by rarity and faction, and your trading performance metrics.
                </div>
              )}
            </div>
          </div>
          <p className="header-subtitle">
            Connect your wallet to view your trading card portfolio
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
      <div className="screen-container">
        <div className="empty-container">
          <h2 className="empty-title">No Portfolio Data</h2>
          <p className="empty-text">
            Start trading to build your portfolio!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container portfolio-container">
      <div className="header">
        <div className="header-title-container">
          <h1 className="header-title">Portfolio</h1>
          <div className="info-button-container">
            <button
              className="info-button"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              aria-label="Information about portfolio"
            >
              <span className="info-icon">i</span>
            </button>
            {showInfoTooltip && (
              <div className="info-tooltip">
                View your trading card collection, portfolio value, holdings breakdown by rarity and faction, and your trading performance metrics.
              </div>
            )}
          </div>
        </div>
        <p className="header-subtitle">
          {portfolio.walletAddress.slice(0, 6)}...{portfolio.walletAddress.slice(-4)}
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="portfolio-stats">
        <div className="stat-card">
          <div className="stat-label">Total Cards</div>
          <div className="stat-value">{portfolio.totalCards}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">${portfolio.totalValue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{portfolio.performance.totalTrades}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{portfolio.performance.winRate}%</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-section">
        <h2 className="section-title">Performance</h2>
        <div className="performance-metrics">
          <div className="metric-item">
            <span className="metric-label">Total Profit</span>
            <span className="metric-value profit">
              +${portfolio.performance.totalProfit.toLocaleString()}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Win Rate</span>
            <span className="metric-value">{portfolio.performance.winRate}%</span>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      {portfolio.recentTrades.length > 0 && (
        <div className="trades-section">
          <h2 className="section-title">Recent Trades</h2>
          <div className="trades-list">
            {portfolio.recentTrades.map((trade) => (
              <div key={trade.id} className="trade-item">
                <div className="trade-info">
                  <span className="trade-card-name">{trade.cardName}</span>
                  <span className={`trade-type ${trade.type}`}>
                    {trade.type === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </div>
                <div className="trade-details">
                  <span className="trade-amount">${trade.amount.toLocaleString()}</span>
                  <span className={`trade-status ${trade.status}`}>
                    {trade.status}
                  </span>
                </div>
                <div className="trade-time">
                  {new Date(trade.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings Breakdown */}
      {portfolio.holdings && (
        <div className="holdings-section">
          <h2 className="section-title">Holdings Breakdown</h2>
          <div className="holdings-grid">
            <div className="holdings-card">
              <h3 className="holdings-subtitle">By Rarity</h3>
              <div className="holdings-list">
                {Object.entries(portfolio.holdings.byRarity).map(([rarity, count]) => (
                  <div key={rarity} className="holdings-item">
                    <span className="holdings-label">{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>
                    <span className="holdings-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="holdings-card">
              <h3 className="holdings-subtitle">By Faction</h3>
              <div className="holdings-list">
                {Object.entries(portfolio.holdings.byFaction).map(([faction, count]) => (
                  <div key={faction} className="holdings-item">
                    <span className="holdings-label">{faction.charAt(0).toUpperCase() + faction.slice(1)}</span>
                    <span className="holdings-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Valued Cards */}
      {portfolio.holdings && portfolio.holdings.topCards.length > 0 && (
        <div className="top-cards-section">
          <h2 className="section-title">Top Valued Cards</h2>
          <div className="cards-grid">
            {portfolio.holdings.topCards.map((card) => (
              <div key={card.id} className="card-with-value">
                <Card card={card} onPress={() => handleCardPress(card)} size="small" />
                <div className="card-value-badge">
                  ${(card.marketValue || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Cards */}
      {portfolio.cards.length > 0 && (
        <div className="collection-section">
          <h2 className="section-title">All Your Cards ({portfolio.cards.length})</h2>
          <div className="cards-grid">
            {portfolio.cards.map((card) => (
              <div key={card.id} className="card-with-value">
                <Card card={card} onPress={() => handleCardPress(card)} size="small" />
                <div className="card-value-badge">
                  ${(card.marketValue || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
