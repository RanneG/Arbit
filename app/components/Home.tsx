'use client'

import { useState } from 'react'
import WalletConnect from './WalletConnect'
import Card from './Card'
import { Card as CardType, Rarity, Faction } from '@/types/Card'
import './styles/Home.css'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [demoCard, setDemoCard] = useState<CardType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address || null)
  }

  const handleGenerateDemoCard = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/bot-demo')
      const data = await response.json()

      if (data.rarity && data.tradeId) {
        // Map API rarity (uppercase string) to Rarity enum (lowercase)
        const rarityMap: Record<string, Rarity> = {
          'COMMON': Rarity.COMMON,
          'RARE': Rarity.RARE,
          'LEGENDARY': Rarity.LEGENDARY,
        }

        const rarity = rarityMap[data.rarity] || Rarity.COMMON

        // Create a demo card object
        const newDemoCard: CardType = {
          id: data.tradeId,
          name: 'Demo Card',
          title: `Generated ${data.rarity} Card`,
          rarity: rarity,
          faction: Faction.COSMIC, // Default faction
          stats: {
            longPosition: Math.floor(Math.random() * 100),
            shortPosition: Math.floor(Math.random() * 100),
            leverage: Math.floor(Math.random() * 100),
            marketIQ: Math.floor(Math.random() * 100),
          },
          description: `This is a demo card generated from trade data. ROI: ${data.tradeData.roi}%, Stake: $${data.tradeData.stakeAmount}`,
        }

        setDemoCard(newDemoCard)
      }
    } catch (error) {
      console.error('Error generating demo card:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        {/* Logo Section */}
        <div className="logo-container">
          <div className="cards-container">
            {/* Back Card */}
            <div className="trading-card card-back">
              <div className="bitcoin-symbol">₿</div>
            </div>
            {/* Middle Card */}
            <div className="trading-card card-middle"></div>
            {/* Front Card with A */}
            <div className="trading-card card-front">
              <div className="logo-letter">A</div>
            </div>
          </div>
          <h1 className="logo-text">ARBIT</h1>
          <p className="tagline">Trading Cards</p>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to ARBIT</h2>
          <p className="welcome-text">
            Collect, trade, and master trading card strategies. Learn crypto trading concepts while building your ultimate collection.
          </p>
        </div>

        {/* Wallet Connection Section - Centered */}
        <div className="wallet-connect-section">
          <WalletConnect onConnected={handleWalletConnected} />
        </div>

        {/* Generate Demo Card Button */}
        <div className="demo-card-section">
          <button
            className="generate-demo-button"
            onClick={handleGenerateDemoCard}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Demo Card'}
          </button>
        </div>

        {/* Demo Card Display */}
        {demoCard && (
          <div className="demo-card-container">
            <Card card={demoCard} size="medium" />
          </div>
        )}
      </div>
    </div>
  )
}
