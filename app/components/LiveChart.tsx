'use client'

/**
 * Live Chart Component
 * Displays animated candlestick chart with live movement
 */

import { useEffect, useRef, useState } from 'react'
import './styles/LiveChart.css'

export type TimePeriod = '15m' | '1h' | '1D'

interface LiveChartProps {
  price: number
  pair: string
  isLoading?: boolean
  timePeriod?: TimePeriod
}

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export default function LiveChart({ price, pair, isLoading, timePeriod = '15m' }: LiveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
  const [currentPrice, setCurrentPrice] = useState(price)
  const animationFrameRef = useRef<number>()
  const currentPeriodRef = useRef<{ open: number; high: number; low: number; startTime: number } | null>(null)

  // Calculate candle duration based on time period
  const getCandleDuration = (period: TimePeriod): number => {
    switch (period) {
      case '15m': return 15 * 60 * 1000 // 15 minutes
      case '1h': return 60 * 60 * 1000 // 1 hour
      case '1D': return 24 * 60 * 60 * 1000 // 1 day
      default: return 15 * 60 * 1000
    }
  }

  const candleDuration = getCandleDuration(timePeriod)

  // Initialize or update candlestick data when price changes
  useEffect(() => {
    if (!isLoading && price > 0) {
      const now = Date.now()
      
      // Initialize or update current period
      if (!currentPeriodRef.current) {
        currentPeriodRef.current = {
          open: price,
          high: price,
          low: price,
          startTime: now,
        }
        setCurrentPrice(price)
        return
      }

      const period = currentPeriodRef.current
      const periodDuration = candleDuration // Dynamic based on time period

      // Update high/low for current period
      period.high = Math.max(period.high, price)
      period.low = Math.min(period.low, price)
      setCurrentPrice(price)

      // If period is complete, create new candle
      if (now - period.startTime >= periodDuration) {
        const completedCandle: CandlestickData = {
          time: period.startTime,
          open: period.open,
          high: period.high,
          low: period.low,
          close: price,
        }

        setCandlestickData(prev => {
          const newData = [...prev, completedCandle]
          // Keep appropriate number of candles based on time period
          const maxCandles = timePeriod === '15m' ? 60 : timePeriod === '1h' ? 48 : 30
          return newData.slice(-maxCandles)
        })

        // Start new period
        currentPeriodRef.current = {
          open: price,
          high: price,
          low: price,
          startTime: now,
        }
      } else {
        // Update current period
        currentPeriodRef.current = period
      }
    }
  }, [price, isLoading, candleDuration, timePeriod])

  // Reset candlestick data when time period or pair changes
  useEffect(() => {
    if (candlestickData.length > 0) {
      setCandlestickData([])
      currentPeriodRef.current = null
    }
  }, [timePeriod, pair])

  // Initialize with mock data if empty - reset when pair or timePeriod changes
  useEffect(() => {
    // Reset when pair changes to force recalculation
    if (price > 0 && !isLoading && candlestickData.length === 0) {
      const now = Date.now()
      const initialData: CandlestickData[] = []
      let basePrice = price
      
      // Generate initial history based on time period
      // Show more candles for shorter periods
      const numCandles = timePeriod === '15m' ? 60 : timePeriod === '1h' ? 48 : 30
      
      // For different pairs, create realistic price variations based on pair type
      // Higher price pairs (like BTC) should have larger absolute variations
      const priceMultiplier = basePrice > 1000 ? 0.03 : basePrice > 100 ? 0.02 : 0.015
      
      for (let i = numCandles; i >= 0; i--) {
        const time = now - i * candleDuration
        const variation = (Math.random() - 0.5) * priceMultiplier * basePrice
        
        const open = basePrice
        const close = basePrice + variation
        const highVariation = Math.random() * priceMultiplier * 0.5 * basePrice
        const lowVariation = Math.random() * priceMultiplier * 0.5 * basePrice
        const high = Math.max(open, close) + highVariation
        const low = Math.min(open, close) - lowVariation
        
        initialData.push({ time, open, high, low, close })
        basePrice = close // Next candle opens at previous close
      }
      
      setCandlestickData(initialData)
      setCurrentPrice(price)
      // Reset current period to start fresh
      currentPeriodRef.current = {
        open: price,
        high: price,
        low: price,
        startTime: now,
      }
    }
  }, [price, isLoading, candlestickData.length, candleDuration, timePeriod, pair])

  // Animate chart updates - re-render when candlestick data or pair changes
  useEffect(() => {
    const animate = () => {
      if (svgRef.current && (candlestickData.length > 0 || currentPeriodRef.current)) {
        const svg = svgRef.current
        // Get dimensions from SVG element itself or parent container
        const container = svg.parentElement
        const containerWidth = (container?.clientWidth || svg.clientWidth || 800)
        const containerHeight = (container?.clientHeight || svg.clientHeight || 250)
        // Use full container width, accounting for container padding (8px each side)
        const width = Math.max(containerWidth - 16, svg.clientWidth || 800)
        const height = Math.max(containerHeight - 33, svg.clientHeight || 250) // 8px top + 25px bottom
        
        // Clear previous content
        while (svg.firstChild) {
          svg.removeChild(svg.firstChild)
        }

        // Calculate price bounds with proper padding based on actual data
        const allPrices = candlestickData.flatMap(c => [c.high, c.low, c.open, c.close])
        if (currentPeriodRef.current) {
          allPrices.push(currentPeriodRef.current.high, currentPeriodRef.current.low, currentPeriodRef.current.open)
        }
        if (currentPrice > 0) {
          allPrices.push(currentPrice) // Include current price
        }
        
        if (allPrices.length === 0) return
        
        const actualMin = Math.min(...allPrices)
        const actualMax = Math.max(...allPrices)
        const priceSpan = actualMax - actualMin
        
        // Add padding: 3% of price span, but at least 2% of current price (or mid-price if currentPrice not available)
        const midPrice = (actualMax + actualMin) / 2
        const referencePrice = currentPrice > 0 ? currentPrice : midPrice
        const paddingAmount = priceSpan > 0 
          ? Math.max(priceSpan * 0.03, referencePrice * 0.02)
          : referencePrice * 0.05
        
        const minPrice = Math.max(0, actualMin - paddingAmount)
        const maxPrice = actualMax + paddingAmount
        const priceRange = maxPrice - minPrice || 1

        // Draw Y-axis and grid lines with labels
        const yAxisPadding = 50 // Space for Y-axis labels
        const xAxisPadding = 20 // Space for X-axis labels
        const rightPadding = 5 // Space on right to prevent cutoff
        const leftPadding = 8 // Small padding from left edge
        const chartWidth = Math.max(0, width - yAxisPadding - rightPadding - leftPadding)
        const chartHeight = Math.max(0, height - xAxisPadding)
        const chartXOffset = yAxisPadding + leftPadding
        const chartYOffset = 0 // Start at top

        // Draw Y-axis line (vertical, from top to bottom) - make it thicker and more visible
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        yAxis.setAttribute('x1', String(chartXOffset))
        yAxis.setAttribute('y1', String(chartYOffset))
        yAxis.setAttribute('x2', String(chartXOffset))
        yAxis.setAttribute('y2', String(chartHeight + 1))
        yAxis.setAttribute('stroke', '#cbd5e1')
        yAxis.setAttribute('stroke-width', '2.5')
        yAxis.setAttribute('opacity', '1')
        svg.appendChild(yAxis)

        // Draw X-axis line (horizontal, at bottom of chart) - make it thicker and more visible
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        xAxis.setAttribute('x1', String(chartXOffset))
        xAxis.setAttribute('y1', String(chartHeight))
        xAxis.setAttribute('x2', String(chartXOffset + chartWidth))
        xAxis.setAttribute('y2', String(chartHeight))
        xAxis.setAttribute('stroke', '#cbd5e1')
        xAxis.setAttribute('stroke-width', '2.5')
        xAxis.setAttribute('opacity', '1')
        svg.appendChild(xAxis)

        // Draw origin point (intersection of axes) - make it larger and more visible
        const originCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        originCircle.setAttribute('cx', String(chartXOffset))
        originCircle.setAttribute('cy', String(chartHeight))
        originCircle.setAttribute('r', '4')
        originCircle.setAttribute('fill', '#cbd5e1')
        originCircle.setAttribute('stroke', '#fff')
        originCircle.setAttribute('stroke-width', '1')
        svg.appendChild(originCircle)

        // Draw Y-axis grid lines and labels
        for (let i = 0; i <= 4; i++) {
          const y = chartYOffset + (chartHeight / 4) * i
          const price = maxPrice - (i / 4) * priceRange
          
          // Grid line
          const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          gridLine.setAttribute('x1', String(chartXOffset))
          gridLine.setAttribute('y1', String(y))
          gridLine.setAttribute('x2', String(chartXOffset + chartWidth))
          gridLine.setAttribute('y2', String(y))
          gridLine.setAttribute('stroke', 'rgba(148,163,184,0.2)')
          gridLine.setAttribute('stroke-width', '1')
          svg.appendChild(gridLine)

          // Y-axis label - make sure it's visible
          const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          yLabel.setAttribute('x', String(chartXOffset - 12))
          yLabel.setAttribute('y', String(y))
          yLabel.setAttribute('fill', '#cbd5e1')
          yLabel.setAttribute('font-size', '12')
          yLabel.setAttribute('font-family', 'monospace')
          yLabel.setAttribute('text-anchor', 'end')
          yLabel.setAttribute('dominant-baseline', 'middle')
          yLabel.setAttribute('opacity', '1')
          yLabel.setAttribute('font-weight', '500')
          yLabel.textContent = `$${price.toFixed(2)}`
          svg.appendChild(yLabel)
        }

        // Draw candlesticks - ensure they fit within chart bounds
        const totalCandles = candlestickData.length + (currentPeriodRef.current ? 1 : 0)
        const candleWidth = totalCandles > 0 ? chartWidth / totalCandles : 0
        const candleBodyWidth = candleWidth * 0.6

        candlestickData.forEach((candle, index) => {
          const x = chartXOffset + (index * candleWidth) + (candleWidth / 2)
          const xCenter = x
          
          // Calculate Y positions (adjusted for chart area)
          const openY = chartYOffset + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight
          const closeY = chartYOffset + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight
          const highY = chartYOffset + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight
          const lowY = chartYOffset + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight

          const isBullish = candle.close >= candle.open
          const bodyTop = Math.min(openY, closeY)
          const bodyBottom = Math.max(openY, closeY)
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

          // Draw wick (shadow)
          const wick = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          wick.setAttribute('x1', String(xCenter))
          wick.setAttribute('y1', String(highY))
          wick.setAttribute('x2', String(xCenter))
          wick.setAttribute('y2', String(lowY))
          wick.setAttribute('stroke', isBullish ? '#10b981' : '#ef4444')
          wick.setAttribute('stroke-width', '1')
          svg.appendChild(wick)

          // Draw body
          const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          body.setAttribute('x', String(xCenter - candleBodyWidth / 2))
          body.setAttribute('y', String(bodyTop))
          body.setAttribute('width', String(candleBodyWidth))
          body.setAttribute('height', String(bodyHeight))
          body.setAttribute('fill', isBullish ? '#10b981' : '#ef4444')
          body.setAttribute('stroke', isBullish ? '#059669' : '#dc2626')
          body.setAttribute('stroke-width', '1')
          svg.appendChild(body)
        })

        // Draw X-axis labels (time markers) - ensure they're within SVG bounds
        const xLabelInterval = Math.max(1, Math.floor(candlestickData.length / 5))
        candlestickData.forEach((candle, index) => {
          if (index % xLabelInterval === 0 || index === candlestickData.length - 1) {
            const x = chartXOffset + (index * candleWidth) + (candleWidth / 2)
            // Skip if outside chart bounds
            if (x < chartXOffset || x > chartXOffset + chartWidth) return
            const xLabelY = chartHeight + 16 // Position within SVG bounds
            
            // Draw tick mark on axis - make it more visible
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            tick.setAttribute('x1', String(x))
            tick.setAttribute('y1', String(chartHeight - 1))
            tick.setAttribute('x2', String(x))
            tick.setAttribute('y2', String(chartHeight + 6))
            // Ensure tick is within bounds
            if (x < chartXOffset || x > chartXOffset + chartWidth) return
            tick.setAttribute('stroke', '#cbd5e1')
            tick.setAttribute('stroke-width', '2')
            tick.setAttribute('opacity', '1')
            svg.appendChild(tick)
            
            // Draw label text - make sure it's visible
            const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            xLabel.setAttribute('x', String(x))
            xLabel.setAttribute('y', String(xLabelY))
            xLabel.setAttribute('fill', '#cbd5e1')
            xLabel.setAttribute('font-size', '11')
            xLabel.setAttribute('font-family', 'monospace')
            xLabel.setAttribute('text-anchor', 'middle')
            xLabel.setAttribute('dominant-baseline', 'top')
            xLabel.setAttribute('opacity', '1')
            xLabel.setAttribute('font-weight', '500')
            
            // Format time based on time period
            const now = Date.now()
            const diff = now - candle.time
            let timeLabel = ''
            
            if (timePeriod === '1D') {
              const daysAgo = Math.floor(diff / (24 * 60 * 60 * 1000))
              const hoursAgo = Math.floor(diff / (60 * 60 * 1000))
              timeLabel = daysAgo > 0 ? `${daysAgo}d` : `${hoursAgo}h`
            } else if (timePeriod === '1h') {
              const hoursAgo = Math.floor(diff / (60 * 60 * 1000))
              const minutesAgo = Math.floor(diff / (60 * 1000))
              timeLabel = hoursAgo > 0 ? `${hoursAgo}h` : `${minutesAgo}m`
            } else {
              // 15m
              const minutesAgo = Math.floor(diff / (60 * 1000))
              const secondsAgo = Math.floor(diff / 1000)
              timeLabel = minutesAgo > 0 ? `${minutesAgo}m` : `${secondsAgo}s`
            }
            
            xLabel.textContent = timeLabel
            svg.appendChild(xLabel)
          }
        })

        // Draw current forming candle if exists - ensure it's within bounds
        if (currentPeriodRef.current && candleWidth > 0) {
          const period = currentPeriodRef.current
          const x = chartXOffset + (candlestickData.length * candleWidth) + (candleWidth / 2)
          const xCenter = x
          
          // Don't draw if outside chart bounds
          if (x < chartXOffset || x > chartXOffset + chartWidth) return

          const openY = chartYOffset + chartHeight - ((period.open - minPrice) / priceRange) * chartHeight
          const currentY = chartYOffset + chartHeight - ((currentPrice - minPrice) / priceRange) * chartHeight
          const highY = chartYOffset + chartHeight - ((period.high - minPrice) / priceRange) * chartHeight
          const lowY = chartYOffset + chartHeight - ((period.low - minPrice) / priceRange) * chartHeight

          const isBullish = currentPrice >= period.open
          const bodyTop = Math.min(openY, currentY)
          const bodyBottom = Math.max(openY, currentY)
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

          // Draw wick
          const wick = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          wick.setAttribute('x1', String(xCenter))
          wick.setAttribute('y1', String(highY))
          wick.setAttribute('x2', String(xCenter))
          wick.setAttribute('y2', String(lowY))
          wick.setAttribute('stroke', isBullish ? '#10b981' : '#ef4444')
          wick.setAttribute('stroke-width', '1')
          wick.setAttribute('opacity', '0.6')
          svg.appendChild(wick)

          // Draw body (forming candle - semi-transparent)
          const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          body.setAttribute('x', String(xCenter - candleBodyWidth / 2))
          body.setAttribute('y', String(bodyTop))
          body.setAttribute('width', String(candleBodyWidth))
          body.setAttribute('height', String(bodyHeight))
          body.setAttribute('fill', isBullish ? '#10b981' : '#ef4444')
          body.setAttribute('stroke', isBullish ? '#059669' : '#dc2626')
          body.setAttribute('stroke-width', '1')
          body.setAttribute('opacity', '0.6')
          svg.appendChild(body)
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [candlestickData, currentPrice, pair])

  // Simulate live price movements (for demo)
  useEffect(() => {
    if (isLoading || price === 0) return

    const interval = setInterval(() => {
      // Add slight random movement to simulate live updates
      const variation = (Math.random() - 0.5) * 0.002 * currentPrice // ±0.1% variation
      const simulatedPrice = Math.max(0.001, currentPrice + variation)
      setCurrentPrice(simulatedPrice)
      
      // Update current period if exists
      if (currentPeriodRef.current) {
        currentPeriodRef.current.high = Math.max(currentPeriodRef.current.high, simulatedPrice)
        currentPeriodRef.current.low = Math.min(currentPeriodRef.current.low, simulatedPrice)
      }
    }, 1000) // Update every 1 second

    return () => clearInterval(interval)
  }, [currentPrice, isLoading, price, candleDuration])

  if (isLoading) {
    return (
      <div className="live-chart-container">
        <div className="chart-loading">Loading chart data...</div>
      </div>
    )
  }

  return (
    <div className="live-chart-container">
      <svg
        ref={svgRef}
        className="live-chart-svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div className="chart-price-overlay">
        <span className="current-price-label">Current: ${currentPrice.toFixed(4)}</span>
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color bullish"></div>
          <span>Up</span>
        </div>
        <div className="legend-item">
          <div className="legend-color bearish"></div>
          <span>Down</span>
        </div>
      </div>
    </div>
  )
}
