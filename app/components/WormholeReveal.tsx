'use client'

import { useState, useEffect } from 'react'
import Card from './Card'
import { Card as CardType } from '@/types/Card'
import './styles/WormholeReveal.css'

interface WormholeRevealProps {
  card: CardType
  onClose?: () => void
  isOpen: boolean
}

export default function WormholeReveal({ card, onClose, isOpen }: WormholeRevealProps) {
  const [animationPhase, setAnimationPhase] = useState<'closed' | 'opening' | 'revealing' | 'complete'>('closed')
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Start animation sequence
      setAnimationPhase('opening')
      
      // After wormhole opens, start revealing card
      setTimeout(() => {
        setAnimationPhase('revealing')
        setShowCard(true)
      }, 800)

      // After card is revealed, mark complete
      setTimeout(() => {
        setAnimationPhase('complete')
      }, 2000)
    } else {
      // Reset when closed
      setAnimationPhase('closed')
      setShowCard(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="wormhole-overlay" onClick={onClose}>
      <div className={`wormhole-container ${animationPhase}`}>
        {/* Wormhole - spinning portal effect (only visible during opening) */}
        {animationPhase === 'opening' && (
          <div className="wormhole">
            <div className="wormhole-ring ring-1"></div>
            <div className="wormhole-ring ring-2"></div>
            <div className="wormhole-ring ring-3"></div>
            <div className="wormhole-core"></div>
          </div>
        )}

        {/* Card emerging from wormhole */}
        {showCard && (
          <div className={`card-emerging ${animationPhase}`}>
            <Card card={card} size="large" />
          </div>
        )}

        {/* Success message */}
        {animationPhase === 'complete' && (
          <div className="reveal-success-message">
            <h2 className="success-title">🌌 CARD ACQUIRED</h2>
            <p className="success-subtitle">Added to your collection</p>
            {onClose && (
              <button className="close-reveal-button" onClick={onClose}>
                Add to Cosmic Archives
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

