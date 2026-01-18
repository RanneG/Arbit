'use client'

import { useState, useEffect } from 'react'
import { Card as CardType, Rarity } from '@/types/Card'
import { getCosmicRank, getCosmicTradeData, type CosmicTradeData, Rarity as CalculatorRarity } from '@/lib/cardRarityCalculator'
import './styles/Card.css'

// Map Card Rarity enum (lowercase) to Calculator Rarity enum (uppercase)
function mapRarityToCalculator(cardRarity: Rarity): CalculatorRarity {
  const rarityMap: Record<string, CalculatorRarity> = {
    'common': CalculatorRarity.COMMON,
    'uncommon': CalculatorRarity.RARE, // Map uncommon to rare for calculator
    'rare': CalculatorRarity.RARE,
    'epic': CalculatorRarity.EPIC,
    'legendary': CalculatorRarity.LEGENDARY,
  }
  return rarityMap[cardRarity.toLowerCase()] || CalculatorRarity.COMMON
}

interface CardProps {
  card: CardType & {
    tradeData?: {
      roiPercent: number
      holdDays: number
      notionalUSD: number
      direction: 'LONG' | 'SHORT'
      pair: string
      profit?: number
    }
  }
  onPress?: () => void
  size?: 'small' | 'medium' | 'large'
}

export default function Card({ card, onPress, size = 'medium' }: CardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(card.imageUrl || null)
  
  // Reset image error when card changes
  useEffect(() => {
    setImageError(false)
    setImageSrc(card.imageUrl || null)
  }, [card.imageUrl])

  const getRarityColors = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 'linear-gradient(135deg, #FFD700, #FF8C00, #FF4500)'
      case Rarity.EPIC:
        return 'linear-gradient(135deg, #9B59B6, #8E44AD, #6C3483)'
      case Rarity.RARE:
        return 'linear-gradient(135deg, #3498DB, #2980B9, #1F618D)'
      case Rarity.UNCOMMON:
        return 'linear-gradient(135deg, #2ECC71, #27AE60, #1E8449)'
      case Rarity.COMMON:
        return 'linear-gradient(135deg, #95A5A6, #7F8C8D, #566573)'
      default:
        return 'linear-gradient(135deg, #34495E, #2C3E50, #1A252F)'
    }
  }

  const getRarityEmoji = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return '👑'
      case Rarity.EPIC:
        return '💜'
      case Rarity.RARE:
        return '💎'
      case Rarity.UNCOMMON:
        return '✨'
      case Rarity.COMMON:
        return '⭐'
      default:
        return '⚪'
    }
  }

  const getRarityLabel = (rarity: Rarity): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1)
  }

  const getRarityNumber = (rarity: Rarity): number => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 5
      case Rarity.EPIC:
        return 4
      case Rarity.RARE:
        return 3
      case Rarity.UNCOMMON:
        return 2
      case Rarity.COMMON:
        return 1
      default:
        return 0
    }
  }

  const getSizeMultiplier = (): number => {
    switch (size) {
      case 'small':
        return 0.9  // Optimized for better space utilization
      case 'large':
        return 2.0  // For detail view
      default:
        return 1.2  // Optimized medium size for grid layout
    }
  }

  const sizeMultiplier = getSizeMultiplier()
  const gradientStyle = {
    background: getRarityColors(card.rarity),
  }

  // Responsive sizing with aspect ratio
  const aspectRatio = 5 / 7 // Width:Height ratio (approximately 300:420)
  
  const cardStyle: React.CSSProperties = {
    transition: 'all 0.3s ease',
  }

  if (size === 'large') {
    // Large cards: fixed max width, responsive
    cardStyle.width = '100%'
    cardStyle.maxWidth = '700px'
    cardStyle.aspectRatio = aspectRatio.toString()
    cardStyle.height = 'auto'
  } else {
    // Small/Medium cards in grid: fill container, maintain aspect ratio
    cardStyle.width = '100%'
    cardStyle.aspectRatio = aspectRatio.toString()
    cardStyle.height = 'auto'
    cardStyle.maxWidth = '100%'
  }

  // Get cosmic trade data if available
  const cosmicData: CosmicTradeData | null = card.tradeData ? (() => {
    try {
      const rarityEnum = mapRarityToCalculator(card.rarity)
      const profitUSD = card.tradeData.profit || Math.abs((card.tradeData.roiPercent / 100) * card.tradeData.notionalUSD)
      return getCosmicTradeData(card.tradeData, rarityEnum, profitUSD)
    } catch {
      return null
    }
  })() : null

  // Always show nebula background for cosmic-themed cards (based on rarity)
  // Cards with tradeData get additional cosmic data, but all cards get nebula backgrounds
  const rarityForNebula = card.rarity.toUpperCase()
  
  const CardContent = (
    <div className={`card-container cosmic-card rarity-${card.rarity.toLowerCase()}`} style={cardStyle}>
      <div className="card-gradient" style={gradientStyle}>
        <div className="card-border-glow"></div>
        <div className={`nebula-background`} data-rarity={rarityForNebula}></div>
        <div className="card-content">
          <div className="rarity-badge">
            <span className="rarity-emoji">{getRarityEmoji(card.rarity)}</span>
            <span className="rarity-text">
              {cosmicData ? `⭐ ${cosmicData.cosmicRank} ⭐` : getRarityLabel(card.rarity)}
            </span>
            {!cosmicData && <span className="rarity-number">#{getRarityNumber(card.rarity)}</span>}
          </div>

          <div className="image-container">
            {card.imageUrl ? (
              <img 
                src={imageSrc || card.imageUrl} 
                alt={card.name} 
                className="card-image"
                style={{ display: imageError ? 'none' : 'block' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  const currentSrc = img.src
                  
                  // Try PNG if JPG fails
                  if (currentSrc.includes('.jpg') && !currentSrc.includes('.png')) {
                    const pngUrl = currentSrc.replace('.jpg', '.png')
                    setImageSrc(pngUrl)
                    return
                  }
                  
                  setImageError(true)
                }}
                onLoad={() => {
                  setImageError(false)
                }}
              />
            ) : null}
            <div className="placeholder-image" style={{ display: (!card.imageUrl || imageError) ? 'flex' : 'none' }}>
              <span className="placeholder-name">{card.name}</span>
              <span className="placeholder-subtitle">Image Coming Soon</span>
            </div>
            <div className="image-overlay"></div>
          </div>

          <div className="card-info">
            <div className={`card-name ${cosmicData ? 'cosmic-ship-name' : ''}`}>
              {cosmicData ? `🚀 ${cosmicData.shipName}` : card.name}
            </div>
            <div className="card-title">{card.title || (cosmicData ? cosmicData.shipName : card.name)}</div>

            {/* Description or Mission Log - Show in preview, larger in detail view */}
            {(cosmicData?.missionLog || card.description) && (
              <div className={`description-container mission-log ${size === 'large' ? 'large-description' : 'preview-description'}`}>
                <p className={`description-text ${size === 'large' ? 'large-description-text' : ''}`}>
                  {cosmicData ? `"${cosmicData.missionLog}"` : card.description}
                </p>
              </div>
            )}

            {/* Stats - Only show in large/detail view */}
            {size === 'large' && (
              <div className={`stats-container large-stats`}>
                <div className="stat-row" title="Buy Up: Profit when prices rise">
                  <span className="stat-label large-stat-label">📈 Buy Up</span>
                  <span className="stat-value large-stat-value">{card.stats.longPosition}</span>
                </div>
                <div className="stat-row" title="Sell Down: Profit when prices fall">
                  <span className="stat-label large-stat-label">📉 Sell Down</span>
                  <span className="stat-value large-stat-value">{card.stats.shortPosition}</span>
                </div>
                <div className="stat-row" title="Risk Power: How much you can control with your money">
                  <span className="stat-label large-stat-label">⚖️ Risk Power</span>
                  <span className="stat-value large-stat-value">{card.stats.leverage}</span>
                </div>
                <div className="stat-row" title="Market Smarts: Understanding market trends">
                  <span className="stat-label large-stat-label">🧠 Market Smarts</span>
                  <span className="stat-value large-stat-value">{card.stats.marketIQ}</span>
                </div>
              </div>
            )}

            <div className={`faction-badge sector-badge ${size === 'large' ? 'large-faction' : ''}`}>
              {cosmicData ? `**${cosmicData.sector}**` : card.faction.charAt(0).toUpperCase() + card.faction.slice(1)}
            </div>
          </div>
        </div>

        <div className="stars-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  if (onPress) {
    return (
      <div className="card-wrapper clickable" onClick={onPress}>
        {CardContent}
      </div>
    )
  }

  return <div className="card-wrapper">{CardContent}</div>
}
