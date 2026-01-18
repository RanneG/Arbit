'use client'

/**
 * Trading Component
 * Pear Garden-style trading interface for live market data and pair/basket trading
 * Inspired by: https://app.pear.garden/trade/hl/HYPE-ETH
 * 
 * Features:
 * - Live market pairs list
 * - Price charts and pair visualization
 * - Long/Short asset selectors with custom basket support
 * - Market and Limit order types
 * - Trade execution via Pear Protocol API
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MarketPairs from './MarketPairs'
import LiveChart, { TimePeriod } from './LiveChart'
import './styles/Trading.css'

// Hardcoded list of major tokens available on Pear Protocol
const AVAILABLE_TOKENS = [
  'HYPE',
  'ETH',
  'SOL',
  'BTC',
  'USDC',
  'AI',
  'ML',
  'DOGE',
  'ARB',
  'MATIC',
  'LINK',
  'UNI',
]

interface BasketAsset {
  token: string
  weight: number
  notional: number
}

interface MarketTicker {
  pair: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export default function Trading() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  
  // Long and Short baskets
  const [longAssets, setLongAssets] = useState<BasketAsset[]>([])
  const [shortAssets, setShortAssets] = useState<BasketAsset[]>([])
  
  // Order configuration
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [totalNotional, setTotalNotional] = useState<string>('10')
  
  // Selected pair from market pairs
  const [selectedPair, setSelectedPair] = useState<string | null>(null)
  const [pairTicker, setPairTicker] = useState<MarketTicker | null>(null)
  const [loadingTicker, setLoadingTicker] = useState(false)
  const [availablePairs, setAvailablePairs] = useState<string[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('15m')
  
  // Trade execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Token selection dropdowns
  const [longTokenInput, setLongTokenInput] = useState('')
  const [shortTokenInput, setShortTokenInput] = useState('')

  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress')
    setWalletAddress(storedWallet || null)
  }, [])

  // Load first market pair by default
  useEffect(() => {
    const loadFirstPair = async () => {
      try {
        const response = await fetch('/api/market/pairs')
        if (response.ok) {
          const pairs: any[] = await response.json()
          if (pairs.length > 0 && !selectedPair) {
            const firstPair = pairs[0].symbol
            setAvailablePairs(pairs.map(p => p.symbol))
            // Set pair directly without triggering basket update on initial load
            setSelectedPair(firstPair)
            fetchTicker(firstPair)
          }
        }
      } catch (err) {
        console.error('Failed to load first pair:', err)
      }
    }
    loadFirstPair()
  }, [])

  // Fetch ticker when pair is selected
  useEffect(() => {
    if (selectedPair) {
      fetchTicker(selectedPair)
      // Refresh ticker every 3 seconds for live updates
      const interval = setInterval(() => fetchTicker(selectedPair), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPair])

  // Update pair info when baskets change
  useEffect(() => {
    if (longAssets.length > 0 || shortAssets.length > 0) {
      updatePairFromBaskets()
    }
  }, [longAssets, shortAssets])

  const fetchTicker = async (pair: string) => {
    setLoadingTicker(true)
    try {
      const response = await fetch(`/api/market/ticker?pair=${pair}`)
      if (response.ok) {
        const data = await response.json()
        setPairTicker(data)
      }
    } catch (err) {
      console.error('Failed to fetch ticker:', err)
    } finally {
      setLoadingTicker(false)
    }
  }

  const updatePairFromBaskets = async () => {
    if (longAssets.length === 0 && shortAssets.length === 0) {
      setPairTicker(null)
      setSelectedPair(null)
      return
    }
    
    const longSymbols = longAssets.map(a => a.token).join('+')
    const shortSymbols = shortAssets.map(a => a.token).join('+')
    const pair = shortSymbols ? `${longSymbols}-${shortSymbols}` : longSymbols
    
    setSelectedPair(pair)
    fetchTicker(pair)
  }

  const handlePairSelect = (pair: string) => {
    setSelectedPair(pair)
    // Parse pair (e.g., "HYPE-ETH" -> long: HYPE, short: ETH)
    if (pair.includes('-')) {
      const [long, short] = pair.split('-')
      if (long && short) {
        setLongAssets([{ token: long, weight: 1.0, notional: parseFloat(totalNotional) || 10 }])
        setShortAssets([{ token: short, weight: 1.0, notional: parseFloat(totalNotional) || 10 }])
      }
    } else {
      // Single asset - add to long
      setLongAssets([{ token: pair, weight: 1.0, notional: parseFloat(totalNotional) || 10 }])
      setShortAssets([])
    }
  }

  const addLongAsset = () => {
    if (!longTokenInput.trim()) return
    
    const token = longTokenInput.trim().toUpperCase()
    if (!AVAILABLE_TOKENS.includes(token)) {
      setError(`Token ${token} is not available. Available: ${AVAILABLE_TOKENS.join(', ')}`)
      return
    }

    if (longAssets.some(a => a.token === token)) {
      setError(`Token ${token} is already in the long basket`)
      return
    }

    const notional = parseFloat(totalNotional) || 10
    // When adding a new asset, distribute weights equally among all assets (existing + new)
    const newLongAssets = [...longAssets, {
      token,
      weight: 1.0 / (longAssets.length + 1), // Equal weight: 1 / total count
      notional: notional / (longAssets.length + 1),
    }]
    
    // Normalize all weights to sum to 1.0
    const normalized = newLongAssets.map(a => ({
      ...a,
      weight: 1.0 / newLongAssets.length, // Ensure equal weights
    }))

    setLongAssets(normalized)
    setLongTokenInput('')
    setError(null)
  }

  const addShortAsset = () => {
    if (!shortTokenInput.trim()) return
    
    const token = shortTokenInput.trim().toUpperCase()
    if (!AVAILABLE_TOKENS.includes(token)) {
      setError(`Token ${token} is not available. Available: ${AVAILABLE_TOKENS.join(', ')}`)
      return
    }

    if (shortAssets.some(a => a.token === token)) {
      setError(`Token ${token} is already in the short basket`)
      return
    }

    const notional = parseFloat(totalNotional) || 10
    // When adding a new asset, distribute weights equally among all assets (existing + new)
    const newShortAssets = [...shortAssets, {
      token,
      weight: 1.0 / (shortAssets.length + 1), // Equal weight: 1 / total count
      notional: notional / (shortAssets.length + 1),
    }]
    
    // Normalize all weights to sum to 1.0
    const normalized = newShortAssets.map(a => ({
      ...a,
      weight: 1.0 / newShortAssets.length, // Ensure equal weights
    }))

    setShortAssets(normalized)
    setShortTokenInput('')
    setError(null)
  }

  const removeLongAsset = (index: number) => {
    const newAssets = longAssets.filter((_, i) => i !== index)
    if (newAssets.length > 0) {
      // Normalize weights after removal so they sum to 1.0
      const normalized = newAssets.map(a => ({
        ...a,
        weight: 1.0 / newAssets.length, // Equal weights after removal
      }))
      setLongAssets(normalized)
    } else {
      setLongAssets([])
    }
  }

  const removeShortAsset = (index: number) => {
    const newAssets = shortAssets.filter((_, i) => i !== index)
    if (newAssets.length > 0) {
      // Normalize weights after removal so they sum to 1.0
      const normalized = newAssets.map(a => ({
        ...a,
        weight: 1.0 / newAssets.length, // Equal weights after removal
      }))
      setShortAssets(normalized)
    } else {
      setShortAssets([])
    }
  }

  const updateLongWeight = (index: number, weight: number) => {
    const newAssets = [...longAssets]
    newAssets[index].weight = Math.max(0, Math.min(1, weight))
    setLongAssets(newAssets)
  }

  const updateShortWeight = (index: number, weight: number) => {
    const newAssets = [...shortAssets]
    newAssets[index].weight = Math.max(0, Math.min(1, weight))
    setShortAssets(newAssets)
  }

  const normalizeWeights = (assets: BasketAsset[], type: 'long' | 'short') => {
    const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0)
    if (totalWeight === 0) return
    
    const normalized = assets.map(a => ({
      ...a,
      weight: a.weight / totalWeight,
    }))
    
    if (type === 'long') {
      setLongAssets(normalized)
    } else {
      setShortAssets(normalized)
    }
  }

  const validateTrade = (): string | null => {
    if (longAssets.length === 0 && shortAssets.length === 0) {
      return 'Please add at least one asset to Long or Short basket'
    }

    const notional = parseFloat(totalNotional)
    if (!notional || notional <= 0) {
      return 'Notional value must be greater than 0'
    }

    const longWeightSum = longAssets.reduce((sum, a) => sum + a.weight, 0)
    if (longAssets.length > 0 && Math.abs(longWeightSum - 1.0) > 0.01) {
      return `Long weights must sum to 1.0 (currently ${longWeightSum.toFixed(2)})`
    }

    const shortWeightSum = shortAssets.reduce((sum, a) => sum + a.weight, 0)
    if (shortAssets.length > 0 && Math.abs(shortWeightSum - 1.0) > 0.01) {
      return `Short weights must sum to 1.0 (currently ${shortWeightSum.toFixed(2)})`
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      return 'Please enter a valid limit price'
    }

    return null
  }

  const executeTrade = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    const validationError = validateTrade()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsExecuting(true)
    setError(null)

    try {
      const payload = {
        long: longAssets.map(a => a.token),
        short: shortAssets.map(a => a.token),
        weightsLong: longAssets.map(a => a.weight),
        weightsShort: shortAssets.map(a => a.weight),
        notional: parseFloat(totalNotional),
        orderType,
        ...(orderType === 'limit' && { limitPrice: parseFloat(limitPrice) }),
      }


      const response = await fetch('/api/execute-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Trade execution failed')
      }

      router.push(`/trade/confirmation?orderId=${data.orderId}&notional=${totalNotional}&pair=${selectedPair || ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade')
      console.error('Trade execution error:', err)
    } finally {
      setIsExecuting(false)
    }
  }

  const resetBuilder = () => {
    setLongAssets([])
    setShortAssets([])
    setLongTokenInput('')
    setShortTokenInput('')
    setTotalNotional('10')
    setLimitPrice('')
    setOrderType('market')
    setPairTicker(null)
    setSelectedPair(null)
    setError(null)
  }

  const notional = parseFloat(totalNotional) || 0
  const estimatedFees = notional * 0.001

  return (
    <div className="screen-container trading-container">
      <div className="header">
        <div className="header-title-container">
          <h1 className="header-title">Trading</h1>
        </div>
        <p className="header-subtitle">
          Live market data and custom pair/basket trades via Pear Protocol
        </p>
      </div>

      {!walletAddress && (
        <div className="wallet-banner">
          <div className="wallet-banner-content">
            <p>Connect your wallet to execute trades</p>
          </div>
        </div>
      )}

      {error && (
        <div className="trade-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Main Layout: Pear Garden Style */}
      <div className="pear-trading-layout">
        {/* Left: Market Pairs */}
        <div className="market-pairs-panel">
          <MarketPairs onPairSelect={handlePairSelect} selectedPair={selectedPair} />
        </div>

        {/* Center: Chart and Pair Info */}
        <div className="chart-panel">
          <div className="chart-header">
            <div className="pair-display">
              {pairTicker ? (
                <>
                  <h2 className="current-pair">{pairTicker.pair}</h2>
                  <div className="pair-price-large">${pairTicker.price.toFixed(4)}</div>
                  <div className={`pair-change-large ${pairTicker.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {pairTicker.change24h >= 0 ? '+' : ''}{pairTicker.change24h.toFixed(2)}%
                  </div>
                </>
              ) : (
                <h2 className="current-pair">Select a pair to view chart</h2>
              )}
            </div>
            {pairTicker && (
              <div className="pair-stats">
                <div className="stat-item">
                  <span className="stat-label">24h High:</span>
                  <span className="stat-value">${pairTicker.high24h.toFixed(4)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">24h Low:</span>
                  <span className="stat-value">${pairTicker.low24h.toFixed(4)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">24h Volume:</span>
                  <span className="stat-value">${(pairTicker.volume24h / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            )}
          </div>

          {/* Time Period Selector */}
          <div className="time-period-selector">
            <button
              className={`time-period-button ${timePeriod === '15m' ? 'active' : ''}`}
              onClick={() => setTimePeriod('15m')}
            >
              15m
            </button>
            <button
              className={`time-period-button ${timePeriod === '1h' ? 'active' : ''}`}
              onClick={() => setTimePeriod('1h')}
            >
              1h
            </button>
            <button
              className={`time-period-button ${timePeriod === '1D' ? 'active' : ''}`}
              onClick={() => setTimePeriod('1D')}
            >
              1D
            </button>
          </div>

          {/* Live Chart */}
          <div className="chart-container">
            {pairTicker ? (
              <LiveChart 
                price={pairTicker.price} 
                pair={pairTicker.pair} 
                isLoading={loadingTicker}
                timePeriod={timePeriod}
              />
            ) : (
              <div className="chart-empty">
                <p>Select a trading pair from the market list to view price chart and data</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Trade Builder */}
        <div className="trade-builder-sidebar">
          <div className="trade-builder-content">
            {/* Long Basket */}
            <div className="basket-section">
              <div className="basket-header">
                <h3 className="basket-title">Long</h3>
              </div>
              
              <div className="token-input-group">
                <select
                  className="token-select"
                  value={longTokenInput}
                  onChange={(e) => setLongTokenInput(e.target.value)}
                >
                  <option value="">Select token...</option>
                  {AVAILABLE_TOKENS.filter(t => !longAssets.some(a => a.token === t)).map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
                <button
                  className="add-asset-button"
                  onClick={addLongAsset}
                  disabled={!longTokenInput}
                >
                  +
                </button>
              </div>

              <div className="assets-list">
                {longAssets.map((asset, index) => (
                  <div key={index} className="asset-row">
                    <div className="asset-token">{asset.token}</div>
                    <div className="asset-weight-input">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={asset.weight.toFixed(2)}
                        onChange={(e) => updateLongWeight(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <button
                      className="remove-asset-button"
                      onClick={() => removeLongAsset(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Short Basket */}
            <div className="basket-section">
              <div className="basket-header">
                <h3 className="basket-title">Short</h3>
              </div>
              
              <div className="token-input-group">
                <select
                  className="token-select"
                  value={shortTokenInput}
                  onChange={(e) => setShortTokenInput(e.target.value)}
                >
                  <option value="">Select token...</option>
                  {AVAILABLE_TOKENS.filter(t => !shortAssets.some(a => a.token === t)).map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
                <button
                  className="add-asset-button"
                  onClick={addShortAsset}
                  disabled={!shortTokenInput}
                >
                  +
                </button>
              </div>

              <div className="assets-list">
                {shortAssets.map((asset, index) => (
                  <div key={index} className="asset-row">
                    <div className="asset-token">{asset.token}</div>
                    <div className="asset-weight-input">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={asset.weight.toFixed(2)}
                        onChange={(e) => updateShortWeight(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <button
                      className="remove-asset-button"
                      onClick={() => removeShortAsset(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Configuration */}
            <div className="order-config-section">
              <div className="notional-input-group">
                <label>Notional ($):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalNotional}
                  onChange={(e) => setTotalNotional(e.target.value)}
                />
              </div>

              <div className="order-type-group">
                <button
                  className={`order-type-button ${orderType === 'market' ? 'active' : ''}`}
                  onClick={() => setOrderType('market')}
                >
                  Market
                </button>
                <button
                  className={`order-type-button ${orderType === 'limit' ? 'active' : ''}`}
                  onClick={() => setOrderType('limit')}
                >
                  Limit
                </button>
              </div>

              {orderType === 'limit' && (
                <div className="limit-price-input-group">
                  <label>Limit Price:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Enter limit price"
                  />
                </div>
              )}

              <button className="reset-button" onClick={resetBuilder}>
                Reset
              </button>
            </div>

            {/* Trade Summary */}
            <div className="trade-summary-section">
              <h3>Summary</h3>
              
              <div className="summary-item">
                <span>Long:</span>
                <span>{longAssets.length > 0 ? longAssets.map(a => a.token).join(' + ') : 'None'}</span>
              </div>

              <div className="summary-item">
                <span>Short:</span>
                <span>{shortAssets.length > 0 ? shortAssets.map(a => a.token).join(' + ') : 'None'}</span>
              </div>

              <div className="summary-item">
                <span>Notional:</span>
                <span>${notional.toFixed(2)}</span>
              </div>

              <div className="summary-item">
                <span>Fees:</span>
                <span>${estimatedFees.toFixed(2)}</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              className="execute-trade-button"
              onClick={executeTrade}
              disabled={isExecuting || !walletAddress}
            >
              {isExecuting ? 'Executing...' : 'Execute Trade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
