'use client'

/**
 * Portfolio Performance Chart Component
 * Shows TOTAL portfolio value over time (active trades + cards)
 */

import { useRef, useEffect, useState } from 'react'
import './styles/PortfolioChart.css'

interface TimeSeriesPoint {
  timestamp: string
  totalValue: number
  activeTradesValue?: number
  cardsValue?: number
}

interface PortfolioChartProps {
  portfolioHistory: TimeSeriesPoint[]
  timeFilter: '7D' | '30D' | '90D' | 'ALL'
}

export default function PortfolioChart({ portfolioHistory, timeFilter }: PortfolioChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const isDrawingRef = useRef(false)
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 })

  // Update dimensions from container size
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect()
      const width = rect.width || 800
      const height = rect.height || 300
      
      if (width > 0 && height > 0) {
        setDimensions(prev => {
          // Only update if dimensions actually changed (with 1px tolerance)
          if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
            return prev
          }
          return { width, height }
        })
      }
    }

    // Initial measurement
    const rafId = requestAnimationFrame(() => {
      updateDimensions()
    })

    // Use ResizeObserver for accurate size tracking
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (width > 0 && height > 0) {
            setDimensions(prev => {
              if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
                return prev
              }
              return { width, height }
            })
          }
        }
      })
      resizeObserverRef.current.observe(container)
    }

    const handleResize = () => {
      updateDimensions()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [])

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || portfolioHistory.length === 0) return
    if (dimensions.width === 0 || dimensions.height === 0) return
    if (isDrawingRef.current) return // Prevent overlapping draws

    isDrawingRef.current = true

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      isDrawingRef.current = false
      return
    }

    const dpr = window.devicePixelRatio || 1
    const width = dimensions.width
    const height = dimensions.height
    
    // Reset context transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    
    // Set canvas internal resolution (affects quality, not display size)
    canvas.width = width * dpr
    canvas.height = height * dpr
    
    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr)
    
    // Drawing dimensions (logical pixels after scaling)
    const logicalWidth = width
    const logicalHeight = height
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }

    // Filter data based on time filter
    const now = Date.now()
    const filterMs: Record<string, number> = {
      '7D': 7 * 24 * 60 * 60 * 1000,
      '30D': 30 * 24 * 60 * 60 * 1000,
      '90D': 90 * 24 * 60 * 60 * 1000,
      'ALL': Infinity,
    }

    const filteredData = portfolioHistory
      .filter((point) => {
        const pointTime = new Date(point.timestamp).getTime()
        return now - pointTime <= filterMs[timeFilter]
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    if (filteredData.length === 0) {
      ctx.clearRect(0, 0, logicalWidth, logicalHeight)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No data available for selected period', logicalWidth / 2, logicalHeight / 2)
      isDrawingRef.current = false
      return
    }

    // Calculate value range
    const values = filteredData.map((p) => p.totalValue)
    const minValue = Math.max(0, Math.min(...values) * 0.9)
    const maxValue = Math.max(...values) * 1.1
    const valueRange = maxValue - minValue || 1

    // Chart drawing area
    const chartWidth = logicalWidth - padding.left - padding.right
    const chartHeight = logicalHeight - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, logicalWidth, logicalHeight)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    ctx.lineWidth = 1

    const numGridLines = 5
    for (let i = 0; i <= numGridLines; i++) {
      const y = padding.top + (chartHeight / numGridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(logicalWidth - padding.right, y)
      ctx.stroke()
    }

    // Draw data line
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 3
    ctx.beginPath()

    const dataLength = filteredData.length
    filteredData.forEach((point, index) => {
      const x = padding.left + (chartWidth / (dataLength - 1 || 1)) * index
      const normalizedValue = (point.totalValue - minValue) / valueRange
      const y = padding.top + chartHeight * (1 - normalizedValue)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    ctx.fillStyle = '#8b5cf6'
    filteredData.forEach((point, index) => {
      const x = padding.left + (chartWidth / (dataLength - 1 || 1)) * index
      const normalizedValue = (point.totalValue - minValue) / valueRange
      const y = padding.top + chartHeight * (1 - normalizedValue)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw Y-axis labels (value)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    for (let i = 0; i <= numGridLines; i++) {
      const value = maxValue - (valueRange / numGridLines) * i
      const y = padding.top + (chartHeight / numGridLines) * i
      const label = `$${Math.round(value).toLocaleString()}`
      ctx.fillText(label, padding.left - 10, y)
    }

    // Draw X-axis labels (time)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const numTimeLabels = Math.min(6, dataLength)
    for (let i = 0; i < numTimeLabels; i++) {
      const index = Math.floor((dataLength - 1) * (i / (numTimeLabels - 1 || 1)))
      const x = padding.left + (chartWidth / (dataLength - 1 || 1)) * index
      const point = filteredData[index]
      const date = new Date(point.timestamp)
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ctx.fillText(label, x, logicalHeight - padding.bottom + 10)
    }

    isDrawingRef.current = false
  }, [portfolioHistory, timeFilter, dimensions])

  return (
    <div ref={containerRef} className="portfolio-chart-container">
      <canvas 
        ref={canvasRef} 
        className="portfolio-chart-canvas"
      />
    </div>
  )
}
