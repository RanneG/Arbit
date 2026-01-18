'use client'

/**
 * Market Pairs Component
 * Displays live trading pairs available on Pear Protocol
 * Similar to Pear Garden's market selector
 */

import { useState, useEffect } from 'react'
import './styles/MarketPairs.css'

export interface TradingPair {
  symbol: string
  base: string
  quote: string
  price: number
  change24h: number
  volume24h: number
}

interface MarketPairsProps {
  onPairSelect?: (pair: string) => void
  selectedPair?: string | null
}

export default function MarketPairs({ onPairSelect, selectedPair }: MarketPairsProps) {
  const [pairs, setPairs] = useState<TradingPair[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPairs()
    // Refresh every 30 seconds
    const interval = setInterval(fetchPairs, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPairs = async () => {
    try {
      const response = await fetch('/api/market/pairs')
      if (response.ok) {
        const data = await response.json()
        setPairs(data)
      }
    } catch (error) {
      console.error('Failed to fetch market pairs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPairs = pairs.filter(pair =>
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.base.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePairClick = (pair: string) => {
    if (onPairSelect) {
      onPairSelect(pair)
    }
  }

  return (
    <div className="market-pairs-container">
      <div className="market-pairs-header">
        <h2 className="market-pairs-title">Market Pairs</h2>
        <input
          type="text"
          className="market-search-input"
          placeholder="Search pair..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="market-pairs-loading">
          <p>Loading market data...</p>
        </div>
      ) : (
        <div className="market-pairs-list">
          {filteredPairs.map((pair) => (
            <div
              key={pair.symbol}
              className={`market-pair-item ${selectedPair === pair.symbol ? 'selected' : ''}`}
              onClick={() => handlePairClick(pair.symbol)}
            >
              <div className="pair-symbol">
                <span className="pair-base">{pair.base}</span>
                {pair.quote !== 'USD' && (
                  <span className="pair-quote">/{pair.quote}</span>
                )}
              </div>
              <div className="pair-price">${pair.price.toFixed(4)}</div>
              <div className={`pair-change ${pair.change24h >= 0 ? 'positive' : 'negative'}`}>
                {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
              </div>
              <div className="pair-volume">
                ${(pair.volume24h / 1000000).toFixed(1)}M
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

