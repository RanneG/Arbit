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
  const [isDispersing, setIsDispersing] = useState(false)

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address || null)
  }

  const handleLogoClick = () => {
    setIsDispersing(true)
    // Reset animation after it completes
    setTimeout(() => {
      setIsDispersing(false)
    }, 1500) // Match animation duration
  }

  const handleMintCard = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    setIsGenerating(true)
    try {
      // Mint Nexus Prime card with real Pear Protocol trade
      const response = await fetch('/api/mint-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: 'nexus-prime',
          userWallet: walletAddress,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.card) {
        // Display the minted card with real trade orderId
        setDemoCard(data.card)
        console.log('✅ Card minted! Trade Order ID:', data.trade.orderId)
      } else {
        // Show error message
        const errorMsg = data.error || 'Failed to mint card'
        alert(`Mint failed: ${errorMsg}`)
        console.error('Mint card error:', data)
      }
    } catch (error) {
      console.error('Error minting card:', error)
      alert('Failed to mint card. Please check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Legacy demo card function (keeping for backward compatibility)
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
          <div 
            className={`cards-container ${isDispersing ? 'dispersing' : ''}`}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            {/* Back Card */}
            <div className={`trading-card card-back ${isDispersing ? 'disperse-back' : ''}`}>
              <div className="bitcoin-symbol">₿</div>
            </div>
            {/* Middle Card */}
            <div className={`trading-card card-middle ${isDispersing ? 'disperse-middle' : ''}`}></div>
            {/* Front Card with A */}
            <div className={`trading-card card-front ${isDispersing ? 'disperse-front' : ''}`}>
              <div className="logo-letter">A</div>
            </div>
          </div>
          <h1 className="logo-text" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>ARBIT</h1>
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

        {/* Mint Card Button - Trade-to-Mint Integration */}
        <div className="demo-card-section">
          <button
            className="generate-demo-button"
            onClick={handleMintCard}
            disabled={isGenerating || !walletAddress}
          >
            {isGenerating ? 'Minting...' : 'Mint & Trade (Nexus Prime)'}
          </button>
          {!walletAddress && (
            <p className="text-yellow-400 text-sm mt-2 text-center">
              Connect wallet to mint card via real trade
            </p>
          )}
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
