'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from './Card'
import TradingCharts from './TradingCharts'
import WalletConnect from './WalletConnect'
import { Card as CardType } from '@/types/Card'
import { mockCards } from '@/lib/mockCards'
import './styles/Trading.css'

interface TradeResult {
  success: boolean
  orderId?: string
  message?: string
  error?: string
}

export default function Trading() {
  const router = useRouter()
  const [cards] = useState<CardType[]>(mockCards)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isTrading, setIsTrading] = useState(false)
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)

  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress')
    setWalletAddress(storedWallet)
  }, [])

  const handleCardSelect = (card: CardType) => {
    setSelectedCard(card)
    setTradeResult(null)
  }

  const handleTrade = async () => {
    if (!selectedCard || !walletAddress) {
      setTradeResult({
        success: false,
        error: 'Please connect your wallet and select a card',
      })
      return
    }

    setIsTrading(true)
    setTradeResult(null)

    try {
      const response = await fetch(`/api/cards/${selectedCard.id}/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setTradeResult({
          success: true,
          orderId: data.orderId,
          message: `Trade executed successfully for ${selectedCard.name}`,
        })
      } else {
        setTradeResult({
          success: false,
          error: data.error || 'Trade execution failed',
        })
      }
    } catch (error) {
      setTradeResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute trade',
      })
    } finally {
      setIsTrading(false)
    }
  }

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address || null)
  }

  if (!walletAddress) {
    return (
      <div className="screen-container trading-container">
        <div className="header">
          <div className="header-title-container">
            <h1 className="header-title">Trading</h1>
            <div className="info-button-container">
              <button
                className="info-button"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                aria-label="Information about trading"
              >
                <span className="info-icon">i</span>
              </button>
              {showInfoTooltip && (
                <div className="info-tooltip">
                  Execute trades on trading cards through Pear Protocol. View your trading performance charts, select cards to trade, and monitor your profit & loss over time.
                </div>
              )}
            </div>
          </div>
          <p className="header-subtitle">
            Connect your wallet to start trading cards via Pear Protocol
          </p>
        </div>
        <div className="wallet-connect-section">
          <WalletConnect onConnected={handleWalletConnected} />
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container trading-container">
      <div className="header">
        <div className="header-title-container">
          <h1 className="header-title">Trading</h1>
          <div className="info-button-container">
            <button
              className="info-button"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              aria-label="Information about trading"
            >
              <span className="info-icon">i</span>
            </button>
            {showInfoTooltip && (
              <div className="info-tooltip">
                Execute trades on trading cards through Pear Protocol. View your trading performance charts, select cards to trade, and monitor your profit & loss over time.
              </div>
            )}
          </div>
        </div>
        <p className="header-subtitle">
          Select a card to execute a trade via Pear Protocol
        </p>
      </div>

      {/* Trading Performance Charts */}
      <TradingCharts walletAddress={walletAddress} />

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Trade Result Banner */}
      {tradeResult && (
        <div
          className={`trade-result-banner ${
            tradeResult.success ? 'success' : 'error'
          }`}
        >
          {tradeResult.success ? (
            <div>
              <p className="result-message">✅ {tradeResult.message}</p>
              {tradeResult.orderId && (
                <p className="result-order-id">Order ID: {tradeResult.orderId}</p>
              )}
            </div>
          ) : (
            <div>
              <p className="result-message">❌ {tradeResult.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="trading-content">
        {/* Cards Grid */}
        <div className="cards-section">
          <h2 className="section-title">Available Cards</h2>
          <div className="cards-grid">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className={`card-wrapper ${selectedCard?.id === card.id ? 'selected' : ''}`}
                onClick={() => handleCardSelect(card)}
              >
                <Card card={card} size="small" />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Card & Trade Panel */}
        {selectedCard && (
          <div className="trade-panel">
            <h2 className="section-title">Trade Details</h2>
            <div className="selected-card-display">
              <Card card={selectedCard} size="medium" />
            </div>
            <div className="trade-info">
              <div className="info-row">
                <span className="info-label">Card:</span>
                <span className="info-value">{selectedCard.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Trading Pair:</span>
                <span className="info-value">{selectedCard.tradingPair || 'BTC/USD'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Market Value:</span>
                <span className="info-value">
                  ${selectedCard.marketValue?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Buy Up:</span>
                <span className="info-value">{selectedCard.stats.longPosition}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Sell Down:</span>
                <span className="info-value">{selectedCard.stats.shortPosition}</span>
              </div>
            </div>
            <button
              className="trade-button"
              onClick={handleTrade}
              disabled={isTrading}
            >
              {isTrading ? 'Executing Trade...' : 'Execute Trade'}
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isTrading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Executing trade through Pear Protocol...</p>
          </div>
        </div>
      )}
    </div>
  )
}
