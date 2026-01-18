'use client'

import { useState, useEffect } from 'react'
import './styles/TradingCharts.css'

interface TradingData {
  portfolioValue: number[]
  profitLoss: number[]
  dates: string[]
  winRate: number
  totalTrades: number
}

interface TradingChartsProps {
  walletAddress: string | null
  tradingData?: TradingData
}

export default function TradingCharts({ walletAddress, tradingData }: TradingChartsProps) {
  const [showPortfolioInfo, setShowPortfolioInfo] = useState(false)
  const [showProfitInfo, setShowProfitInfo] = useState(false)
  const [showWinRateInfo, setShowWinRateInfo] = useState(false)
  const [chartData, setChartData] = useState<TradingData | null>(tradingData || null)
  const [loading, setLoading] = useState(!tradingData)

  useEffect(() => {
    if (!walletAddress || tradingData) {
      setLoading(false)
      return
    }

    const fetchChartData = async () => {
      try {
        const response = await fetch(`/api/trading/${walletAddress}/charts`)
        if (response.ok) {
          const data = await response.json()
          setChartData(data)
        } else {
          // Fallback to mock data
          setChartData({
            portfolioValue: [10000, 12000, 11500, 14000, 16000, 18000, 20000],
            profitLoss: [0, 2000, 1500, 4000, 6000, 8000, 10000],
            dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            winRate: 75,
            totalTrades: 12,
          })
        }
      } catch (error) {
        // Fallback to mock data
        setChartData({
          portfolioValue: [10000, 12000, 11500, 14000, 16000, 18000, 20000],
          profitLoss: [0, 2000, 1500, 4000, 6000, 8000, 10000],
          dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
          winRate: 75,
          totalTrades: 12,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [walletAddress, tradingData])

  if (!walletAddress) {
    return null
  }

  if (loading || !chartData) {
    return (
      <div className="trading-charts-container">
        <div className="charts-loading">
          <p>Loading trading data...</p>
        </div>
      </div>
    )
  }

  const data = chartData

  const maxValue = Math.max(...data.portfolioValue, ...data.profitLoss.map(v => Math.abs(v)))
  const minValue = Math.min(...data.profitLoss)

  // Calculate chart dimensions
  const chartWidth = 600
  const chartHeight = 200
  const padding = 40
  const chartAreaWidth = chartWidth - padding * 2
  const chartAreaHeight = chartHeight - padding * 2

  // Generate portfolio value path
  const portfolioPoints = data.portfolioValue.map((value, index) => {
    const x = padding + (index / (data.portfolioValue.length - 1)) * chartAreaWidth
    const y = padding + chartAreaHeight - (value / maxValue) * chartAreaHeight
    return `${x},${y}`
  }).join(' ')

  // Generate profit/loss path
  const profitLossPoints = data.profitLoss.map((value, index) => {
    const x = padding + (index / (data.profitLoss.length - 1)) * chartAreaWidth
    const normalizedValue = value - minValue
    const range = maxValue - minValue
    const y = padding + chartAreaHeight - (normalizedValue / range) * chartAreaHeight
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="trading-charts-container">
      <h2 className="charts-section-title">
        Trading Performance
        <span className="info-button-small" 
              onMouseEnter={() => setShowPortfolioInfo(true)}
              onMouseLeave={() => setShowPortfolioInfo(false)}
              onClick={() => setShowPortfolioInfo(!showPortfolioInfo)}>
          <span className="info-icon-small">i</span>
          {showPortfolioInfo && (
            <div className="info-tooltip-small">
              View your trading performance metrics and portfolio value over time
            </div>
          )}
        </span>
      </h2>

      <div className="charts-grid">
        {/* Portfolio Value Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Portfolio Value</h3>
            <div className="info-button-small" 
                 onMouseEnter={() => setShowPortfolioInfo(true)}
                 onMouseLeave={() => setShowPortfolioInfo(false)}
                 onClick={() => setShowPortfolioInfo(!showPortfolioInfo)}>
              <span className="info-icon-small">i</span>
              {showPortfolioInfo && (
                <div className="info-tooltip-small">
                  Shows how your total portfolio value changes over time based on your card holdings and trades
                </div>
              )}
            </div>
          </div>
          <div className="chart-value">${data.portfolioValue[data.portfolioValue.length - 1].toLocaleString()}</div>
          <div className="chart-container">
            <svg width={chartWidth} height={chartHeight} className="chart-svg">
              <defs>
                <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1={padding}
                  y1={padding + (i / 4) * chartAreaHeight}
                  x2={chartWidth - padding}
                  y2={padding + (i / 4) * chartAreaHeight}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
              ))}
              {/* Area under curve */}
              <polygon
                points={`${padding},${padding + chartAreaHeight} ${portfolioPoints} ${chartWidth - padding},${padding + chartAreaHeight}`}
                fill="url(#portfolioGradient)"
              />
              {/* Portfolio value line */}
              <polyline
                points={portfolioPoints}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {data.portfolioValue.map((value, index) => {
                const x = padding + (index / (data.portfolioValue.length - 1)) * chartAreaWidth
                const y = padding + chartAreaHeight - (value / maxValue) * chartAreaHeight
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#8b5cf6"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )
              })}
              {/* X-axis labels */}
              {data.dates.map((date, index) => {
                const x = padding + (index / (data.dates.length - 1)) * chartAreaWidth
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 10}
                    fill="#aaa"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {date}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Profit/Loss Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Profit & Loss</h3>
            <div className="info-button-small" 
                 onMouseEnter={() => setShowProfitInfo(true)}
                 onMouseLeave={() => setShowProfitInfo(false)}
                 onClick={() => setShowProfitInfo(!showProfitInfo)}>
              <span className="info-icon-small">i</span>
              {showProfitInfo && (
                <div className="info-tooltip-small">
                  Tracks your cumulative profit or loss from all trades. Green indicates profit, red indicates loss
                </div>
              )}
            </div>
          </div>
          <div className={`chart-value ${data.profitLoss[data.profitLoss.length - 1] >= 0 ? 'profit' : 'loss'}`}>
            {data.profitLoss[data.profitLoss.length - 1] >= 0 ? '+' : ''}
            ${data.profitLoss[data.profitLoss.length - 1].toLocaleString()}
          </div>
          <div className="chart-container">
            <svg width={chartWidth} height={chartHeight} className="chart-svg">
              <defs>
                <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
                </linearGradient>
              </defs>
              {/* Zero line */}
              <line
                x1={padding}
                y1={padding + chartAreaHeight / 2}
                x2={chartWidth - padding}
                y2={padding + chartAreaHeight / 2}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1={padding}
                  y1={padding + (i / 4) * chartAreaHeight}
                  x2={chartWidth - padding}
                  y2={padding + (i / 4) * chartAreaHeight}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
              ))}
              {/* Area under curve */}
              <polygon
                points={`${padding},${padding + chartAreaHeight / 2} ${profitLossPoints} ${chartWidth - padding},${padding + chartAreaHeight / 2}`}
                fill="url(#profitGradient)"
              />
              {/* Profit/Loss line */}
              <polyline
                points={profitLossPoints}
                fill="none"
                stroke={data.profitLoss[data.profitLoss.length - 1] >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {data.profitLoss.map((value, index) => {
                const x = padding + (index / (data.profitLoss.length - 1)) * chartAreaWidth
                const normalizedValue = value - minValue
                const range = maxValue - minValue
                const y = padding + chartAreaHeight - (normalizedValue / range) * chartAreaHeight
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={value >= 0 ? '#10b981' : '#ef4444'}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                )
              })}
              {/* X-axis labels */}
              {data.dates.map((date, index) => {
                const x = padding + (index / (data.dates.length - 1)) * chartAreaWidth
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 10}
                    fill="#aaa"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {date}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Win Rate Gauge */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Win Rate</h3>
            <div className="info-button-small" 
                 onMouseEnter={() => setShowWinRateInfo(true)}
                 onMouseLeave={() => setShowWinRateInfo(false)}
                 onClick={() => setShowWinRateInfo(!showWinRateInfo)}>
              <span className="info-icon-small">i</span>
              {showWinRateInfo && (
                <div className="info-tooltip-small">
                  Percentage of profitable trades out of your total trades. Higher is better!
                </div>
              )}
            </div>
          </div>
          <div className="gauge-container">
            <svg width="200" height="200" className="gauge-svg">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - data.winRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
              <text
                x="100"
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="36"
                fontWeight="bold"
              >
                {data.winRate}%
              </text>
              <text
                x="100"
                y="130"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#aaa"
                fontSize="12"
              >
                {data.totalTrades} trades
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
