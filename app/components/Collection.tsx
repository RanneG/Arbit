'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from './Card'
import { Card as CardType, UserCollection } from '@/types/Card'
import { mockCards } from '@/lib/mockCards'
import './styles/Collection.css'

export default function Collection() {
  const router = useRouter()
  const [collection, setCollection] = useState<UserCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)

  const copyWalletAddress = async () => {
    if (collection) {
      try {
        await navigator.clipboard.writeText(collection.walletAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        // Silently fail copy operation
      }
    }
  }

  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress')
    
    const createMockCollection = (address: string): UserCollection => ({
      walletAddress: address,
      cards: mockCards.slice(0, 6),
      totalCards: 6,
      totalValue: mockCards.slice(0, 6).reduce((sum, card) => sum + (card.marketValue || 0), 0),
    })

    const loadWallet = async () => {
      try {
        const authResponse = await fetch('/api/authenticate', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (authResponse.ok) {
          const authData = await authResponse.json()
          if (authData.walletAddress) {
            setWalletAddress(authData.walletAddress)
            loadCollection(authData.walletAddress)
            return
          }
        }
        
        const mockWallet = storedWallet || '0x1234567890123456789012345678901234567890'
        setWalletAddress(mockWallet)
        loadCollection(mockWallet)
      } catch (error) {
        const mockWallet = '0x1234567890123456789012345678901234567890'
        setWalletAddress(mockWallet)
        loadCollection(mockWallet)
      }
    }

    const loadCollection = async (address: string) => {
      try {
        const response = await fetch(`/api/users/${address}/cards`)
        if (response.ok) {
          const data = await response.json()
          setCollection(data)
        } else {
          setCollection(createMockCollection(address))
        }
      } catch (error) {
        setCollection(createMockCollection(address))
      } finally {
        setLoading(false)
      }
    }

    loadWallet()
  }, [])

  const handleCardPress = (card: CardType) => {
    router.push(`/card/${card.id}`)
  }

  if (loading) {
    return (
      <div className="screen-container">
        <div className="loading-container">
          <p className="loading-text">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (!collection || collection.cards.length === 0) {
    return (
      <div className="screen-container">
        <div className="empty-container">
          <h2 className="empty-title">No Cards Yet</h2>
          <p className="empty-text">
            Start collecting space-themed cards to build your collection!
          </p>
          <button className="browse-button" onClick={() => router.push('/gallery')}>
            Browse Cards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <div className="header">
        <div className="header-title-container">
          <h1 className="header-title">Collection</h1>
          <div className="info-button-container">
            <button
              className="info-button"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              aria-label="Information about collection"
            >
              <span className="info-icon">i</span>
            </button>
            {showInfoTooltip && (
              <div className="info-tooltip">
                View all the trading cards you own. See your total cards, collection value, and browse through your personal card collection.
              </div>
            )}
          </div>
        </div>
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-label">Total Cards</div>
            <div className="stat-value">{collection.totalCards}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Collection Value</div>
            <div className="stat-value">${collection.totalValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="wallet-container">
          <div className="wallet-label">Wallet</div>
          <div className="wallet-address-container">
            <div className="wallet-address">
              {collection.walletAddress.slice(0, 6)}...{collection.walletAddress.slice(-4)}
            </div>
            <button className="copy-button" onClick={copyWalletAddress}>
              <span className="copy-icon">{copied ? '✓' : '📋'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {collection.cards.map((card) => (
          <Card key={card.id} card={card} onPress={() => handleCardPress(card)} size="small" />
        ))}
      </div>
    </div>
  )
}
